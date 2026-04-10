/**
 * Self-serve Starter checkout — no call or proposal required
 * Used by: pricing page "Get Started" button for Starter tier
 *
 * The Stripe webhook (checkout.session.completed) handles the rest:
 * creates the client record, sends the welcome email, kicks off onboarding.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name?: string
      email?: string
      company?: string
    }

    const setupPriceId = process.env.STRIPE_STARTER_SETUP_PRICE_ID
    if (!setupPriceId) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    const stripe = getStripe()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: body.email || undefined,
      line_items: [{ price: setupPriceId, quantity: 1 }],
      mode: 'payment',
      allow_promotion_codes: true,
      success_url: `${baseUrl}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#pricing`,
      metadata: {
        tier: 'Starter',
        client_name: body.name ?? 'New Client',
        company: body.company ?? body.name ?? 'New Business',
        monthly_price_id: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? '',
        monthly_amount: '150000',
      },
    })

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (err) {
    console.error('Starter checkout error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout failed' },
      { status: 500 }
    )
  }
}
