import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { ApiResponse, AffiliateSignupResponse } from '@/types/api'

function generateRefCode(name: string): string {
  const base = name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6)
  const suffix = Math.floor(Math.random() * 900 + 100)
  return `${base}${suffix}`
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<AffiliateSignupResponse>>> {
  const body = await req.json() as { name: string; email: string }

  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ success: false, error: 'Name and email are required' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Check for existing affiliate
  const { data: existing } = await supabase
    .from('affiliates')
    .select('ref_code')
    .eq('email', body.email)
    .single()

  if (existing) {
    return NextResponse.json({
      success: true,
      data: { refCode: existing.ref_code },
    })
  }

  const refCode = generateRefCode(body.name)

  const { error } = await supabase.from('affiliates').insert({
    name: body.name,
    email: body.email,
    ref_code: refCode,
    commission_rate: 15.0,
    total_earned: 0,
  })

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create affiliate account' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: { refCode },
  })
}
