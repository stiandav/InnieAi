import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Nav } from '@/components/marketing/Nav'
import { Footer } from '@/components/marketing/Footer'
import type { Post } from '@/types/database'

export const metadata: Metadata = {
  title: 'Blog — AI Automation for Local Businesses',
  description: 'Insights, strategies, and case studies on AI automation for local service businesses.',
}

export default async function BlogPage() {
  let posts: Post[] = []
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(20)
    posts = data ?? []
  } catch {
    posts = []
  }

  return (
    <main>
      <Nav />
      <section className="pt-32 pb-20 bg-gradient-navy">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-cream mb-4">
            The InnieAI Blog
          </h1>
          <p className="text-cream/50 text-xl max-w-xl mx-auto">
            AI automation insights for local service businesses.
          </p>
        </div>
      </section>

      <section className="py-20 bg-navy-light">
        <div className="max-w-5xl mx-auto px-6">
          {posts.length === 0 ? (
            <p className="text-center text-cream/40">Posts coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-navy border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all"
                >
                  {post.niche && (
                    <span className="inline-block bg-accent/15 text-accent text-xs font-medium px-3 py-1 rounded-full mb-4">
                      {post.niche}
                    </span>
                  )}
                  <h2 className="text-cream font-semibold text-lg mb-3 group-hover:text-accent transition-colors leading-snug">
                    {post.title}
                  </h2>
                  {post.meta_description && (
                    <p className="text-cream/50 text-sm leading-relaxed line-clamp-2 mb-4">
                      {post.meta_description}
                    </p>
                  )}
                  <p className="text-cream/30 text-xs">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : ''}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}
