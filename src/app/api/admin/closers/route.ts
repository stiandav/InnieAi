import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('closers')
    .select('*')
    .order('created_at', { ascending: false })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { name: string; email: string; commission_pct?: number }
  if (!body.name?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('closers')
    .insert({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      commission_pct: body.commission_pct ?? 20,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const { id, is_active } = await req.json() as { id: string; is_active: boolean }
  const supabase = createServerClient()
  const { error } = await supabase
    .from('closers')
    .update({ is_active })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
