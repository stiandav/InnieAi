import { NextRequest, NextResponse } from 'next/server'
import { generateBlogPost } from '@/lib/anthropic'
import { createServerClient } from '@/lib/supabase/server'

const NICHES = ['real estate', 'dental', 'med spa', 'gym', 'contractor', 'law firm']

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

export async function POST(_req: NextRequest) {
  try {
    const randomNiche = NICHES[Math.floor(Math.random() * NICHES.length)]
    const postData = await generateBlogPost(randomNiche)
    const slug = slugify(postData.title)

    const supabase = createServerClient()

    const { data: existing } = await supabase.from('posts').select('id').eq('slug', slug).limit(1)
    const finalSlug = existing && existing.length > 0 ? `${slug}-${Date.now()}` : slug

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: postData.title,
        slug: finalSlug,
        content: postData.content,
        niche: randomNiche,
        meta_description: postData.metaDescription,
        published: true,
        published_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
