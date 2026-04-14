import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'
import type { ApiResponse } from '@/types/api'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse<ApiResponse>> {
  const { token } = await params
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('clients')
    .select('id, name, company, tier, onboarding_complete')
    .eq('portal_token', token)
    .single()

  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse<ApiResponse>> {
  const { token } = await params
  const body = await req.json() as {
    goals: string
    currentTools: string
    mainContact: string
    mainContactPhone: string
    monthlyRevenue: string
    biggestBottleneck: string
    niche: string
    city: string
    businessPhone: string
    bookingUrl: string
    businessHours: string
  }

  // Basic length guards
  if (
    body.goals?.length > 2000 ||
    body.biggestBottleneck?.length > 2000 ||
    body.currentTools?.length > 500 ||
    body.mainContact?.length > 100 ||
    body.mainContactPhone?.length > 30 ||
    body.monthlyRevenue?.length > 50 ||
    body.niche?.length > 100 ||
    body.city?.length > 100 ||
    body.businessPhone?.length > 30 ||
    body.bookingUrl?.length > 200 ||
    body.businessHours?.length > 200
  ) {
    return NextResponse.json({ success: false, error: 'Input too long' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, company, email, tier, niche')
    .eq('portal_token', token)
    .single()

  if (!client) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 404 })
  }

  const niche = body.niche?.trim().toLowerCase() || client.niche || 'unknown'
  const city = body.city?.trim() || ''

  // Save onboarding data as notes on the client
  const notes = `Goals: ${body.goals}\nBottleneck: ${body.biggestBottleneck}\nTools: ${body.currentTools}\nRevenue: ${body.monthlyRevenue}\nContact: ${body.mainContact} (${body.mainContactPhone})\nNiche: ${niche}\nCity: ${city}\nBusiness Phone: ${body.businessPhone || 'not provided'}\nBooking URL: ${body.bookingUrl || 'none'}\nBusiness Hours: ${body.businessHours || 'not provided'}`

  const { error } = await supabase
    .from('clients')
    .update({ onboarding_complete: true, status: 'Active', notes, niche })
    .eq('id', client.id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // Auto-configure lead gen targets — add client's niche and city to settings
  // so the system starts generating leads for them immediately, no VA needed
  if (niche && niche !== 'unknown') {
    try {
      const [{ data: nicheRow }, { data: cityRow }] = await Promise.all([
        supabase.from('settings').select('value').eq('key', 'base_niches').single(),
        supabase.from('settings').select('value').eq('key', 'base_cities').single(),
      ])

      const existingNiches = (nicheRow?.value ?? '').split(',').map((n: string) => n.trim()).filter(Boolean)
      const existingCities = (cityRow?.value ?? '').split(',').map((c: string) => c.trim()).filter(Boolean)

      const updatedNiches = existingNiches.includes(niche)
        ? existingNiches
        : [...existingNiches, niche]

      const updatedCities = (!city || existingCities.includes(city))
        ? existingCities
        : [...existingCities, city]

      await Promise.all([
        supabase.from('settings').upsert({ key: 'base_niches', value: updatedNiches.join(','), updated_at: new Date().toISOString() }),
        city ? supabase.from('settings').upsert({ key: 'base_cities', value: updatedCities.join(','), updated_at: new Date().toISOString() }) : Promise.resolve(),
      ])
    } catch {
      // Non-fatal — settings update failure shouldn't block onboarding
    }
  }

  // Notify owner
  const ownerEmail = process.env.OWNER_EMAIL
  if (ownerEmail) {
    await sendEmail({
      to: ownerEmail,
      subject: `🎉 ${client.company} completed onboarding — GHL setup needed`,
      text: `${client.name} at ${client.company} just completed their onboarding questionnaire.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLIENT INFO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Company: ${client.company}
Name: ${client.name}
Email: ${client.email}
Tier: ${client.tier}
Niche: ${niche}
City: ${city || 'not provided'}

THEIR ANSWERS:
Goals: ${body.goals}
Bottleneck: ${body.biggestBottleneck}
Tools they use: ${body.currentTools}
Monthly revenue: ${body.monthlyRevenue}
Main contact: ${body.mainContact} (${body.mainContactPhone})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GHL SETUP CHECKLIST (~20 mins)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] 1. Create new sub-account in GHL for ${client.company}
[ ] 2. Clone your agency snapshot into the sub-account
[ ] 3. Business phone to connect: ${body.businessPhone || 'not provided — ask client'}
[ ] 4. Business hours to set: ${body.businessHours || 'not provided — ask client'}
[ ] 5. Booking URL to wire up: ${body.bookingUrl || 'none — skip or create one in GHL'}
[ ] 6. Send client their GHL portal login
[ ] 7. Confirm automations are live (test a lead coming in)

Lead gen is now automatically configured to target:
  Niche: ${niche}
  City: ${city || 'existing cities'}

The daily scripts will start working their niche tomorrow.`,
    })
  }

  return NextResponse.json({ success: true })
}
