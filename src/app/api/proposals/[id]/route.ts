import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 })
  }

  // Track view
  const updates: Record<string, unknown> = {
    view_count: (data.view_count ?? 0) + 1,
  }
  if (!data.first_viewed_at) {
    updates.first_viewed_at = new Date().toISOString()
    if (data.status === 'Sent') updates.status = 'Viewed'
  }

  await supabase.from('proposals').update(updates).eq('id', id)

  return NextResponse.json({ success: true, data })
}
