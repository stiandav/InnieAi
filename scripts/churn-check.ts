/**
 * InnieAI Churn Prevention Script
 * Run: npx tsx scripts/churn-check.ts
 * GitHub Action: churn-check.yml (6am PST daily)
 */

import { createScriptClient } from '../src/lib/supabase/server'
import { sendEmail, sendOwnerAlert } from '../src/lib/resend'
import { generateChurnSaveEmail } from '../src/lib/anthropic'
import type { Client } from '../src/types/database'

async function calculateChurnScore(client: Client, supabase: ReturnType<typeof createScriptClient>): Promise<number> {
  let score = 0

  // Days since last portal login
  if (client.last_portal_login) {
    const daysSince = (Date.now() - new Date(client.last_portal_login).getTime()) / 86400000
    if (daysSince > 14) score += 3
  } else {
    // Never logged in
    score += 2
  }

  // Payment failures (from status)
  if (client.status === 'Payment Issue') score += 2

  // Report open rate (last 3 weeks)
  const threeWeeksAgo = new Date(Date.now() - 21 * 86400000).toISOString()
  const { data: reports } = await supabase
    .from('reports')
    .select('sent_at, opened_at')
    .eq('client_id', client.id)
    .gte('sent_at', threeWeeksAgo)

  if (reports && reports.length > 0) {
    const openedCount = reports.filter((r) => r.opened_at).length
    const openRate = openedCount / reports.length
    if (openRate < 0.3) score += 2
  }

  return Math.min(score, 10)
}

async function main() {
  const supabase = createScriptClient()
  const calcomLink = process.env.CALCOM_LINK ?? 'https://cal.com/innieai'

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .in('status', ['Active', 'Onboarding'])

  if (!clients) return

  let savedCount = 0
  const urgentClients: Client[] = []

  for (const client of clients as Client[]) {
    const newScore = await calculateChurnScore(client, supabase)

    // Update churn score
    await supabase
      .from('clients')
      .update({ churn_score: newScore })
      .eq('id', client.id)

    if (newScore >= 7) {
      // Throttle: max one churn email per 7 days per client
      const lastSent = (client as Client & { churn_email_sent_at?: string | null }).churn_email_sent_at
      if (lastSent) {
        const daysSinceLast = (Date.now() - new Date(lastSent).getTime()) / 86400000
        if (daysSinceLast < 7) {
          console.log(`Skipping ${client.company} — churn email sent ${Math.round(daysSinceLast)}d ago`)
          continue
        }
      }

      const daysSinceLogin = client.last_portal_login
        ? Math.round((Date.now() - new Date(client.last_portal_login).getTime()) / 86400000)
        : 30

      let issueSignal = 'not engaging with portal or reports'
      if (client.status === 'Payment Issue') issueSignal = 'recent payment failure'
      if (daysSinceLogin > 14) issueSignal = `hasn't logged in for ${daysSinceLogin} days`

      // Generate personal email with Claude
      let emailBody: string
      try {
        emailBody = await generateChurnSaveEmail({
          clientName: client.name,
          company: client.company,
          niche: client.niche,
          churnScore: newScore,
          daysSinceLogin,
          issueSignal,
        })
      } catch {
        emailBody = `Hi ${client.name.split(' ')[0]},\n\nI wanted to check in personally to make sure everything is going well with your InnieAI setup.\n\nIf there's anything we can improve or any questions you have, I'd love to jump on a quick call: ${calcomLink}\n\nTalk soon,\nThe InnieAI Team`
      }

      await sendEmail({
        to: client.email,
        subject: `Checking in — everything okay at ${client.company}?`,
        text: emailBody,
      })

      await supabase
        .from('clients')
        .update({ churn_email_sent_at: new Date().toISOString() } as Record<string, unknown>)
        .eq('id', client.id)

      savedCount++
      console.log(`✓ Churn save email sent to ${client.company} (score: ${newScore})`)

      if (newScore >= 9) {
        urgentClients.push(client)
      }
    }
  }

  // Alert owner about urgent clients
  if (urgentClients.length > 0) {
    await sendOwnerAlert(
      `🚨 Urgent: ${urgentClients.length} client(s) at critical churn risk`,
      `The following clients have a churn score of 9+:\n\n${urgentClients
        .map((c) => `- ${c.company} (${c.name}, score: ${c.churn_score})`)
        .join('\n')}\n\nLog in to review: ${process.env.NEXT_PUBLIC_BASE_URL}/admin`
    )
  }

  console.log(`\nDone. Churn save emails sent: ${savedCount}`)
}

main().catch(async (err) => {
  console.error('Churn check script failed:', err)
  await sendOwnerAlert(
    '⚠️ Churn Check Script Failed',
    `Error: ${err instanceof Error ? err.message : String(err)}`
  )
  process.exit(1)
})
