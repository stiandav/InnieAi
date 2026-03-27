import React from 'react'
import { createServerClient } from '@/lib/supabase/server'
import type { Testimonial } from '@/types/database'

const metrics: Record<string, string> = {
  'Dr. Marcus Johnson': '22 → 89 Google reviews in 4 months',
  'Jennifer Walsh': '$0 in ad spend · 31 new clients in 90 days',
  'Tanya Rodriguez': '60% → 12% lead loss rate after automation',
  'Steven Park': '22 → 89 reviews · top 3 Google ranking',
}

const niches: Record<string, string> = {
  'Dr. Marcus Johnson': 'Dental',
  'Jennifer Walsh': 'Med Spa',
  'Tanya Rodriguez': 'Fitness',
  'Steven Park': 'Law Firm',
}

async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(6)
    return (data as Testimonial[]) ?? []
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
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Client Results</p>
          <h2 className="text-4xl md:text-5xl font-bold text-cream mb-6">
            Real businesses.<br />Measurable results.
          </h2>
          <p className="text-xl text-cream/50 max-w-xl mx-auto">
            Not case studies we wrote. Words from the clients themselves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => {
            const metric = t.author_name ? metrics[t.author_name] : null
            const niche = t.author_name ? niches[t.author_name] : null
            return (
              <div
                key={t.id}
                className="bg-navy-light border border-white/[0.07] rounded-2xl p-8 flex flex-col gap-5 hover:border-white/[0.12] transition-all duration-200"
              >
                {/* Metric callout */}
                {metric && (
                  <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-lg px-4 py-2.5 self-start">
                    <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                    <span className="text-accent font-semibold text-sm">{metric}</span>
                  </div>
                )}

                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-cream/75 text-base leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                  <div>
                    <p className="text-cream font-semibold text-sm">{t.author_name}</p>
                    <p className="text-cream/40 text-xs mt-0.5">{t.author_title}</p>
                  </div>
                  {niche && (
                    <div className="bg-white/5 text-cream/40 text-xs font-medium px-3 py-1 rounded-full">
                      {niche}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
