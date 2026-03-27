/**
 * InnieAI Proposal Follow-Up Script
 * Run: npx tsx scripts/proposal-followup.ts
 * GitHub Action: proposal-followup.yml (daily 11am PST)
 *
 * Automatically emails prospects who viewed a proposal 48+ hours ago
 * but haven't accepted yet — removes this from the manual action queue.
 */

import { createScriptClient } from '../src/lib/supabase/server'
import { sendEmail, sendOwnerAlert } from '../src/lib/resend'

const CALCOM_LINK = process.env.CALCOM_LINK ?? 'https://cal.com/innieai'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'

async function main() {
  const supabase = createScriptClient()
  const twoDaysAgo = new Date(Date.now() - 48 * 3600000).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  // Proposals that were viewed 48h+ ago but not accepted, and haven't had a follow-up email in 7 days
  const { data: stale } = await supabase
    .from('proposals')
    .select('*')
    .eq('status', 'Viewed')
    .lt('first_viewed_at', twoDaysAgo)
    .or(`follow_up_sent_at.is.null,follow_up_sent_at.lt.${sevenDaysAgo}`)
    .order('first_viewed_at', { ascending: true })
    .limit(10)

  if (!stale || stale.length === 0) {
    console.log('No stale proposals to follow up on.')
    return
  }

  let sent = 0

  for (const proposal of stale) {
    if (!proposal.client_email) continue

    const daysSinceViewed = Math.round(
      (Date.now() - new Date(proposal.first_viewed_at).getTime()) / 86400000
    )

    const proposalUrl = `${BASE_URL}/proposal/${proposal.id}`

    const message = `Hi ${proposal.client_name?.split(' ')[0] ?? 'there'},

Just checking in — I noticed you had a chance to review the InnieAI proposal for ${proposal.company ?? 'your business'} ${daysSinceViewed} days ago.

I want to make sure you have everything you need to make a decision. If you have any questions about the plan, pricing, or what the setup process looks like, I'm happy to jump on a quick call.

View your proposal again: ${proposalUrl}
Book a 15-minute Q&A: ${CALCOM_LINK}

No pressure at all — just want to make sure this is the right fit before the spot is taken.

The InnieAI Team`

    await sendEmail({
      to: proposal.client_email,
      subject: `Quick follow-up on your InnieAI proposal, ${proposal.client_name?.split(' ')[0] ?? ''}`,
      text: message,
    })

    // Record follow-up timestamp so we don't spam
    await supabase
      .from('proposals')
      .update({ follow_up_sent_at: new Date().toISOString() })
      .eq('id', proposal.id)

    sent++
    console.log(`✓ Follow-up sent to ${proposal.client_name} (${proposal.company})`)
  }

  if (sent > 0) {
    await sendOwnerAlert(
      `📩 ${sent} proposal follow-up(s) sent`,
      `Auto follow-up sent to ${sent} prospects who viewed proposals 48h+ ago.\n\nView proposals: ${BASE_URL}/admin/proposals`
    )
  }

  console.log(`\nDone. Follow-ups sent: ${sent}`)
}

main().catch(async (err) => {
  console.error('Proposal follow-up script failed:', err)
  await sendOwnerAlert(
    '⚠️ Proposal Follow-Up Script Failed',
    `Error: ${err instanceof Error ? err.message : String(err)}`
  )
  process.exit(1)
})
