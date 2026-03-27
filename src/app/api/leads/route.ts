import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types/api'

export async function PATCH(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json() as { id: string; status?: string; notes?: string; sequence_step?: number }
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID required' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['Lead', 'Contacted', 'Proposal Sent', 'Closed Won', 'Active Client', 'Churned', 'Invalid']
    if (updates.status && !validStatuses.includes(updates.status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }

    const supabase = createServerClient()
    const { error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
