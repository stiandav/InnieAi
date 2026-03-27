import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, niche, published, published_at, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, posts: data ?? [] })
  } catch (err) {
    return NextResponse.json({ success: false, posts: [], error: String(err) }, { status: 500 })
  }
}
