import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is required')
    _stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' })
  }
  return _stripe
}

export function getTierFromPriceId(priceId: string): 'Starter' | 'Growth' | 'Scale' | null {
  const map: Record<string, 'Starter' | 'Growth' | 'Scale'> = {
    [process.env.STRIPE_STARTER_MONTHLY_PRICE_ID ?? '']: 'Starter',
    [process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID ?? '']: 'Growth',
    [process.env.STRIPE_SCALE_MONTHLY_PRICE_ID ?? '']: 'Scale',
    [process.env.STRIPE_STARTER_SETUP_PRICE_ID ?? '']: 'Starter',
    [process.env.STRIPE_GROWTH_SETUP_PRICE_ID ?? '']: 'Growth',
    [process.env.STRIPE_SCALE_SETUP_PRICE_ID ?? '']: 'Scale',
  }
  return map[priceId] ?? null
}

export const TIER_MRR: Record<'Starter' | 'Growth' | 'Scale', number> = {
  Starter: 150000, // in cents
  Growth: 250000,
  Scale: 400000,
}

export const TIER_SETUP: Record<'Starter' | 'Growth' | 'Scale', number> = {
  Starter: 150000,
  Growth: 200000,
  Scale: 250000,
}
