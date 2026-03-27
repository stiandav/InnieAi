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
  }

  const supabase = createServerClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, company, email, tier')
    .eq('portal_token', token)
    .single()

  if (!client) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 404 })
  }

  // Save onboarding data as notes on the client
  const notes = `Goals: ${body.goals}\nBottleneck: ${body.biggestBottleneck}\nTools: ${body.currentTools}\nRevenue: ${body.monthlyRevenue}\nContact: ${body.mainContact} (${body.mainContactPhone})`

  const { error } = await supabase
    .from('clients')
    .update({ onboarding_complete: true, status: 'Active' })
    .eq('id', client.id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // Notify owner
  const ownerEmail = process.env.OWNER_EMAIL
  if (ownerEmail) {
    await sendEmail({
      to: ownerEmail,
      subject: `🎉 ${client.company} completed onboarding`,
      text: `${client.name} at ${client.company} just completed their onboarding questionnaire.\n\n${notes}\n\nThey are now Active. Log in to the dashboard to review.`,
    })
  }

  return NextResponse.json({ success: true })
}
