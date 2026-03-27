import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types/api'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse<ApiResponse>> {
  const { token } = await params
  const body = await req.json() as {
    rating: number
    quote: string
    authorName: string
    authorTitle: string
  }

  if (!body.quote?.trim() || !body.authorName?.trim()) {
    return NextResponse.json({ success: false, error: 'Quote and name are required' }, { status: 400 })
  }

  if (body.rating < 1 || body.rating > 5) {
    return NextResponse.json({ success: false, error: 'Rating must be 1-5' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Find testimonial record by token
  const { data: existing } = await supabase
    .from('testimonials')
    .select('id')
    .eq('token', token)
    .single()

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from('testimonials')
      .update({
        rating: body.rating,
        quote: body.quote,
        author_name: body.authorName,
        author_title: body.authorTitle,
        published: true, // auto-publish 4+ star reviews
      })
      .eq('token', token)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
  } else {
    // Create new record (token used as ID for new testimonials)
    const { error } = await supabase
      .from('testimonials')
      .insert({
        token,
        rating: body.rating,
        quote: body.quote,
        author_name: body.authorName,
        author_title: body.authorTitle,
        published: body.rating >= 4,
      })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
