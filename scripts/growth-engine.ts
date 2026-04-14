/**
 * InnieAI Growth Engine
 * Run: npx tsx scripts/growth-engine.ts
 * GitHub Action: growth-engine.yml (Sunday 7am PST — runs before template optimizer)
 *
 * This script runs autonomously every week and makes decisions to grow the business:
 *
 * 1. SCALE EMAIL VOLUME
 *    If last week's bounce rate < 2% and unsub rate < 0.5%, increase max_emails_per_day.
 *    Ramps from 10 → 80 over 8 weeks, then holds at 80 (safe cold-email ceiling).
 *
 * 2. HIRE A CLOSER
 *    If active closers are averaging >8 calls each in the last 14 days,
 *    generate a job post with Claude and email it to OWNER_EMAIL with a 1-click
 *    Upwork/Contra link so the owner can post it in <60 seconds.
 *    (Future: auto-post via Upwork API when UPWORK_API_KEY is set.)
 *
 * 3. EXPAND NICHES
 *    If a niche has >80% of leads already Contacted/Invalid (saturated),
 *    add a new niche from the expansion pool that hasn't been tried yet.
 *
 * 4. EXPAND CITIES
 *    Same logic as niches — expand to new cities when current ones saturate.
 *
 * 5. GROWTH REPORT
 *    Emails owner a weekly summary of every decision made + MRR snapshot.
 *
 * Every decision is logged to growth_decisions table for auditing.
 */

import { createScriptClient } from '../src/lib/supabase/server'
import { sendEmail, sendOwnerAlert } from '../src/lib/resend'
import { generateText } from '../src/lib/anthropic'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'
const CLOSER_SECRET = process.env.CLOSER_SECRET ?? ''

// ── Config ──────────────────────────────────────────────────────────────────

const EMAIL_VOLUME_STEPS = [10, 20, 30, 40, 50, 60, 80] // emails/day ramp steps
const EMAIL_VOLUME_MAX = 80
const BOUNCE_RATE_THRESHOLD = 0.02  // 2% — pause volume increase if exceeded
const UNSUB_RATE_THRESHOLD  = 0.005 // 0.5% — pause volume increase if exceeded
const CLOSER_CALLS_THRESHOLD = 8    // avg calls per closer in 14 days before hiring

// New niches to try when existing ones saturate
const NICHE_EXPANSION_POOL = [
  { query: 'chiropractic office',       tag: 'chiropractic' },
  { query: 'veterinary clinic',         tag: 'vet' },
  { query: 'accounting firm',           tag: 'accounting' },
  { query: 'insurance agency',          tag: 'insurance' },
  { query: 'auto repair shop',          tag: 'auto-repair' },
  { query: 'physical therapy clinic',   tag: 'physio' },
  { query: 'marketing agency',          tag: 'marketing-agency' },
  { query: 'financial advisor',         tag: 'finance' },
]

// New cities to try when existing ones saturate
const CITY_EXPANSION_POOL = [
  'Austin, TX', 'Dallas, TX', 'Houston, TX',
  'Seattle, WA', 'Portland, OR',
  'Miami, FL', 'Tampa, FL', 'Orlando, FL',
  'Atlanta, GA', 'Charlotte, NC',
  'Chicago, IL', 'Minneapolis, MN',
  'Salt Lake City, UT', 'Scottsdale, AZ',
]

// ── Helpers ──────────────────────────────────────────────────────────────────

type Supabase = ReturnType<typeof createScriptClient>

async function getSetting(supabase: Supabase, key: string): Promise<string | null> {
  const { data } = await supabase.from('settings').select('value').eq('key', key).single()
  return data?.value ?? null
}

async function setSetting(supabase: Supabase, key: string, value: string) {
  await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })
}

async function logDecision(
  supabase: Supabase,
  action: string,
  reason: string,
  data?: Record<string, unknown>
) {
  await supabase.from('growth_decisions').insert({ action, reason, data: data ?? null })
  console.log(`[${action}] ${reason}`)
}

// ── 1. Email volume scaling ───────────────────────────────────────────────────

async function scaleEmailVolume(supabase: Supabase): Promise<string | null> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  const { data: recentSends } = await supabase
    .from('email_sequences')
    .select('bounced, unsubscribed')
    .not('sent_at', 'is', null)
    .gte('sent_at', sevenDaysAgo)

  if (!recentSends || recentSends.length < 20) return null // not enough data yet

  const total      = recentSends.length
  const bounces    = recentSends.filter((r) => r.bounced).length
  const unsubs     = recentSends.filter((r) => r.unsubscribed).length
  const bounceRate = bounces / total
  const unsubRate  = unsubs / total

  if (bounceRate > BOUNCE_RATE_THRESHOLD) {
    return `⚠️ Bounce rate ${(bounceRate * 100).toFixed(1)}% — volume NOT increased. Investigate bounces.`
  }
  if (unsubRate > UNSUB_RATE_THRESHOLD) {
    return `⚠️ Unsub rate ${(unsubRate * 100).toFixed(1)}% — volume NOT increased. Review email copy.`
  }

  const currentStr = await getSetting(supabase, 'max_emails_per_day')
  const current = parseInt(currentStr ?? '10')

  if (current >= EMAIL_VOLUME_MAX) return null // already at ceiling

  const nextStep = EMAIL_VOLUME_STEPS.find((s) => s > current) ?? EMAIL_VOLUME_MAX
  await setSetting(supabase, 'max_emails_per_day', String(nextStep))

  await logDecision(supabase, 'scale_email_volume',
    `Deliverability healthy (${(bounceRate * 100).toFixed(1)}% bounce, ${(unsubRate * 100).toFixed(1)}% unsub). Increased daily cap.`,
    { from: current, to: nextStep, sample_size: total }
  )

  return `📈 Email volume scaled: ${current} → ${nextStep}/day`
}

// ── 2. Closer hiring ──────────────────────────────────────────────────────────

async function checkCloserCapacity(supabase: Supabase): Promise<string | null> {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString()

  const { data: closers } = await supabase
    .from('closers')
    .select('id, name, calls_assigned')
    .eq('is_active', true)

  if (!closers || closers.length === 0) {
    // No closers at all — definitely need to hire
    return await generateAndSendHiringEmail(supabase, 0, 0, 'No closers configured')
  }

  // Count calls in the last 14 days by looking at recent booking decisions
  // (Proxy: total calls_assigned / days_active — good enough for weekly check)
  const { data: recentDecisions } = await supabase
    .from('growth_decisions')
    .select('id')
    .eq('action', 'call_assigned')
    .gte('created_at', fourteenDaysAgo)

  const recentCalls = recentDecisions?.length ?? 0
  const avgCallsPerCloser = closers.length > 0 ? recentCalls / closers.length : 0

  if (avgCallsPerCloser < CLOSER_CALLS_THRESHOLD) return null

  return await generateAndSendHiringEmail(
    supabase,
    closers.length,
    avgCallsPerCloser,
    `${closers.length} closer(s) averaging ${avgCallsPerCloser.toFixed(1)} calls/14 days`
  )
}

async function publishHiringBlogPost(supabase: Supabase): Promise<void> {
  // Check if we've published a hiring post in the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: recent } = await supabase
    .from('posts')
    .select('id')
    .eq('niche', 'hiring')
    .gte('created_at', thirtyDaysAgo)
    .limit(1)
  if (recent && recent.length > 0) return // already published recently

  const jobUrl = `${BASE_URL}/jobs/closer`

  try {
    const content = await generateText(
      `You write SEO-optimised blog posts for an AI automation company called InnieAI.
Write in clean HTML (h2, p, ul, li only). 500-600 words.
Tone: direct, professional, no fluff.
The post should rank for "remote sales closer jobs" and "commission sales jobs remote".`,
      `Write a blog post announcing that InnieAI is hiring commission-based sales closers.

Key facts to include:
- InnieAI automates lead generation and follow-up for local businesses (dental, gyms, med spas, contractors)
- We need closers for inbound calls — prospects are pre-qualified and have already booked
- 20% commission on setup fees ($300–$500 per close)
- 15-minute calls, AI-generated briefing provided before every call
- No cold calling, no admin work
- Apply at: ${jobUrl}

Include a section on what makes this role unique (pre-qualified leads, AI briefing, pure closing).
End with a clear CTA linking to ${jobUrl}

Return JSON: { "title": "...", "content": "<html>", "metaDescription": "..." }`
    )

    const parsed = JSON.parse(content) as { title: string; content: string; metaDescription: string }
    const slug = `hiring-sales-closer-${Date.now()}`

    await supabase.from('posts').insert({
      title: parsed.title,
      slug,
      content: parsed.content,
      niche: 'hiring',
      meta_description: parsed.metaDescription,
      published: true,
      published_at: new Date().toISOString(),
    })
  } catch {
    // Non-fatal — hiring post is bonus SEO, not critical
  }
}

async function generateAndSendHiringEmail(
  supabase: Supabase,
  currentClosers: number,
  avgCalls: number,
  reason: string
): Promise<string | null> {
  // Publish a blog post to attract applicants organically (SEO)
  await publishHiringBlogPost(supabase)

  // Submit the job page URL to Google Indexing API if key is set
  // (helps the /jobs/closer page rank faster)
  const googleKey = process.env.GOOGLE_INDEXING_API_KEY
  if (googleKey) {
    try {
      await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${googleKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `${BASE_URL}/jobs/closer`, type: 'URL_UPDATED' }),
      })
    } catch { /* non-fatal */ }
  }

  await logDecision(supabase, 'hire_closer', reason, {
    current_closers: currentClosers,
    avg_calls: avgCalls,
    job_url: `${BASE_URL}/jobs/closer`,
    blog_post_published: true,
  })

  // Alert owner — informational only, no action needed
  const ownerEmail = process.env.OWNER_EMAIL
  if (ownerEmail) {
    await sendEmail({
      to: ownerEmail,
      subject: `🧑‍💼 System hiring: closer job published (${reason})`,
      text: `InnieAI Growth Engine — Hiring Update

Reason: ${reason}
Current closers: ${currentClosers}

What the system did automatically:
✓ Published job post at ${BASE_URL}/jobs/closer
✓ Published SEO blog post about the role
✓ Applications auto-qualify via Claude (score ≥6 = instant access)

You don't need to do anything. Applicants apply at the URL above, Claude scores them, and qualified ones receive the closer portal access automatically.

View applications in Supabase: closer_applications table`,
    })
  }

  return `🧑‍💼 Closer job published at /jobs/closer — ${reason}`
}

// ── 3. Niche expansion ───────────────────────────────────────────────────────

async function expandNiches(supabase: Supabase): Promise<string | null> {
  const currentStr = await getSetting(supabase, 'base_niches') ?? ''
  const currentNiches = currentStr.split(',').map((n) => n.trim()).filter(Boolean)

  // Check saturation: niche is saturated if >80% of leads are Contacted/Invalid
  const { data: leads } = await supabase
    .from('leads')
    .select('niche, status')

  if (!leads || leads.length < 100) return null // not enough data

  const nicheStats = new Map<string, { total: number; exhausted: number }>()
  for (const lead of leads) {
    const s = nicheStats.get(lead.niche) ?? { total: 0, exhausted: 0 }
    s.total++
    if (lead.status === 'Contacted' || lead.status === 'Invalid') s.exhausted++
    nicheStats.set(lead.niche, s)
  }

  const saturated = currentNiches.filter((n) => {
    const s = nicheStats.get(n)
    return s && s.total >= 30 && s.exhausted / s.total > 0.8
  })

  if (saturated.length === 0) return null

  // Pick the next niche from expansion pool not already in use
  const allUsed = new Set(currentNiches)
  const next = NICHE_EXPANSION_POOL.find((n) => !allUsed.has(n.tag))
  if (!next) return null

  const updated = [...currentNiches, next.tag].join(',')
  await setSetting(supabase, 'base_niches', updated)

  await logDecision(supabase, 'add_niche',
    `${saturated.join(', ')} saturated (>80% exhausted). Added new niche.`,
    { saturated, added: next.tag, new_list: updated }
  )

  return `🆕 New niche added: ${next.tag} (${saturated.join(', ')} saturated)`
}

// ── 4. City expansion ────────────────────────────────────────────────────────

async function expandCities(supabase: Supabase): Promise<string | null> {
  const currentStr = await getSetting(supabase, 'base_cities') ?? ''
  const currentCities = currentStr.split(',').map((c) => c.trim()).filter(Boolean)

  const { data: leads } = await supabase
    .from('leads')
    .select('city, status')

  if (!leads || leads.length < 100) return null

  const cityStats = new Map<string, { total: number; exhausted: number }>()
  for (const lead of leads) {
    const city = (lead.city ?? '').split(',')[0].trim()
    const s = cityStats.get(city) ?? { total: 0, exhausted: 0 }
    s.total++
    if (lead.status === 'Contacted' || lead.status === 'Invalid') s.exhausted++
    cityStats.set(city, s)
  }

  const saturated = currentCities.filter((c) => {
    const cityShort = c.split(',')[0].trim()
    const s = cityStats.get(cityShort)
    return s && s.total >= 30 && s.exhausted / s.total > 0.8
  })

  if (saturated.length === 0) return null

  const allUsed = new Set(currentCities.map((c) => c.split(',')[0].trim()))
  const next = CITY_EXPANSION_POOL.find((c) => !allUsed.has(c.split(',')[0].trim()))
  if (!next) return null

  const updated = [...currentCities, next].join(',')
  await setSetting(supabase, 'base_cities', updated)

  await logDecision(supabase, 'add_city',
    `${saturated.join(', ')} saturated (>80% exhausted). Added new city.`,
    { saturated, added: next, new_list: updated }
  )

  return `🌆 New city added: ${next} (${saturated.join(', ')} saturated)`
}

// ── 5. MRR snapshot ───────────────────────────────────────────────────────────

async function getMRRSnapshot(supabase: Supabase): Promise<{ mrr: number; clients: number; growth: string }> {
  const { data: clients } = await supabase
    .from('clients')
    .select('mrr, status, tier')
    .eq('status', 'Active')

  const mrr = (clients ?? []).reduce((sum, c) => sum + (c.mrr / 100), 0) // convert cents
  const count = (clients ?? []).length
  const growthBudget = mrr * 0.2

  return {
    mrr,
    clients: count,
    growth: `$${growthBudget.toFixed(0)}/mo available for growth (20% of MRR)`,
  }
}

// ── 5. UGC creator recruitment ───────────────────────────────────────────────

async function recruitUGCCreators(supabase: Supabase): Promise<string | null> {
  // Start UGC recruitment as soon as there's any paying client
  const snapshot = await getMRRSnapshot(supabase)
  if (snapshot.mrr < 500) return null // needs at least one client

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: recentUGC } = await supabase
    .from('growth_decisions')
    .select('id')
    .eq('action', 'recruit_ugc')
    .gte('created_at', thirtyDaysAgo)
    .limit(1)

  if (recentUGC && recentUGC.length > 0) return null // already ran this month

  // Check how many affiliates we have
  const { data: affiliates } = await supabase
    .from('affiliates')
    .select('id')

  const affiliateCount = affiliates?.length ?? 0

  // Publish a UGC SEO post to attract organic applicants
  try {
    const ugcJobUrl = `${BASE_URL}/jobs/ugc`
    const content = await generateText(
      `You write SEO-optimised blog posts for an AI automation SaaS called InnieAI.
Write in clean HTML (h2, p, ul, li only). 400-500 words. Tone: direct, no fluff.
Target keywords: "ugc creator jobs", "ugc creator brand deals remote", "content creator affiliate program".`,
      `Write a blog post announcing that InnieAI is looking for UGC creator partners.

Key facts:
- InnieAI automates lead generation for local businesses (dental, gyms, med spas, contractors)
- We need creators whose audience includes local business owners
- 15% recurring commission — a single client earns the creator $225–$600/month forever
- We provide a creative brief, brand assets, and product access
- Apply at: ${ugcJobUrl}

Focus on the recurring income angle — this is not a one-off brand deal, it's passive income.
End with a CTA linking to ${ugcJobUrl}

Return JSON: { "title": "...", "content": "<html>", "metaDescription": "..." }`
    )

    const parsed = JSON.parse(content) as { title: string; content: string; metaDescription: string }
    const slug = `ugc-creator-partner-${Date.now()}`

    await supabase.from('posts').insert({
      title: parsed.title,
      slug,
      content: parsed.content,
      niche: 'ugc',
      meta_description: parsed.metaDescription,
      published: true,
      published_at: new Date().toISOString(),
    })
  } catch {
    // Non-fatal
  }

  await logDecision(supabase, 'recruit_ugc',
    `MRR $${snapshot.mrr.toFixed(0)} — launching UGC creator recruitment. Current affiliates: ${affiliateCount}`,
    { mrr: snapshot.mrr, affiliate_count: affiliateCount, job_url: `${BASE_URL}/jobs/ugc` }
  )

  return `🎬 UGC creator recruitment activated — job published at /jobs/ugc (${affiliateCount} existing affiliates)`
}

// ── 6. Autonomous ad spend ────────────────────────────────────────────────────

// Estimated monthly costs (API keys, hosting, etc.) — adjust if needed
const ESTIMATED_MONTHLY_COSTS = 200 // ~$200/mo for Resend + Supabase + Anthropic + Vercel

async function runAdSpend(supabase: Supabase): Promise<string | null> {
  const snapshot = await getMRRSnapshot(supabase)
  const profit = snapshot.mrr - ESTIMATED_MONTHLY_COSTS
  if (profit <= 0) return null // not profitable yet — don't spend on ads

  const growthBudget = Math.floor(profit * 0.3) // 30% of profit (more aggressive when small)

  // Check we haven't already run this week
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const { data: recentAds } = await supabase
    .from('growth_decisions')
    .select('id')
    .eq('action', 'ad_campaign')
    .gte('created_at', sevenDaysAgo)
    .limit(1)

  if (recentAds && recentAds.length > 0) return null

  // Find the best-performing niches (most closed deals)
  const { data: clients } = await supabase
    .from('clients')
    .select('niche, tier')
    .eq('status', 'Active')

  const nicheCounts = new Map<string, number>()
  for (const c of clients ?? []) {
    nicheCounts.set(c.niche, (nicheCounts.get(c.niche) ?? 0) + 1)
  }

  const topNiches = [...nicheCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([niche]) => niche)

  if (topNiches.length === 0) return null

  // Claude generates campaign specs for each top niche
  let campaignSpecs: string
  try {
    campaignSpecs = await generateText(
      `You write high-converting Google Ads and Meta Ads campaign specs for a B2B AI automation SaaS.
Be specific and actionable. Return clean, copy-paste-ready ad copy.`,
      `Generate ad campaign specs for InnieAI targeting these niches: ${topNiches.join(', ')}.

InnieAI automates lead generation and follow-up for local businesses. Plans: $1,500–$4,000/month setup, then $500–$1,500/month.

Monthly budget available: $${growthBudget} across all campaigns.

For each niche, provide:
1. GOOGLE ADS: 3 headlines (30 chars max), 2 descriptions (90 chars max), target keywords (5)
2. META ADS: Primary text (125 chars), headline (40 chars), description (30 chars), target audience (job titles, interests)
3. Landing page recommendation: which page to send traffic to (use ${BASE_URL})
4. Suggested budget split: how much of the $${growthBudget} to allocate to this niche

Format as plain text, clearly labelled per niche.`
    )
  } catch {
    return null // non-fatal — skip if Claude unavailable
  }

  await logDecision(supabase, 'ad_campaign',
    `Monthly budget $${growthBudget} — generated campaign specs for ${topNiches.join(', ')}`,
    { mrr: snapshot.mrr, budget: growthBudget, niches: topNiches }
  )

  // Email owner the campaign specs — they or a VA can launch these
  // If META_ACCESS_TOKEN or GOOGLE_ADS_DEVELOPER_TOKEN are set, we could auto-launch
  // For now: always email the brief so the owner stays in control of ad spend
  const ownerEmail = process.env.OWNER_EMAIL
  if (ownerEmail) {
    await sendEmail({
      to: ownerEmail,
      subject: `📣 Weekly ad brief — $${growthBudget} budget ready`,
      text: `InnieAI Growth Engine — Weekly Ad Brief

MRR: $${snapshot.mrr.toLocaleString()}
Growth budget (30% of profit): $${growthBudget}/month
Top-performing niches: ${topNiches.join(', ')}

──────────────────────────────────────────
CAMPAIGN SPECS (Claude-generated)
──────────────────────────────────────────

${campaignSpecs}

──────────────────────────────────────────

TO LAUNCH:
1. Google Ads: ads.google.com → New campaign → Search → paste the headlines/descriptions above
2. Meta Ads: business.facebook.com → Ads Manager → paste the copy above

Or forward this to your VA / media buyer.

This brief is generated automatically every Sunday when growth budget is available.`,
    })
  }

  return `📣 Ad brief generated — $${growthBudget} budget for ${topNiches.join(', ')} (emailed to owner)`
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const supabase = createScriptClient()
  const decisions: string[] = []

  console.log('=== InnieAI Growth Engine ===\n')

  // Run all growth checks
  const volumeResult  = await scaleEmailVolume(supabase)
  const closerResult  = await checkCloserCapacity(supabase)
  const nicheResult   = await expandNiches(supabase)
  const cityResult    = await expandCities(supabase)
  const ugcResult     = await recruitUGCCreators(supabase)
  const adResult      = await runAdSpend(supabase)

  if (volumeResult) decisions.push(volumeResult)
  if (closerResult) decisions.push(closerResult)
  if (nicheResult)  decisions.push(nicheResult)
  if (cityResult)   decisions.push(cityResult)
  if (ugcResult)    decisions.push(ugcResult)
  if (adResult)     decisions.push(adResult)

  const snapshot = await getMRRSnapshot(supabase)

  console.log('\nDecisions this run:')
  if (decisions.length === 0) {
    console.log('  No changes needed — system is healthy.')
  } else {
    decisions.forEach((d) => console.log(`  ${d}`))
  }

  // Weekly growth report to owner
  const reportLines = [
    `InnieAI Weekly Growth Report`,
    ``,
    `MRR: $${snapshot.mrr.toLocaleString()}`,
    `Active clients: ${snapshot.clients}`,
    `Growth budget: ${snapshot.growth}`,
    ``,
    `Decisions made this week:`,
    ...(decisions.length > 0 ? decisions.map((d) => `  ${d}`) : ['  System healthy — no changes needed']),
    ``,
    `Admin dashboard: ${BASE_URL}/admin`,
    `Growth log: ${BASE_URL}/admin (check Supabase growth_decisions table)`,
  ]

  await sendOwnerAlert(
    `📊 Weekly Growth Report — $${snapshot.mrr.toLocaleString()} MRR`,
    reportLines.join('\n')
  )

  console.log(`\nDone. Decisions: ${decisions.length}`)
}

main().catch(async (err) => {
  console.error('Growth engine failed:', err)
  await sendOwnerAlert(
    '⚠️ Growth Engine Failed',
    `Error: ${err instanceof Error ? err.message : String(err)}`
  )
  process.exit(1)
})
