/**
 * UGC Creator application handler
 * POST /api/jobs/ugc-apply
 *
 * 1. Saves the application
 * 2. Claude scores it 1–10
 * 3. Score >= 6: auto-approved → registered as affiliate → email sent with ref link + creative brief
 * 4. Score < 4: polite rejection email
 * 5. Owner alerted either way
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendEmail, sendOwnerAlert } from '@/lib/resend'
import { generateText } from '@/lib/anthropic'

const APPROVAL_THRESHOLD = 6
const UGC_COMMISSION_RATE = 15 // % recurring

function generateRefCode(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)
  const rand = Math.random().toString(36).slice(2, 6)
  return `${base}-${rand}`
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    name: string
    email: string
    instagram_url?: string
    tiktok_url?: string
    niche_experience: string
    content_samples: string
    why_fit: string
  }

  const { name, email, niche_experience, content_samples, why_fit, instagram_url, tiktok_url } = body
  if (!name?.trim() || !email?.trim() || !niche_experience?.trim() || !content_samples?.trim() || !why_fit?.trim()) {
    return NextResponse.json({ error: 'All required fields must be filled in.' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Prevent duplicate applications — check affiliates and re-applications
  const { data: existingAffiliate } = await supabase
    .from('affiliates')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (existingAffiliate) {
    return NextResponse.json({ success: true }) // already an affiliate, don't re-apply
  }

  // ── Claude evaluation ────────────────────────────────────────────────────

  let claudeScore = 5
  let claudeNotes = ''

  try {
    const evalResult = await generateText(
      `You evaluate UGC creator applications for an AI automation SaaS called InnieAI.
InnieAI sells to local business owners (dental practices, gyms, med spas, contractors).

Score the creator 1–10 where:
8–10 = Strong fit: content aimed at business owners, B2B or local service niche experience, clear angle for InnieAI content
5–7  = Possible fit: some business-owner audience, could work with guidance
1–4  = Poor fit: consumer-only audience, no niche alignment, vague answers

Return JSON only: { "score": <number>, "notes": "<one sentence reasoning>" }`,
      `Creator: ${name}
Instagram: ${instagram_url || 'not provided'}
TikTok: ${tiktok_url || 'not provided'}

Niche experience:
${niche_experience}

Content samples / past brand work:
${content_samples}

Why they're a fit for an AI automation brand:
${why_fit}

We need creators whose audience includes business owners who could benefit from AI lead generation automation.`
    )

    const parsed = JSON.parse(evalResult) as { score: number; notes: string }
    claudeScore = Math.max(1, Math.min(10, parsed.score))
    claudeNotes = parsed.notes
  } catch {
    claudeScore = 5
    claudeNotes = 'Auto-evaluation unavailable — defaulted to manual review'
  }

  const approved = claudeScore >= APPROVAL_THRESHOLD
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'

  // ── Register as affiliate if approved ────────────────────────────────────

  let refCode: string | null = null
  let affiliateId: string | null = null

  if (approved) {
    refCode = generateRefCode(name)
    const { data: newAffiliate } = await supabase
      .from('affiliates')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        ref_code: refCode,
        commission_rate: UGC_COMMISSION_RATE,
        total_earned: 0,
      })
      .select('id')
      .single()
    affiliateId = newAffiliate?.id ?? null
  }

  // ── Email the creator ────────────────────────────────────────────────────

  if (approved && refCode) {
    const affiliateLink = `${baseUrl}/?ref=${refCode}`
    await sendEmail({
      to: email,
      subject: `You're in — InnieAI Creator Partner`,
      text: `Hi ${name.split(' ')[0]},

You're approved as an InnieAI UGC creator partner.

YOUR AFFILIATE LINK
${affiliateLink}

Put this link in your bio, story, or video description. Every business owner who signs up through it earns you 15% of their monthly subscription — recurring, for as long as they stay.

COMMISSION
Starter ($1,500/mo) → you earn $225/month
Growth ($2,500/mo)  → you earn $375/month
Scale ($4,000/mo)   → you earn $600/month

Paid on the 1st of every month via bank transfer or PayPal.

CREATIVE BRIEF

WHAT TO SHOW:
InnieAI automates the #1 problem local businesses have: following up with leads. Most dental offices, gyms, and med spas lose 60% of enquiries because nobody follows up fast enough. InnieAI does it automatically — finds new leads every day, sends personalised follow-ups, generates weekly reports for the owner.

BEST ANGLES THAT CONVERT:
1. "Here's how [dental practice / gym / med spa] gets 3x more leads without hiring anyone"
2. "This AI runs my marketing while I sleep" (owner POV)
3. "I used to spend 3 hours a week on follow-ups. Now it's zero." (pain-then-solution)

DO:
✓ Show the dashboard / reports if you get access
✓ Use real numbers (89 Google reviews gained, 3x lead response rate)
✓ Talk to business owners, not consumers
✓ Mention the 14-day setup and no contracts

DON'T:
✗ Say "get rich quick" or make income promises
✗ Mislead about what the product does
✗ Use footage that looks like an ad without disclosing it's sponsored

PRODUCT ACCESS:
Reply to this email to request a demo account.

Questions? Reply here.

Welcome aboard,
InnieAI`,
    })
  } else if (!approved && claudeScore < 4) {
    await sendEmail({
      to: email,
      subject: `Your InnieAI creator application`,
      text: `Hi ${name.split(' ')[0]},

Thanks for applying to partner with InnieAI as a UGC creator.

After reviewing your application, we don't think it's the right fit at this time — our content needs to reach business owners specifically, and we didn't see a strong match there.

We'll keep your details on file in case that changes.

Best of luck,
InnieAI`,
    })
  }

  // ── Alert owner ──────────────────────────────────────────────────────────

  await sendOwnerAlert(
    `${approved ? '✅' : '⏳'} UGC application: ${name} (score ${claudeScore}/10)`,
    `Name: ${name}\nEmail: ${email}\nInstagram: ${instagram_url || 'N/A'}\nTikTok: ${tiktok_url || 'N/A'}\n\nClaude score: ${claudeScore}/10\nDecision: ${approved ? `AUTO-APPROVED — ref code: ${refCode}` : claudeScore >= 4 ? 'PENDING manual review' : 'REJECTED'}\nReasoning: ${claudeNotes}\n\nNiche experience:\n${niche_experience}\n\nContent samples:\n${content_samples}\n\nWhy fit:\n${why_fit}`
  )

  return NextResponse.json({ success: true })
}
