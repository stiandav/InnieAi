import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'
import { getStripe, TIER_MRR, TIER_SETUP } from '@/lib/stripe'
import type { ApiResponse } from '@/types/api'
import type { Tier } from '@/types/database'

type Params = { params: Promise<{ id: string }> }

// GET — fetch proposal (tracks first view + view count)
export async function GET(
  _req: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse>> {
  const { id } = await params
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  // Track view
  const updates: Record<string, unknown> = {
    view_count: (data.view_count ?? 0) + 1,
  }
  if (!data.first_viewed_at) {
    updates.first_viewed_at = new Date().toISOString()
  }
  if (data.status === 'Sent') {
    updates.status = 'Viewed'
  }
  await supabase.from('proposals').update(updates).eq('id', id)

  return NextResponse.json({ success: true, data })
}

// POST — send proposal or initiate acceptance (action in body)
export async function POST(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse>> {
  const { id } = await params
  const body = await req.json() as { action: 'send' | 'accept' }
  const supabase = createServerClient()

  const { data: proposal } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single()

  if (!proposal) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  // ── SEND ──────────────────────────────────────────────────────────────────
  if (body.action === 'send') {
    if (!proposal.client_email) {
      return NextResponse.json({ success: false, error: 'No email on proposal' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'
    const proposalUrl = `${baseUrl}/proposal/${id}`
    const tier = proposal.tier as Tier
    const monthly = TIER_MRR[tier]
    const setup = TIER_SETUP[tier]

    await sendEmail({
      to: proposal.client_email,
      subject: `Your InnieAI proposal — ${proposal.company}`,
      text: `Hi ${proposal.client_name},

Following up on our call — here is the custom proposal for ${proposal.company}.

View your proposal:
${proposalUrl}

Quick summary:
  Plan: ${tier}
  Monthly: $${monthly.toLocaleString()}/mo
  Setup fee: $${setup.toLocaleString()} (one-time)

Everything is in the proposal including a 90-day timeline and ROI projection. You can accept and pay directly from the page.

Any questions, just reply here.

— InnieAI`,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a2e">
<p>Hi ${proposal.client_name},</p>
<p>Following up on our call — here is the custom proposal for ${proposal.company}.</p>
<p style="margin:32px 0">
  <a href="${proposalUrl}" style="background:#2563eb;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;font-size:15px">
    View Your Proposal →
  </a>
</p>
<p style="color:#666;font-size:13px">Plan: ${tier} &nbsp;·&nbsp; $${monthly.toLocaleString()}/mo + $${setup.toLocaleString()} setup (one-time)</p>
<p>Any questions, just reply to this email.</p>
<p>— InnieAI</p>
</div>`,
    })

    await supabase.from('proposals').update({ status: 'Sent' }).eq('id', id)

    return NextResponse.json({ success: true })
  }

  // ── ACCEPT (create Stripe checkout) ───────────────────────────────────────
  if (body.action === 'accept') {
    if (!proposal.client_email) {
      return NextResponse.json({ success: false, error: 'No email on proposal' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'
    const tier = proposal.tier as Tier

    const monthlyPriceId = process.env[`STRIPE_${tier.toUpperCase()}_MONTHLY_PRICE_ID`]
    const setupPriceId = process.env[`STRIPE_${tier.toUpperCase()}_SETUP_PRICE_ID`]

    if (!monthlyPriceId || !setupPriceId) {
      return NextResponse.json(
        { success: false, error: 'Stripe price IDs not configured for this tier' },
        { status: 500 }
      )
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: proposal.client_email,
      line_items: [
        { price: monthlyPriceId, quantity: 1 },
        { price: setupPriceId, quantity: 1 },
      ],
      success_url: `${baseUrl}/proposal/${id}/success`,
      cancel_url: `${baseUrl}/proposal/${id}`,
      metadata: {
        proposal_id: id,
        client_name: proposal.client_name,
        company: proposal.company,
        tier,
      },
    })

    await supabase
      .from('proposals')
      .update({ status: 'Pending Payment', stripe_checkout_url: session.url })
      .eq('id', id)

    return NextResponse.json({ success: true, data: { url: session.url } })
  }

  return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
}
