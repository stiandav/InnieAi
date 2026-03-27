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

const MAX_EMAILS_PER_DAY = 40
const CALCOM_LINK = process.env.CALCOM_LINK ?? 'https://cal.com/innieai'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'

// Step timing: days since last email in sequence
const STEP_DAYS: Record<number, number> = {
  1: 0,  // Day 1: send immediately (step 0 → 1)
  2: 3,  // Day 3: 3 days after step 1
  3: 7,  // Day 7: 7 days after step 1
  4: 14, // Day 14: 14 days after step 1
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

async function shouldSendStep(lead: Lead, step: number, supabase: ReturnType<typeof createScriptClient>): Promise<boolean> {
  if (step === 1) return lead.sequence_step === 0

  const { data: prevEmail } = await supabase
    .from('email_sequences')
    .select('sent_at, unsubscribed, bounced, replied')
    .eq('lead_id', lead.id)
    .eq('step', step - 1)
    .limit(1)
    .single()

  if (!prevEmail?.sent_at) return false
  if (prevEmail.unsubscribed || prevEmail.bounced || prevEmail.replied) return false

  const daysSince = (Date.now() - new Date(prevEmail.sent_at).getTime()) / 86400000
  return daysSince >= STEP_DAYS[step]
}

async function main() {
  const supabase = createScriptClient()
  let emailsSent = 0

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

  // Batch fetch unsubscribed and already-sent to avoid N+1
  const [{ data: unsubRows }, { data: sentRows }] = await Promise.all([
    supabase.from('email_sequences').select('lead_id').in('lead_id', leadIds).eq('unsubscribed', true),
    supabase.from('email_sequences').select('lead_id, step').in('lead_id', leadIds).not('sent_at', 'is', null),
  ])

  const unsubSet = new Set((unsubRows ?? []).map((r) => r.lead_id as string))
  const sentSet = new Set((sentRows ?? []).map((r) => `${r.lead_id}:${r.step}`))

  for (const lead of leads as Lead[]) {
    if (emailsSent >= MAX_EMAILS_PER_DAY) break
    if (!lead.email) continue
    if (unsubSet.has(lead.id)) continue

    const nextStep = lead.sequence_step + 1
    if (sentSet.has(`${lead.id}:${nextStep}`)) continue

    const canSend = await shouldSendStep(lead, nextStep, supabase)
    if (!canSend) continue

    const unsubUrl = `${BASE_URL}/api/email/unsubscribe?token=${lead.id}`

    // Check for an AI-optimized variant first, fall back to static template
    const variant = getVariantForLead(variants, nextStep, lead.niche)

    let emailContent: { subject: string; body: string }
    try {
      if (variant) {
        // Fill {{placeholders}} in the stored variant
        const templateVars: Record<string, string> = {
          first_name: lead.contact_name?.split(' ')[0] ?? lead.company_name,
          company_name: lead.company_name,
          city: lead.city,
          niche: lead.niche,
          calcom_link: CALCOM_LINK,
          unsub_link: unsubUrl,
          personalized_opener: nextStep === 1
            ? await generateOutreachOpener(lead.company_name, lead.niche, lead.city, lead.rating, lead.review_count)
            : '',
          niche_insight: nextStep === 2
            ? await generateNicheInsight(lead.niche, lead.city)
            : '',
        }
        emailContent = {
          subject: fillTemplate(variant.subject, templateVars),
          body: fillTemplate(variant.body, templateVars),
        }
      } else {
        // Static templates
        if (nextStep === 1) {
          const opener = await generateOutreachOpener(lead.company_name, lead.niche, lead.city, lead.rating, lead.review_count)
          emailContent = getDay1Email(lead, opener, CALCOM_LINK)
        } else if (nextStep === 2) {
          const insight = await generateNicheInsight(lead.niche, lead.city)
          emailContent = getDay3Email(lead, insight, CALCOM_LINK)
        } else if (nextStep === 3) {
          emailContent = getDay7Email(lead, CALCOM_LINK)
        } else {
          emailContent = getDay14Email(lead, CALCOM_LINK)
        }
      }
    } catch (err) {
      console.error(`Failed to generate email for ${lead.company_name}:`, err)
      continue
    }

    const { data: seqRecord } = await supabase
      .from('email_sequences')
      .insert({
        lead_id: lead.id,
        step: nextStep,
        subject: emailContent.subject,
        body: emailContent.body,
        sent_at: null,
      })
      .select()
      .single()

    if (!seqRecord) continue

    const trackingHtml = `<html><body><pre style="font-family:sans-serif;white-space:pre-wrap">${emailContent.body}</pre><img src="${BASE_URL}/api/track/open?id=${seqRecord.id}" width="1" height="1" /></body></html>`

    const result = await sendEmail({
      to: lead.email,
      subject: emailContent.subject,
      text: emailContent.body,
      html: trackingHtml,
      unsubscribeUrl: unsubUrl,
    })

    if (result?.id) {
      await supabase
        .from('email_sequences')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', seqRecord.id)

      await supabase
        .from('leads')
        .update({ sequence_step: nextStep, status: 'Contacted' })
        .eq('id', lead.id)

      emailsSent++
      console.log(`✓ Sent step ${nextStep} to ${lead.company_name} (${lead.email})${variant ? ' [optimized]' : ''}`)
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
