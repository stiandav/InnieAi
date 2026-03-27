import React from 'react'
import { createServerClient } from '@/lib/supabase/server'
import type { Testimonial } from '@/types/database'

async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(6)
    return data ?? []
  } catch {
    return []
  }
}

export async function Testimonials() {
  const testimonials = await getTestimonials()

  if (testimonials.length === 0) return null

  return (
    <section className="py-32 bg-navy">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Results</p>
          <h2 className="text-4xl md:text-5xl font-bold text-cream mb-6">
            Clients who stopped guessing<br />and started growing
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-navy-light border border-white/[0.06] rounded-2xl p-8 flex flex-col"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-cream/70 text-sm leading-relaxed flex-1 mb-6">
                &quot;{t.quote}&quot;
              </blockquote>
              <div>
                <p className="text-cream font-semibold text-sm">{t.author_name}</p>
                <p className="text-cream/40 text-xs">{t.author_title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
