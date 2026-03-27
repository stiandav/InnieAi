/**
 * InnieAI Email Outreach Script
 * Run: npx tsx scripts/outreach.ts
 * GitHub Action: daily-outreach.yml (9am PST daily)
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

async function sendFailureAlert(error: string) {
  await sendOwnerAlert(
    '⚠️ InnieAI Outreach Script Failed',
    `The daily outreach script failed.\n\nError:\n${error}\n\nTimestamp: ${new Date().toISOString()}`
  )
}

async function shouldSendStep(lead: Lead, step: number, supabase: ReturnType<typeof createScriptClient>): Promise<boolean> {
  if (step === 1) return lead.sequence_step === 0

  // Check if previous step was sent and enough days have passed
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

  // Leads ready for outreach (have email, not invalid/churned/client)
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

  for (const lead of leads as Lead[]) {
    if (emailsSent >= MAX_EMAILS_PER_DAY) break
    if (!lead.email) continue

    // Check unsubscribed
    const { data: unsub } = await supabase
      .from('email_sequences')
      .select('id')
      .eq('lead_id', lead.id)
      .eq('unsubscribed', true)
      .limit(1)
    if (unsub && unsub.length > 0) continue

    const nextStep = lead.sequence_step + 1

    // Check if already sent this step
    const { data: alreadySent } = await supabase
      .from('email_sequences')
      .select('id')
      .eq('lead_id', lead.id)
      .eq('step', nextStep)
      .not('sent_at', 'is', null)
      .limit(1)
    if (alreadySent && alreadySent.length > 0) continue

    const canSend = await shouldSendStep(lead, nextStep, supabase)
    if (!canSend) continue

    // Generate email content
    let emailContent: { subject: string; body: string }
    try {
      if (nextStep === 1) {
        const opener = await generateOutreachOpener(
          lead.company_name,
          lead.niche,
          lead.city,
          lead.rating,
          lead.review_count
        )
        emailContent = getDay1Email(lead, opener, CALCOM_LINK)
      } else if (nextStep === 2) {
        const insight = await generateNicheInsight(lead.niche, lead.city)
        emailContent = getDay3Email(lead, insight, CALCOM_LINK)
      } else if (nextStep === 3) {
        emailContent = getDay7Email(lead, CALCOM_LINK)
      } else {
        emailContent = getDay14Email(lead, CALCOM_LINK)
      }
    } catch (err) {
      console.error(`Failed to generate email for ${lead.company_name}:`, err)
      continue
    }

    // Add open tracking pixel
    const trackingPixelUrl = `${BASE_URL}/api/track/open`
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

    const trackingHtml = `<html><body><pre style="font-family:sans-serif;white-space:pre-wrap">${emailContent.body}</pre><img src="${trackingPixelUrl}?id=${seqRecord.id}" width="1" height="1" /></body></html>`

    const result = await sendEmail({
      to: lead.email,
      subject: emailContent.subject,
      text: emailContent.body,
      html: trackingHtml,
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
      console.log(`✓ Sent step ${nextStep} to ${lead.company_name} (${lead.email})`)
    }

    // Rate limit
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
