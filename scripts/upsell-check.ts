/**
 * InnieAI Upsell Automation Script
 * Run: npx tsx scripts/upsell-check.ts
 * GitHub Action: upsell-check.yml (10am PST daily)
 */

import { createScriptClient } from '../src/lib/supabase/server'
import { sendEmail, sendOwnerAlert } from '../src/lib/resend'
import { generateUpsellEmail } from '../src/lib/anthropic'
import type { Client } from '../src/types/database'

const UPSELL_MAP: Record<string, { tier: 'Growth' | 'Scale'; price: number }> = {
  Starter: { tier: 'Growth', price: 2500 },
  Growth: { tier: 'Scale', price: 4000 },
}

async function main() {
  const supabase = createScriptClient()
  const calcomLink = process.env.CALCOM_LINK ?? 'https://cal.com/innieai'

  // Find clients eligible for upsell
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('status', 'Active')
    .eq('upsell_sent', false)
    .in('tier', ['Starter', 'Growth'])

  if (!clients) return

  let upsellsSent = 0

  for (const client of clients as Client[]) {
    // Check 60+ days active and low churn score
    const daysSinceStart = (Date.now() - new Date(client.created_at).getTime()) / 86400000
    if (daysSinceStart < 60) continue
    if (client.churn_score >= 4) continue

    const upsell = UPSELL_MAP[client.tier]
    if (!upsell) continue

    // Get leads this month for personalization
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    const { count: leadsThisMonth } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString())

    // Generate AI upsell email
    let emailBody: string
    try {
      emailBody = await generateUpsellEmail({
        clientName: client.name,
        company: client.company,
        niche: client.niche,
        currentTier: client.tier,
        leadsThisMonth: leadsThisMonth ?? 0,
        targetTier: upsell.tier,
        targetPrice: upsell.price,
      })
    } catch {
      emailBody = `Hi ${client.name.split(' ')[0]},\n\nYou've been on InnieAI's ${client.tier} plan for ${Math.round(daysSinceStart)} days now, and the results are building.\n\nWhen you're ready to scale further, the ${upsell.tier} plan would give you significantly more reach — I'd love to walk you through what that looks like: ${calcomLink}\n\nThe InnieAI Team`
    }

    await sendEmail({
      to: client.email,
      subject: `${client.company}: you're ready for more`,
      text: emailBody,
    })

    // Mark as sent — never send again
    await supabase
      .from('clients')
      .update({ upsell_sent: true })
      .eq('id', client.id)

    upsellsSent++
    console.log(`✓ Upsell email sent to ${client.company} (${client.tier} → ${upsell.tier})`)
  }

  if (upsellsSent > 0) {
    await sendOwnerAlert(
      `📈 ${upsellsSent} upsell email(s) sent today`,
      `The upsell automation sent ${upsellsSent} upgrade emails today.\n\nView clients: ${process.env.NEXT_PUBLIC_BASE_URL}/admin/clients`
    )
  }

  console.log(`\nDone. Upsell emails sent: ${upsellsSent}`)
}

main().catch(async (err) => {
  console.error('Upsell check script failed:', err)
  await sendOwnerAlert(
    '⚠️ Upsell Check Script Failed',
    `Error: ${err instanceof Error ? err.message : String(err)}`
  )
  process.exit(1)
})
