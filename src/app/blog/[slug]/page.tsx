import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Nav } from '@/components/marketing/Nav'
import { Footer } from '@/components/marketing/Footer'
import type { Post } from '@/types/database'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerClient()
  const { data } = await supabase.from('posts').select('title, meta_description').eq('slug', slug).single()

  return {
    title: data?.title ?? 'Blog Post',
    description: data?.meta_description ?? '',
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createServerClient()

  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!data) notFound()
  const post = data as Post
  const calcomLink = process.env.CALCOM_LINK || process.env.NEXT_PUBLIC_CALCOM_LINK || '#'

  return (
    <main>
      <Nav />
      <article className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-8">
            <Link href="/blog" className="text-accent text-sm hover:underline">← Back to Blog</Link>
          </div>

          {post.niche && (
            <span className="inline-block bg-accent/15 text-accent text-xs font-medium px-3 py-1 rounded-full mb-6">
              {post.niche}
            </span>
          )}

          <h1 className="text-4xl font-bold text-cream mb-6 leading-tight">{post.title}</h1>

          <div className="flex items-center gap-4 text-cream/30 text-sm mb-12 pb-8 border-b border-white/[0.06]">
            <span>InnieAI</span>
            <span>·</span>
            <span>
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : ''}
            </span>
          </div>

          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* CTA */}
          <div className="mt-16 bg-accent/10 border border-accent/20 rounded-2xl p-8 text-center">
            <h3 className="text-cream font-bold text-xl mb-3">Ready to automate your business?</h3>
            <p className="text-cream/60 text-sm mb-6">
              Book a free 30-minute audit to see what InnieAI would build for you.
            </p>
            <a
              href={calcomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Book a Free Call →
            </a>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  )
}
