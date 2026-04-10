/**
 * InnieAI Lead Re-Engagement Script
 * Run: npx tsx scripts/re-engagement.ts
 * GitHub Action: re-engagement.yml (weekly, Wednesday 9am PST)
 *
 * Targets leads who:
 * 1. Completed the full 4-step sequence (sequence_step = 4)
 * 2. Never replied
 * 3. Last email was sent 30+ days ago
 *
 * Sends a single "checking back in" email and marks them re-engaged.
 * If still no reply after this, status moves to Invalid (they're cold).
 */

import { createScriptClient } from '../src/lib/supabase/server'
import { sendEmail, sendOwnerAlert } from '../src/lib/resend'
import type { Lead } from '../src/types/database'

const CALCOM_LINK = process.env.CALCOM_LINK ?? 'https://cal.com/innieai'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'
const MAX_PER_RUN = 20

const NICHE_PAIN: Record<string, string> = {
  dental: 'Most dental practices we talk to are losing 3–5 new patient inquiries per week to slow follow-up.',
  medspa: 'Most med spas we work with are spending $3–5k/month on ads with no follow-up system to convert the leads.',
  gym: 'The average gym loses 40–50% of members annually because no one follows up after month 2.',
  contractor: 'Contractors lose jobs to slower competitors who respond first — especially when they\'re on a job site.',
  'real-estate': 'Real estate leads go cold in under 5 minutes. Without instant response, someone else closes the deal.',
  law: 'Law firms miss 60% of inbound calls, and most never call back within the hour leads expect.',
}

function getReEngagementEmail(lead: Lead): { subject: string; body: string } {
  const firstName = lead.contact_name?.split(' ')[0] ?? lead.company_name
  const pain = NICHE_PAIN[lead.niche] ?? 'Most local businesses lose significant revenue to slow follow-up and manual processes.'

  return {
    subject: `${lead.company_name} — one more thought`,
    body: `Hi ${firstName},

I reached out a little while back about automating lead follow-up and reputation management for ${lead.company_name}.

I won't keep emailing — this is my last one. But before I close the loop, I wanted to share one data point:

${pain}

We've helped businesses in ${lead.city} fix exactly this in under 14 days. No contracts, no tech setup on your end.

If the timing is better now, I'd love 20 minutes: ${CALCOM_LINK}

If not, totally understood — no hard feelings.

Best,
The InnieAI Team

P.S. If you'd rather not hear from us again, you can unsubscribe here: ${BASE_URL}/api/email/unsubscribe?token=${lead.id}`,
  }
}

async function main() {
  const supabase = createScriptClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()

  // Leads who completed sequence, never replied, last email was 30+ days ago
  const { data: lastStepEmails } = await supabase
    .from('email_sequences')
    .select('lead_id, sent_at')
    .eq('step', 4)
    .not('sent_at', 'is', null)
    .lt('sent_at', thirtyDaysAgo)
    .eq('replied', false)
    .eq('unsubscribed', false)

  if (!lastStepEmails || lastStepEmails.length === 0) {
    console.log('No leads ready for re-engagement.')
    return
  }

  const leadIds = lastStepEmails.map((e) => e.lead_id as string)

  // Filter to only Contacted status (not already converted or invalid)
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .in('id', leadIds)
    .eq('status', 'Contacted')
    .not('email', 'is', null)
    .eq('re_engaged', false)
    .limit(MAX_PER_RUN)

  if (!leads || leads.length === 0) {
    console.log('No eligible leads for re-engagement.')
    return
  }

  let sent = 0

  for (const lead of leads as Lead[]) {
    if (!lead.email) continue

    const { subject, body } = getReEngagementEmail(lead)

    // Insert sequence record
    const { data: seqRecord } = await supabase
      .from('email_sequences')
      .insert({
        lead_id: lead.id,
        step: 5, // step 5 = re-engagement
        subject,
        body,
        sent_at: null,
      })
      .select()
      .single()

    if (!seqRecord) continue

    const trackingHtml = `<html><body><pre style="font-family:sans-serif;white-space:pre-wrap">${body}</pre><img src="${BASE_URL}/api/track/open?id=${seqRecord.id}" width="1" height="1" /></body></html>`

    const result = await sendEmail({
      to: lead.email,
      subject,
      text: body,
      html: trackingHtml,
    })

    if (result?.id) {
      await supabase
        .from('email_sequences')
        .update({ sent_at: new Date().toISOString(), resend_id: result.id })
        .eq('id', seqRecord.id)

      // Mark lead as re-engaged so we don't send again
      await supabase
        .from('leads')
        .update({ re_engaged: true })
        .eq('id', lead.id)

      sent++
      console.log(`✓ Re-engagement sent to ${lead.company_name}`)
    }

    await new Promise((r) => setTimeout(r, 500))
  }

  // Mark leads that were already re_engaged=true (from a prior run) but still no reply as Invalid
  const justSentIds = new Set((leads as Lead[]).map((l) => l.id))
  const exhaustedIds = leadIds.filter((id) => !justSentIds.has(id))

  if (exhaustedIds.length > 0) {
    // Only mark exhausted if re_engaged=true (already got the re-engagement email)
    const { data: exhausted } = await supabase
      .from('leads')
      .select('id')
      .in('id', exhaustedIds)
      .eq('status', 'Contacted')
      .eq('re_engaged', true)

    if (exhausted && exhausted.length > 0) {
      await supabase
        .from('leads')
        .update({ status: 'Invalid', notes: 'Exhausted 5-step sequence with no reply' })
        .in('id', exhausted.map((l) => l.id as string))
      console.log(`Marked ${exhausted.length} exhausted leads as Invalid`)
    }
  }

  if (sent > 0) {
    await sendOwnerAlert(
      `🔁 ${sent} re-engagement email(s) sent`,
      `Sent re-engagement emails to ${sent} leads who completed the full sequence with no reply.\n\nView leads: ${BASE_URL}/admin/leads`
    )
  }

  console.log(`\nDone. Re-engagement emails sent: ${sent}`)
}

main().catch(async (err) => {
  console.error('Re-engagement script failed:', err)
  await sendOwnerAlert(
    '⚠️ Re-Engagement Script Failed',
    `Error: ${err instanceof Error ? err.message : String(err)}`
  )
  process.exit(1)
})
