import { NextResponse } from 'next/server'
import type { SetupCheckResult } from '@/types/api'

const ENV_VARS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'ANTHROPIC_API_KEY',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'RESEND_DOMAIN',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_STARTER_MONTHLY_PRICE_ID',
  'STRIPE_GROWTH_MONTHLY_PRICE_ID',
  'STRIPE_SCALE_MONTHLY_PRICE_ID',
  'STRIPE_STARTER_SETUP_PRICE_ID',
  'STRIPE_GROWTH_SETUP_PRICE_ID',
  'STRIPE_SCALE_SETUP_PRICE_ID',
  'GOOGLE_PLACES_API_KEY',
  'OWNER_EMAIL',
  'NEXT_PUBLIC_BASE_URL',
  'CALCOM_LINK',
]

async function testSupabase(): Promise<SetupCheckResult> {
  try {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY
    if (!url || !key) return { service: 'Supabase', status: 'missing', message: 'Missing credentials' }

    const res = await fetch(`${url}/rest/v1/leads?limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    })
    if (res.ok || res.status === 406) {
      return { service: 'Supabase', status: 'ok', message: 'Connection successful' }
    }
    return { service: 'Supabase', status: 'error', message: `HTTP ${res.status}` }
  } catch (e) {
    return { service: 'Supabase', status: 'error', message: String(e) }
  }
}

async function testStripe(): Promise<SetupCheckResult> {
  try {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) return { service: 'Stripe', status: 'missing', message: 'Missing STRIPE_SECRET_KEY' }

    const res = await fetch('https://api.stripe.com/v1/account', {
      headers: { Authorization: `Bearer ${key}` },
    })
    if (res.ok) return { service: 'Stripe', status: 'ok', message: 'Connection successful' }
    return { service: 'Stripe', status: 'error', message: `HTTP ${res.status}` }
  } catch (e) {
    return { service: 'Stripe', status: 'error', message: String(e) }
  }
}

async function testResend(): Promise<SetupCheckResult> {
  try {
    const key = process.env.RESEND_API_KEY
    if (!key) return { service: 'Resend', status: 'missing', message: 'Missing RESEND_API_KEY' }

    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${key}` },
    })
    if (res.ok) return { service: 'Resend', status: 'ok', message: 'Connection successful' }
    return { service: 'Resend', status: 'error', message: `HTTP ${res.status}` }
  } catch (e) {
    return { service: 'Resend', status: 'error', message: String(e) }
  }
}

async function testAnthropic(): Promise<SetupCheckResult> {
  try {
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) return { service: 'Anthropic', status: 'missing', message: 'Missing ANTHROPIC_API_KEY' }

    const res = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
    })
    if (res.ok) return { service: 'Anthropic', status: 'ok', message: 'Connection successful' }
    return { service: 'Anthropic', status: 'error', message: `HTTP ${res.status}` }
  } catch (e) {
    return { service: 'Anthropic', status: 'error', message: String(e) }
  }
}

async function testGooglePlaces(): Promise<SetupCheckResult> {
  try {
    const key = process.env.GOOGLE_PLACES_API_KEY
    if (!key) return { service: 'Google Places', status: 'missing', message: 'Missing GOOGLE_PLACES_API_KEY' }

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=test&key=${key}`
    )
    const data = await res.json() as { status: string }
    if (data.status === 'ZERO_RESULTS' || data.status === 'OK') {
      return { service: 'Google Places', status: 'ok', message: 'API key valid' }
    }
    return { service: 'Google Places', status: 'error', message: `API status: ${data.status}` }
  } catch (e) {
    return { service: 'Google Places', status: 'error', message: String(e) }
  }
}

export async function GET() {
  const envChecks: SetupCheckResult[] = ENV_VARS.map((key) => ({
    service: key,
    status: process.env[key] ? 'ok' : 'missing',
    message: process.env[key] ? 'Set' : 'Not set',
  }))

  const [supabase, stripe, resend, anthropic, places] = await Promise.all([
    testSupabase(),
    testStripe(),
    testResend(),
    testAnthropic(),
    testGooglePlaces(),
  ])

  const serviceChecks = [supabase, stripe, resend, anthropic, places]

  return NextResponse.json({
    envChecks,
    serviceChecks,
    allGreen:
      envChecks.every((c) => c.status === 'ok') &&
      serviceChecks.every((c) => c.status === 'ok'),
  })
}
