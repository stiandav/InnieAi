import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types/api'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  const { id } = await params
  const body = await req.json() as { reason?: string }

  const supabase = createServerClient()
  const { error } = await supabase
    .from('proposals')
    .update({
      status: 'Declined',
      decline_reason: body.reason ?? null,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
