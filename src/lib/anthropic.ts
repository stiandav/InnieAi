import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) throw new Error('ANTHROPIC_API_KEY is required')
    _client = new Anthropic({ apiKey: key })
  }
  return _client
}

export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1024
): Promise<string> {
  const client = getAnthropicClient()
  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude')
  return content.text
}

export async function generateOutreachOpener(
  companyName: string,
  niche: string,
  city: string,
  rating: number | null,
  reviewCount: number
): Promise<string> {
  return generateText(
    'You write concise, personalized cold email opening lines for a B2B outreach campaign. The tone is direct and conversational — no fluff. Never use the word "I noticed" or "I came across". Max 2 sentences.',
    `Write a personalized opening line for an email to ${companyName}, a ${niche} business in ${city}. They have a ${rating ?? 'unknown'} star Google rating with ${reviewCount} reviews. Reference something specific and real about their situation.`
  )
}

export async function generateNicheInsight(niche: string, city: string): Promise<string> {
  return generateText(
    'You write brief, punchy B2B email copy. 2-3 sentences max. Data-driven observation about the state of a local business niche. Conversational, no fluff.',
    `Write a 2-sentence observation about the current state of ${niche} businesses in ${city} — specifically about their marketing and lead follow-up challenges.`
  )
}

export async function generateProposal(params: {
  clientName: string
  company: string
  niche: string
  painPoints: string
  tier: string
  monthlyPrice: number
  setupFee: number
}): Promise<string> {
  const services = {
    Starter: ['Lead Generation Automation', 'AI Follow-Up Sequences'],
    Growth: ['Lead Generation Automation', 'AI Follow-Up Sequences', 'Reputation & Review Automation', 'Weekly Performance Reporting'],
    Scale: ['Lead Generation Automation', 'AI Follow-Up Sequences', 'AI Customer Support Agent', 'Reputation & Review Automation', 'Weekly Performance Reporting'],
  }[params.tier] ?? []

  return generateText(
    `You are a senior business consultant writing a professional, high-converting proposal for an AI automation agency called InnieAI.
Write in clean HTML with proper headings (h2, h3), paragraphs, and bullet lists.
The proposal should be polished, specific, and compelling — focused on ROI and the client's specific pain points.
Do not include generic filler. Every section should feel specific to this client.`,
    `Write a complete proposal for ${params.clientName} at ${params.company}.
Niche: ${params.niche}
Pain points they described: ${params.painPoints}
Recommended plan: ${params.tier} ($${params.monthlyPrice}/mo + $${params.setupFee} setup)
Services included: ${services.join(', ')}

Include these sections:
1. Executive Summary (their specific problem)
2. Proposed Solution (each service mapped to their pain points)
3. Deliverables (detailed list)
4. 90-Day Implementation Timeline
5. ROI Projection (estimate leads × conversion × avg deal value)
6. Investment (setup fee + monthly retainer)
7. Why InnieAI vs. hiring in-house
8. Next Steps (accept to get started)`,
    4096
  )
}

export async function generateWeeklyReport(params: {
  clientName: string
  company: string
  niche: string
  leadsGenerated: number
  emailsSent: number
  openRate: number
  repliesCount: number
  weekOf: string
}): Promise<string> {
  return generateText(
    'You write friendly, professional weekly business performance reports for small business owners. Plain text, conversational, 350-450 words. No bullet points — flowing paragraphs. End with a specific recommendation for next week.',
    `Write a weekly performance report for ${params.clientName} at ${params.company} (${params.niche}).
Week of: ${params.weekOf}
Data:
- Leads generated: ${params.leadsGenerated}
- Emails sent: ${params.emailsSent}
- Open rate: ${params.openRate}%
- Replies received: ${params.repliesCount}

Write the report as if you're a trusted advisor summarizing the week and what it means for their business.`,
    600
  )
}

export async function generateChurnSaveEmail(params: {
  clientName: string
  company: string
  niche: string
  churnScore: number
  daysSinceLogin: number
  issueSignal: string
}): Promise<string> {
  return generateText(
    'You write personal, empathetic retention emails from a business owner to a client at risk of churning. 3-4 short paragraphs. Direct, warm, and solution-focused. No salesy language.',
    `Write a personal email to ${params.clientName} at ${params.company}.
They have a churn score of ${params.churnScore}/10.
They haven't logged into their portal in ${params.daysSinceLogin} days.
Issue signal: ${params.issueSignal}

The email should feel like it's from the InnieAI founder personally, not a template. Ask what's going on and offer a call.`,
    400
  )
}

export async function generateUpsellEmail(params: {
  clientName: string
  company: string
  niche: string
  currentTier: string
  leadsThisMonth: number
  targetTier: string
  targetPrice: number
}): Promise<string> {
  return generateText(
    'You write concise, data-driven upgrade email for a SaaS product. 3-4 short paragraphs. Lead with the client\'s result, then show what they\'re missing at their current tier, and make the upgrade simple.',
    `Write an upsell email to ${params.clientName} at ${params.company} (${params.niche}).
They are on ${params.currentTier} and have generated ${params.leadsThisMonth} leads this month.
Recommend upgrading to ${params.targetTier} at $${params.targetPrice}/mo.
Key upgrade benefit: more leads per month + additional services.`,
    400
  )
}

export async function optimizeEmailTemplate(params: {
  step: number
  niche: string
  currentSubject: string
  currentBody: string
  sendCount: number
  openRate: number
  replyRate: number
  unsubRate: number
}): Promise<{ subject: string; body: string }> {
  const result = await generateText(
    `You are an expert cold email copywriter. You improve B2B cold email templates for local business outreach.
Rules:
- Keep emails under 150 words
- Plain text only — no HTML, no bullet points, no headers
- Conversational, direct tone — sounds like a real person, not marketing
- Always end with a clear single CTA (booking link as {{calcom_link}})
- Always include unsubscribe as the last line using {{unsub_link}}
- Use {{placeholders}} for dynamic content: {{first_name}}, {{company_name}}, {{city}}, {{niche}}, {{calcom_link}}, {{unsub_link}}
- Step 1 emails may use {{personalized_opener}} as the first line
- Step 2 emails may use {{niche_insight}} as the first line
Return JSON only: { "subject": "...", "body": "..." }`,
    `You are improving a step ${params.step} cold email for the "${params.niche}" niche.

Current performance (out of ${params.sendCount} sends):
- Open rate: ${(params.openRate * 100).toFixed(1)}%
- Reply rate: ${(params.replyRate * 100).toFixed(1)}%
- Unsubscribe rate: ${(params.unsubRate * 100).toFixed(1)}%

Current subject: ${params.currentSubject}
Current body:
${params.currentBody}

Rewrite this email to improve open rate and reply rate. Focus on the biggest weakness in the current version. Keep the same step in the sequence (${params.step === 1 ? 'first contact' : params.step === 2 ? 'follow-up with insight' : params.step === 3 ? 'social proof follow-up' : params.step === 4 ? 'final breakup email' : 're-engagement'}).`,
    600
  )

  try {
    const parsed = JSON.parse(result) as { subject: string; body: string }
    if (!parsed.subject || !parsed.body) throw new Error('Missing fields')
    return parsed
  } catch {
    throw new Error(`Claude returned non-JSON: ${result.slice(0, 200)}`)
  }
}

export async function generateBlogPost(niche: string): Promise<{ title: string; content: string; metaDescription: string }> {
  const contentText = await generateText(
    `You are an expert content writer specializing in AI automation and local business marketing.
Write SEO-optimized blog posts in clean HTML (h1, h2, h3, p, ul, li tags only).
Target keyword: "AI automation for ${niche} businesses"
Word count: 800-1000 words.
Tone: authoritative but accessible. Real examples. Specific, not generic.`,
    `Write a complete blog post about how AI automation is transforming ${niche} businesses.
Include: intro, 3-4 main points with subheadings, a real-world example section, and a conclusion with CTA to book a call.
Return JSON with keys: title, content (HTML), metaDescription (max 155 chars)`,
    1500
  )

  try {
    // Try to parse if Claude returns JSON
    const parsed = JSON.parse(contentText) as { title: string; content: string; metaDescription: string }
    return parsed
  } catch {
    // Fallback: extract from text
    return {
      title: `How AI Automation Is Transforming ${niche.charAt(0).toUpperCase() + niche.slice(1)} Businesses`,
      content: contentText,
      metaDescription: `Discover how AI automation tools help ${niche} businesses generate more leads, follow up faster, and grow revenue without adding staff.`,
    }
  }
}
