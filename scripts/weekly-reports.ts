/**
 * InnieAI Weekly Reports Script
 * Run: npx tsx scripts/weekly-reports.ts
 * GitHub Action: weekly-reports.yml (Monday 8am PST)
 */

import { createScriptClient } from '../src/lib/supabase/server'
import { sendEmail, sendOwnerAlert } from '../src/lib/resend'
import { generateWeeklyReport } from '../src/lib/anthropic'
import type { Client } from '../src/types/database'

async function main() {
  const supabase = createScriptClient()
  const weekOf = new Date().toISOString().split('T')[0]

  // Get all active clients
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('status', 'Active')

  if (!clients || clients.length === 0) {
    console.log('No active clients.')
    return
  }

  const startOfWeek = new Date(Date.now() - 7 * 86400000).toISOString()
  let reportsGenerated = 0
  const churnRisks: Client[] = []
  const upsellReady: Client[] = []
  let totalMrr = 0

  for (const client of clients as Client[]) {
    totalMrr += client.mrr

    // Get week's data — scope to client's niche so each client sees their own metrics
    const leadsQuery = supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfWeek)
    if (client.niche && client.niche !== 'unknown') {
      leadsQuery.eq('niche', client.niche)
    }

    // Scope emails to leads in this client's niche
    const nicheLeadIds = client.niche && client.niche !== 'unknown'
      ? await supabase
          .from('leads')
          .select('id')
          .eq('niche', client.niche)
          .not('sent_at', 'is', null)
          .then(({ data }) => (data ?? []).map((r) => r.id as string))
      : []

    const emailsQuery = supabase
      .from('email_sequences')
      .select('opened_at, replied')
      .not('sent_at', 'is', null)
      .gte('sent_at', startOfWeek)
    if (nicheLeadIds.length > 0) {
      emailsQuery.in('lead_id', nicheLeadIds)
    }

    const [
      { count: leadsGenerated },
      { data: emails },
    ] = await Promise.all([leadsQuery, emailsQuery])

    const emailsSent = emails?.length ?? 0
    const emailsOpened = emails?.filter((e) => e.opened_at).length ?? 0
    const repliesCount = emails?.filter((e) => e.replied).length ?? 0
    const openRate = emailsSent > 0 ? Math.round((emailsOpened / emailsSent) * 100) : 0

    // Generate AI report
    let reportContent: string
    try {
      reportContent = await generateWeeklyReport({
        clientName: client.name,
        company: client.company,
        niche: client.niche,
        leadsGenerated: leadsGenerated ?? 0,
        emailsSent,
        openRate,
        repliesCount,
        weekOf,
      })
    } catch (err) {
      console.error(`Failed to generate report for ${client.company}:`, err)
      continue
    }

    // Save report
    await supabase.from('reports').insert({
      client_id: client.id,
      week_of: weekOf,
      content: reportContent,
    })

    // Send to client
    await sendEmail({
      to: client.email,
      subject: `Your InnieAI Weekly Report — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
      text: `Hi ${client.name.split(' ')[0]},\n\nHere's your weekly performance summary:\n\n${reportContent}\n\n— The InnieAI Team`,
    })

    reportsGenerated++
    console.log(`✓ Report sent to ${client.company}`)

    // Flag churn risks
    if (client.churn_score >= 7) churnRisks.push(client)

    // Flag upsell ready
    const daysSinceStart = (Date.now() - new Date(client.created_at).getTime()) / 86400000
    if (client.tier === 'Starter' && daysSinceStart >= 60 && client.churn_score < 4 && !client.upsell_sent) {
      upsellReady.push(client)
    }
  }

  // Owner summary
  const ownerEmail = process.env.OWNER_EMAIL
  if (ownerEmail) {
    const summary = `Weekly Business Report — ${weekOf}

Total MRR: $${(totalMrr / 100).toLocaleString()}
Active Clients: ${clients.length}
Reports Sent: ${reportsGenerated}

${churnRisks.length > 0 ? `CHURN RISKS (${churnRisks.length}):\n${churnRisks.map((c) => `- ${c.company} (score: ${c.churn_score})`).join('\n')}` : 'No churn risks this week. ✓'}

${upsellReady.length > 0 ? `UPSELL OPPORTUNITIES (${upsellReady.length}):\n${upsellReady.map((c) => `- ${c.company} (60+ days on Starter, churn score ${c.churn_score})`).join('\n')}` : 'No upsell opportunities this week.'}

Log in to review: ${process.env.NEXT_PUBLIC_BASE_URL}/admin`

    await sendEmail({
      to: ownerEmail,
      subject: `InnieAI Weekly Owner Report — ${weekOf}`,
      text: summary,
    })
  }

  console.log(`\nDone. ${reportsGenerated} reports generated.`)
}

main().catch(async (err) => {
  console.error('Weekly reports script failed:', err)
  await sendOwnerAlert(
    '⚠️ Weekly Reports Script Failed',
    `Error: ${err instanceof Error ? err.message : String(err)}\n\nTimestamp: ${new Date().toISOString()}`
  )
  process.exit(1)
})
