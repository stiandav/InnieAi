import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

function isAuthed(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value
    ?? req.headers.get('x-admin-token')
    ?? null
  return token === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createServerClient()
  const { data } = await supabase
    .from('support_tickets')
    .select('*, clients(name, company, email)')
    .order('created_at', { ascending: false })
    .limit(100)
  return NextResponse.json(data ?? [])
}

export async function PATCH(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json() as { id: string }
  const supabase = createServerClient()
  const { error } = await supabase
    .from('support_tickets')
    .update({ status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
