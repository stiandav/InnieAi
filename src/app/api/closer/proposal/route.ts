/**
 * Closer proposal creation endpoint — no admin login required
 * Protected by CLOSER_SECRET env var (share this with your freelance closers)
 *
 * POST /api/closer/proposal
 * Body: { secret, clientName, clientEmail, company, niche, painPoints, tier }
 * Returns: { proposalUrl }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateProposal } from '@/lib/anthropic'
import { PRICING } from '@/types'
import { sendEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    secret: string
    clientName: string
    clientEmail?: string
    company: string
    niche: string
    painPoints: string
    tier: 'Starter' | 'Growth' | 'Scale'
  }

  const closerSecret = process.env.CLOSER_SECRET
  if (!closerSecret || body.secret !== closerSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { clientName, clientEmail, company, niche, painPoints, tier } = body
  if (!clientName || !company || !niche || !painPoints || !tier) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const pricing = PRICING[tier]
  const contentHtml = await generateProposal({
    clientName, company, niche, painPoints, tier,
    monthlyPrice: pricing.monthly,
    setupFee: pricing.setup,
  })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('proposals')
    .insert({
      client_name: clientName,
      client_email: clientEmail ?? null,
      company,
      niche,
      pain_points: painPoints,
      tier,
      content_html: contentHtml,
      status: 'Sent',
      view_count: 0,
    })
    .select('id')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Failed to save proposal' }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'
  const proposalUrl = `${baseUrl}/proposal/${data.id}`

  // Email the proposal link to the client if we have their email
  if (clientEmail) {
    await sendEmail({
      to: clientEmail,
      subject: `Your InnieAI proposal is ready, ${clientName.split(' ')[0]}`,
      text: `Hi ${clientName.split(' ')[0]},\n\nGreat speaking with you. As promised, here's your custom InnieAI proposal:\n\n${proposalUrl}\n\nThe proposal includes pricing, deliverables, a 90-day timeline, and a checkout link. Let me know if you have any questions.\n\nThe InnieAI Team`,
    })
  }

  // Alert owner
  const ownerEmail = process.env.OWNER_EMAIL
  if (ownerEmail) {
    await sendEmail({
      to: ownerEmail,
      subject: `📋 New proposal created: ${company} (${tier})`,
      text: `A closer created a proposal.\n\nClient: ${clientName}\nCompany: ${company}\nNiche: ${niche}\nTier: ${tier}\n\nProposal: ${proposalUrl}`,
    })
  }

  return NextResponse.json({ proposalUrl })
}
