/**
 * InnieAI Template Optimizer
 * Run: npx tsx scripts/template-optimizer.ts
 * GitHub Action: template-optimizer.yml (Sunday 10am PST)
 *
 * How it works:
 * 1. Queries email_sequences to calculate open/reply/unsub rate per step × niche
 * 2. Finds the worst-performing combos with enough data (≥20 sends)
 * 3. Feeds current template + stats to Claude → rewrites the worst performers
 * 4. Stores new variants in email_template_variants (deactivating old ones)
 * 5. Alerts owner with a summary of what changed
 *
 * The outreach script checks email_template_variants first before using static templates.
 */

import { createScriptClient } from '../src/lib/supabase/server'
import { sendOwnerAlert } from '../src/lib/resend'
import { optimizeEmailTemplate } from '../src/lib/anthropic'

const MIN_SENDS_TO_OPTIMIZE = 20   // Don't optimize without enough data
const MAX_OPTIMIZATIONS_PER_RUN = 3 // Max rewrites per weekly run
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'

// Static template fallback text for seeding (when no variant exists in DB yet)
const STATIC_TEMPLATES: Record<number, { subject: string; body: string }> = {
  1: {
    subject: `Quick question about {{company_name}}`,
    body: `{{personalized_opener}}

Most {{niche}} businesses in {{city}} are leaving leads on the table with slow follow-up. We fix that automatically.

InnieAI generates qualified leads daily and follows up with each one within 60 seconds — personalised to their business, no manual work from you.

Worth a 15-minute call to see if it's a fit?

Book here: {{calcom_link}}

---
To stop receiving these emails: {{unsub_link}}`,
  },
  2: {
    subject: `What I found looking at {{niche}} businesses in {{city}}`,
    body: `{{niche_insight}}

The businesses that win in {{niche}} right now respond faster and follow up longer than their competitors.

InnieAI handles both — automatically, without any work from you.

I can show you exactly what this looks like for a {{niche}} in {{city}} in 15 minutes.

{{calcom_link}}

---
To unsubscribe: {{unsub_link}}`,
  },
  3: {
    subject: `What happened when they stopped chasing leads manually`,
    body: `Quick one.

A {{niche}} similar to {{company_name}} was losing 60% of their leads to slow response times. Within 30 days of using InnieAI, they were booking 3x more calls from the exact same traffic.

No new ads. No new spend. Just faster, smarter follow-up.

If you have 15 minutes this week, I'd like to show you the same system: {{calcom_link}}

---
Unsubscribe: {{unsub_link}}`,
  },
  4: {
    subject: `Closing your file`,
    body: `Hi,

I've reached out a few times without hearing back — so I'll assume the timing isn't right for {{company_name}}.

If that changes and you'd like to see how InnieAI automates lead gen and follow-up for {{niche}} businesses, you can book a 15-minute call here: {{calcom_link}}

Take care,
The InnieAI Team

---
Unsubscribe: {{unsub_link}}`,
  },
}

type PerformanceRow = {
  step: number
  niche: string
  send_count: number
  open_count: number
  reply_count: number
  unsub_count: number
  open_rate: number
  reply_rate: number
  unsub_rate: number
  score: number // lower = worse performance
}

async function main() {
  const supabase = createScriptClient()

  // ─── 1. Aggregate performance per step × niche ───────────────────────────

  // Get all sent sequences joined with their lead's niche
  const { data: rawRows } = await supabase
    .from('email_sequences')
    .select('step, opened_at, replied, unsubscribed, lead_id, leads!inner(niche)')
    .not('sent_at', 'is', null)

  if (!rawRows || rawRows.length === 0) {
    console.log('No send data yet — nothing to optimize.')
    return
  }

  // Group by step × niche
  const groups = new Map<string, {
    sends: number; opens: number; replies: number; unsubs: number
  }>()

  for (const row of rawRows) {
    const lead = row.leads as unknown as { niche: string }
    const niche = lead?.niche ?? 'unknown'
    const key = `${row.step}:${niche}`
    const g = groups.get(key) ?? { sends: 0, opens: 0, replies: 0, unsubs: 0 }
    g.sends++
    if (row.opened_at) g.opens++
    if (row.replied) g.replies++
    if (row.unsubscribed) g.unsubs++
    groups.set(key, g)
  }

  const performance: PerformanceRow[] = []
  for (const [key, g] of groups) {
    if (g.sends < MIN_SENDS_TO_OPTIMIZE) continue
    const [stepStr, niche] = key.split(':')
    const step = parseInt(stepStr)
    const openRate = g.opens / g.sends
    const replyRate = g.replies / g.sends
    const unsubRate = g.unsubs / g.sends
    // Score: higher open rate + reply rate = better. Penalize unsubs.
    const score = openRate * 0.4 + replyRate * 0.5 - unsubRate * 0.1
    performance.push({ step, niche, send_count: g.sends, open_count: g.opens, reply_count: g.replies, unsub_count: g.unsubs, open_rate: openRate, reply_rate: replyRate, unsub_rate: unsubRate, score })
  }

  if (performance.length === 0) {
    console.log(`No step×niche combos have reached ${MIN_SENDS_TO_OPTIMIZE} sends yet.`)
    return
  }

  // Sort worst first
  performance.sort((a, b) => a.score - b.score)

  console.log('\nPerformance summary (worst first):')
  for (const p of performance.slice(0, 10)) {
    console.log(`  Step ${p.step} / ${p.niche}: ${p.send_count} sends, ${(p.open_rate * 100).toFixed(1)}% open, ${(p.reply_rate * 100).toFixed(1)}% reply, score=${p.score.toFixed(3)}`)
  }

  // ─── 2. Load current best templates for the worst performers ─────────────

  const toOptimize = performance.slice(0, MAX_OPTIMIZATIONS_PER_RUN)
  const improvements: string[] = []

  for (const p of toOptimize) {
    console.log(`\nOptimizing step ${p.step} / ${p.niche}...`)

    // Get current active variant, or fall back to static template
    const { data: current } = await supabase
      .from('email_template_variants')
      .select('subject, body')
      .eq('step', p.step)
      .eq('is_active', true)
      .or(`niche.eq.${p.niche},niche.eq.all`)
      .order('niche', { ascending: false }) // niche-specific beats 'all'
      .limit(1)
      .single()

    const currentTemplate = current ?? STATIC_TEMPLATES[p.step]
    if (!currentTemplate) {
      console.log(`  No template found for step ${p.step} — skipping`)
      continue
    }

    // ─── 3. Ask Claude to rewrite it ───────────────────────────────────────
    let newVariant: { subject: string; body: string }
    try {
      newVariant = await optimizeEmailTemplate({
        step: p.step,
        niche: p.niche,
        currentSubject: currentTemplate.subject,
        currentBody: currentTemplate.body,
        sendCount: p.send_count,
        openRate: p.open_rate,
        replyRate: p.reply_rate,
        unsubRate: p.unsub_rate,
      })
    } catch (err) {
      console.error(`  Claude optimization failed:`, err)
      continue
    }

    // ─── 4. Deactivate old variants, insert new one ────────────────────────
    await supabase
      .from('email_template_variants')
      .update({ is_active: false })
      .eq('step', p.step)
      .eq('niche', p.niche)

    const { error } = await supabase
      .from('email_template_variants')
      .insert({
        step: p.step,
        niche: p.niche,
        subject: newVariant.subject,
        body: newVariant.body,
        is_active: true,
        open_rate_at_creation: p.open_rate,
        reply_rate_at_creation: p.reply_rate,
        sends: 0,
      })

    if (error) {
      console.error(`  Failed to save variant:`, error.message)
      continue
    }

    console.log(`  ✓ New variant saved for step ${p.step} / ${p.niche}`)
    console.log(`    Subject: ${newVariant.subject}`)

    improvements.push(
      `Step ${p.step} / ${p.niche}:\n` +
      `  Was: "${currentTemplate.subject}" (${(p.open_rate * 100).toFixed(1)}% open, ${(p.reply_rate * 100).toFixed(1)}% reply)\n` +
      `  Now: "${newVariant.subject}"`
    )
  }

  // ─── 5. Alert owner ───────────────────────────────────────────────────────

  if (improvements.length > 0) {
    await sendOwnerAlert(
      `🧠 ${improvements.length} email template(s) auto-optimized`,
      `The weekly template optimizer rewrote ${improvements.length} underperforming email template(s).\n\n` +
      improvements.join('\n\n') +
      `\n\nView current variants: ${BASE_URL}/admin/email-templates`
    )
  } else {
    console.log('\nNo improvements made this run.')
  }

  console.log(`\nDone. Templates optimized: ${improvements.length}`)
}

main().catch(async (err) => {
  console.error('Template optimizer failed:', err)
  await sendOwnerAlert(
    '⚠️ Template Optimizer Failed',
    `Error: ${err instanceof Error ? err.message : String(err)}`
  )
  process.exit(1)
})
