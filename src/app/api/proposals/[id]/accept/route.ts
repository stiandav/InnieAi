import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import type { ApiResponse, AcceptProposalResponse } from '@/types/api'
import { PRICING } from '@/types'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<AcceptProposalResponse>>> {
  const { id } = await params

  const supabase = createServerClient()
  const { data: proposal } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single()

  if (!proposal) {
    return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ success: false, error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' })

  const tier = proposal.tier as 'Starter' | 'Growth' | 'Scale'
  const pricing = PRICING[tier]

  const setupPriceIdMap: Record<string, string> = {
    Starter: process.env.STRIPE_STARTER_SETUP_PRICE_ID ?? '',
    Growth: process.env.STRIPE_GROWTH_SETUP_PRICE_ID ?? '',
    Scale: process.env.STRIPE_SCALE_SETUP_PRICE_ID ?? '',
  }

  const monthlyPriceIdMap: Record<string, string> = {
    Starter: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? '',
    Growth: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID ?? '',
    Scale: process.env.STRIPE_SCALE_MONTHLY_PRICE_ID ?? '',
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: setupPriceIdMap[tier] || undefined,
        quantity: 1,
      },
    ].filter((item) => item.price),
    mode: 'payment',
    success_url: `${baseUrl}/proposal/${id}?status=accepted`,
    cancel_url: `${baseUrl}/proposal/${id}`,
    metadata: {
      proposal_id: id,
      tier,
      client_name: proposal.client_name,
      company: proposal.company,
      monthly_price_id: monthlyPriceIdMap[tier] ?? '',
      monthly_amount: String(pricing.monthly * 100),
    },
  })

  // Status stays pending until Stripe webhook confirms payment
  await supabase
    .from('proposals')
    .update({ stripe_checkout_url: session.url, status: 'Pending Payment' })
    .eq('id', id)

  return NextResponse.json({
    success: true,
    data: { checkoutUrl: session.url! },
  })
}
