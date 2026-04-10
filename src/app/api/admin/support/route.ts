import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('support_tickets')
    .select('*, clients(name, company, email)')
    .order('created_at', { ascending: false })
    .limit(100)
  return NextResponse.json(data ?? [])
}

export async function PATCH(req: NextRequest) {
  const { id } = await req.json() as { id: string }
  const supabase = createServerClient()
  const { error } = await supabase
    .from('support_tickets')
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
