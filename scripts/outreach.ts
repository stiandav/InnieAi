/**
 * InnieAI Email Outreach Script
 * Run: npx tsx scripts/outreach.ts
 * GitHub Action: daily-outreach.yml (9am PST daily)
 *
 * Template priority: DB variant (email_template_variants) → static fallback
 * The template-optimizer script improves variants weekly based on open/reply rates.
 */

import { createScriptClient } from '../src/lib/supabase/server'
import { sendEmail, sendOwnerAlert } from '../src/lib/resend'
import { getDay1Email } from '../src/lib/email-templates/outreach/day1'
import { getDay3Email } from '../src/lib/email-templates/outreach/day3'
import { getDay7Email } from '../src/lib/email-templates/outreach/day7'
import { getDay14Email } from '../src/lib/email-templates/outreach/day14'
import {
  generateOutreachOpener,
  generateNicheInsight,
} from '../src/lib/anthropic'
import type { Lead } from '../src/types/database'

const CALCOM_LINK = process.env.CALCOM_LINK ?? 'https://cal.com/innieai'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'

// Load MAX_EMAILS_PER_DAY from the settings table so the growth engine can
// scale volume automatically. Falls back to env var, then hardcoded safe default.
async function getMaxEmailsPerDay(supabase: ReturnType<typeof createScriptClient>): Promise<number> {
  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'max_emails_per_day')
      .single()
    if (data?.value) return Math.max(1, parseInt(data.value))
  } catch { /* table may not exist yet */ }
  return parseInt(process.env.MAX_EMAILS_PER_DAY ?? '10')
}

// Step timing: days since last email in sequence
const STEP_DAYS: Record<number, number> = {
  1: 0,  // Day 1: send immediately (step 0 → 1)
  2: 3,  // Day 3: 3 days after step 1
  3: 7,  // Day 7: 7 days after step 1
  4: 14, // Day 14: 14 days after step 1
  5: 30, // Re-engagement: 30 days after step 4
}

// Substitute {{variable}} placeholders in DB-stored template strings
function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
}

type TemplateVariant = { subject: string; body: string }

// Load all active variants once, keyed by "step:niche" and "step:all"
async function loadActiveVariants(
  supabase: ReturnType<typeof createScriptClient>
): Promise<Map<string, TemplateVariant>> {
  const map = new Map<string, TemplateVariant>()
  try {
    const { data } = await supabase
      .from('email_template_variants')
      .select('step, niche, subject, body')
      .eq('is_active', true)
    for (const row of data ?? []) {
      map.set(`${row.step}:${row.niche}`, { subject: row.subject, body: row.body })
    }
  } catch {
    // Table may not exist yet — degrade gracefully to static templates
  }
  return map
}

function getVariantForLead(
  variants: Map<string, TemplateVariant>,
  step: number,
  niche: string
): TemplateVariant | null {
  return variants.get(`${step}:${niche}`) ?? variants.get(`${step}:all`) ?? null
}

async function sendFailureAlert(error: string) {
  await sendOwnerAlert(
    '⚠️ InnieAI Outreach Script Failed',
    `The daily outreach script failed.\n\nError:\n${error}\n\nTimestamp: ${new Date().toISOString()}`
  )
}

// Built from batch-fetched sequences — no per-lead DB queries in the loop
function shouldSendStep(
  lead: Lead,
  step: number,
  prevSequences: Map<string, { sent_at: string; unsubscribed: boolean; bounced: boolean; replied: boolean }>
): boolean {
  if (step === 1) return lead.sequence_step === 0

  const prev = prevSequences.get(`${lead.id}:${step - 1}`)
  if (!prev?.sent_at) return false
  if (prev.unsubscribed || prev.bounced || prev.replied) return false

  const daysSince = (Date.now() - new Date(prev.sent_at).getTime()) / 86400000
  return daysSince >= (STEP_DAYS[step] ?? 999)
}

async function main() {
  const supabase = createScriptClient()
  let emailsSent = 0

  const MAX_EMAILS_PER_DAY = await getMaxEmailsPerDay(supabase)
  console.log(`Daily cap: ${MAX_EMAILS_PER_DAY} emails`)

  // Load optimized template variants from DB (if any exist)
  const variants = await loadActiveVariants(supabase)
  if (variants.size > 0) {
    console.log(`Loaded ${variants.size} optimized template variant(s) from DB`)
  }

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .not('email', 'is', null)
    .in('status', ['Lead', 'Contacted'])
    .lt('sequence_step', 4)
    .order('score', { ascending: false })
    .limit(100)

  if (!leads || leads.length === 0) {
    console.log('No leads ready for outreach.')
    return
  }

  const leadIds = (leads as Lead[]).map((l) => l.id)

  // Batch fetch all sequence data — avoids N+1 queries in the loop
  const [{ data: unsubRows }, { data: sentRows }, { data: prevRows }] = await Promise.all([
    supabase.from('email_sequences').select('lead_id').in('lead_id', leadIds).eq('unsubscribed', true),
    supabase.from('email_sequences').select('lead_id, step').in('lead_id', leadIds).not('sent_at', 'is', null),
    supabase.from('email_sequences').select('lead_id, step, sent_at, unsubscribed, bounced, replied').in('lead_id', leadIds),
  ])

  // Map of "lead_id:step" → sequence row for O(1) lookup in loop
  const prevSequences = new Map<string, { sent_at: string; unsubscribed: boolean; bounced: boolean; replied: boolean }>()
  for (const row of prevRows ?? []) {
    if (row.sent_at) prevSequences.set(`${row.lead_id}:${row.step}`, row as { sent_at: string; unsubscribed: boolean; bounced: boolean; replied: boolean })
  }

  const unsubSet = new Set((unsubRows ?? []).map((r) => r.lead_id as string))
  const sentSet = new Set((sentRows ?? []).map((r) => `${r.lead_id}:${r.step}`))

  for (const lead of leads as Lead[]) {
    if (emailsSent >= MAX_EMAILS_PER_DAY) break
    if (!lead.email) continue
    if (unsubSet.has(lead.id)) continue

    const nextStep = lead.sequence_step + 1
    if (sentSet.has(`${lead.id}:${nextStep}`)) continue

    const canSend = shouldSendStep(lead, nextStep, prevSequences)
    if (!canSend) continue

    const unsubUrl = `${BASE_URL}/api/email/unsubscribe?token=${lead.id}`

    // Check for an AI-optimized variant first, fall back to static template
    const variant = getVariantForLead(variants, nextStep, lead.niche)

    // Pre-generate AI content with fallbacks — never skip a lead due to AI failure
    let opener = ''
    let insight = ''
    if (nextStep === 1) {
      try {
        opener = await generateOutreachOpener(lead.company_name, lead.niche, lead.city, lead.rating, lead.review_count)
      } catch (err) {
        console.warn(`Opener generation failed for ${lead.company_name}, using fallback:`, (err as Error).message)
      }
    }
    if (nextStep === 2) {
      try {
        insight = await generateNicheInsight(lead.niche, lead.city)
      } catch (err) {
        console.warn(`Insight generation failed for ${lead.company_name}, using fallback:`, (err as Error).message)
      }
    }

    let emailContent: { subject: string; body: string }
    if (variant) {
      // Fill {{placeholders}} in the stored variant
      const templateVars: Record<string, string> = {
        first_name: lead.contact_name?.split(' ')[0] ?? lead.company_name,
        company_name: lead.company_name,
        city: lead.city,
        niche: lead.niche,
        calcom_link: CALCOM_LINK,
        unsub_link: unsubUrl,
        personalized_opener: opener,
        niche_insight: insight,
      }
      emailContent = {
        subject: fillTemplate(variant.subject, templateVars),
        body: fillTemplate(variant.body, templateVars),
      }
    } else {
      // Static templates
      if (nextStep === 1) {
        emailContent = getDay1Email(lead, opener, CALCOM_LINK)
      } else if (nextStep === 2) {
        emailContent = getDay3Email(lead, insight, CALCOM_LINK)
      } else if (nextStep === 3) {
        emailContent = getDay7Email(lead, CALCOM_LINK)
      } else {
        emailContent = getDay14Email(lead, CALCOM_LINK)
      }
    }

    // Pre-generate a UUID so the tracking pixel and reply-to work before the DB insert
    const seqId = crypto.randomUUID()
    const trackingHtml = `<html><body><pre style="font-family:sans-serif;white-space:pre-wrap">${emailContent.body}</pre><img src="${BASE_URL}/api/track/open?id=${seqId}" width="1" height="1" /></body></html>`

    // reply+{seqId}@innieai.co — Cloudflare Email Routing catches this, forwards to /api/webhooks/resend-inbound
    const replyToAddr = `reply+${seqId}@innieai.co`

    const result = await sendEmail({
      to: lead.email,
      subject: emailContent.subject,
      text: emailContent.body,
      html: trackingHtml,
      unsubscribeUrl: unsubUrl,
      replyTo: replyToAddr,
    })

    if (result?.id) {
      // Only record in DB after confirmed send — no orphaned null records
      await supabase
        .from('email_sequences')
        .insert({
          id: seqId,
          lead_id: lead.id,
          step: nextStep,
          subject: emailContent.subject,
          body: emailContent.body,
          sent_at: new Date().toISOString(),
          resend_id: result.id,
        })

      await supabase
        .from('leads')
        .update({ sequence_step: nextStep, status: 'Contacted' })
        .eq('id', lead.id)

      emailsSent++
      console.log(`✓ Sent step ${nextStep} to ${lead.company_name} (${lead.email})${variant ? ' [optimized]' : ''}`)
    } else {
      console.warn(`✗ Send failed for ${lead.company_name} (${lead.email})`)
    }

    await new Promise((r) => setTimeout(r, 500))
  }

  console.log(`\nDone. Emails sent: ${emailsSent}`)

  if (process.env.OWNER_EMAIL) {
    await sendEmail({
      to: process.env.OWNER_EMAIL,
      subject: `InnieAI Outreach: ${emailsSent} emails sent today`,
      text: `Daily outreach run complete.\n\nEmails sent: ${emailsSent}\nTimestamp: ${new Date().toISOString()}`,
    })
  }
}

main().catch(async (err) => {
  console.error('Outreach script failed:', err)
  await sendFailureAlert(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
