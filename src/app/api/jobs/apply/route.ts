/**
 * Closer job application handler
 * POST /api/jobs/apply
 *
 * 1. Saves the application
 * 2. Claude scores it 1–10 with reasoning
 * 3. Score >= 6: auto-approved → added to closers table → email sent with CLOSER_SECRET
 * 4. Score < 6: polite rejection email sent
 * 5. Owner alerted either way
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendEmail, sendOwnerAlert } from '@/lib/resend'
import { generateText } from '@/lib/anthropic'

const APPROVAL_THRESHOLD = 6 // Claude score out of 10
const DEFAULT_COMMISSION  = 20 // %

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    name: string
    email: string
    experience: string
    why_them: string
    linkedin_url?: string
  }

  const { name, email, experience, why_them, linkedin_url } = body
  if (!name?.trim() || !email?.trim() || !experience?.trim() || !why_them?.trim()) {
    return NextResponse.json({ error: 'All required fields must be filled in.' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Prevent duplicate applications
  const { data: existing } = await supabase
    .from('closer_applications')
    .select('id, status')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (existing) {
    // Don't reveal rejection; just acknowledge
    return NextResponse.json({ success: true })
  }

  // ── Claude evaluation ────────────────────────────────────────────────────

  let claudeScore = 5
  let claudeNotes = ''

  try {
    const evalResult = await generateText(
      `You evaluate job applications for a commission-based B2B sales closer role.
Score the applicant 1–10 where:
8–10 = Strong fit: relevant B2B or high-ticket sales experience, articulate, motivated by commission
5–7  = Possible fit: some sales experience, reasonable answers, worth trying
1–4  = Poor fit: no relevant experience, vague answers, or red flags

Return JSON only: { "score": <number>, "notes": "<one sentence reasoning>" }`,
      `Applicant: ${name}
LinkedIn: ${linkedin_url || 'not provided'}

Sales background:
${experience}

Why they want this role:
${why_them}

Role context: Inbound B2B sales closer, 15-minute calls, pre-qualified leads, 20% commission on $1,500–$2,500 setup fees.`
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
  const closerSecret = process.env.CLOSER_SECRET ?? ''

  // ── Save application ─────────────────────────────────────────────────────

  let closerId: string | null = null

  if (approved) {
    // Add them as a closer immediately
    const { data: newCloser } = await supabase
      .from('closers')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        commission_pct: DEFAULT_COMMISSION,
        is_active: true,
      })
      .select('id')
      .single()

    closerId = newCloser?.id ?? null
  }

  await supabase.from('closer_applications').insert({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    experience,
    why_them,
    linkedin_url: linkedin_url || null,
    status: approved ? 'approved' : (claudeScore >= 4 ? 'pending' : 'rejected'),
    claude_score: claudeScore,
    claude_notes: claudeNotes,
    closer_id: closerId,
  })

  // ── Email the applicant ──────────────────────────────────────────────────

  if (approved && closerSecret) {
    await sendEmail({
      to: email,
      subject: `You're in — InnieAI Closer`,
      text: `Hi ${name.split(' ')[0]},

Good news — you're approved as an InnieAI closer.

Here's everything you need to get started:

CLOSER PORTAL
${baseUrl}/closer
Password: ${closerSecret}

This is where you create proposals after closing a deal. It takes about 2 minutes per proposal. Enter the client's details, hit generate, and we automatically email the proposal + Stripe checkout link to the client.

HOW IT WORKS
1. When a prospect books a call on our calendar, you'll receive an email with a full briefing — who they are, their business stats, talking points, and likely objections.
2. Show up to the call. The briefing has everything you need.
3. Close the deal → go to the closer portal → generate the proposal.
4. Once the client pays, you receive ${DEFAULT_COMMISSION}% of their setup fee within 5 days.

COMMISSION
Setup fees: $1,500 (Starter), $2,000 (Growth), $2,500 (Scale)
Your cut: $300, $400, or $500 per close.

You'll get your first briefing email the next time a call is booked. No action needed from you until then.

Welcome aboard.
InnieAI`,
    })
  } else if (!approved && claudeScore < 4) {
    await sendEmail({
      to: email,
      subject: `Your InnieAI application`,
      text: `Hi ${name.split(' ')[0]},

Thanks for applying to be a sales closer at InnieAI.

After reviewing your application, we don't think it's the right fit at this time. We'll keep your details on file in case that changes.

Best of luck,
InnieAI`,
    })
  }
  // Score 4–5: no email yet, manual review bucket

  // ── Alert owner ──────────────────────────────────────────────────────────

  await sendOwnerAlert(
    `${approved ? '✅' : '⏳'} Closer application: ${name} (score ${claudeScore}/10)`,
    `Name: ${name}\nEmail: ${email}\nLinkedIn: ${linkedin_url || 'N/A'}\n\nClaude score: ${claudeScore}/10\nDecision: ${approved ? 'AUTO-APPROVED + onboarded' : claudeScore >= 4 ? 'PENDING manual review' : 'REJECTED'}\nReasoning: ${claudeNotes}\n\nExperience:\n${experience}\n\nWhy them:\n${why_them}`
  )

  return NextResponse.json({ success: true })
}
