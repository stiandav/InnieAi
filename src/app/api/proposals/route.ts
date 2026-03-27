import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateProposal } from '@/lib/anthropic'
import type { ApiResponse, CreateProposalResponse } from '@/types/api'
import { PRICING } from '@/types'

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<CreateProposalResponse>>> {
  try {
    const body = await req.json() as {
      clientName: string
      company: string
      niche: string
      painPoints: string
      tier: 'Starter' | 'Growth' | 'Scale'
    }

    const { clientName, company, niche, painPoints, tier } = body

    if (!clientName || !company || !niche || !painPoints || !tier) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    const pricing = PRICING[tier]

    // Generate proposal HTML with Claude
    const contentHtml = await generateProposal({
      clientName,
      company,
      niche,
      painPoints,
      tier,
      monthlyPrice: pricing.monthly,
      setupFee: pricing.setup,
    })

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('proposals')
      .insert({
        client_name: clientName,
        company,
        niche,
        pain_points: painPoints,
        tier,
        content_html: contentHtml,
        status: 'Sent',
        view_count: 0,
      })
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: error?.message ?? 'Failed to save proposal' },
        { status: 500 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        url: `${baseUrl}/proposal/${data.id}`,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
