import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Nav } from '@/components/marketing/Nav'
import { Footer } from '@/components/marketing/Footer'
import type { CaseStudy } from '@/types/database'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerClient()
  const { data } = await supabase
    .from('case_studies')
    .select('title')
    .eq('slug', slug)
    .single()

  return {
    title: data?.title ?? 'Case Study',
    description: `How InnieAI helped ${data?.title ?? 'a client'} grow.`,
  }
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createServerClient()

  const { data: cs } = await supabase
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!cs) notFound()

  const caseStudy = cs as CaseStudy
  const calcomLink = process.env.CALCOM_LINK || process.env.NEXT_PUBLIC_CALCOM_LINK || '#'

  return (
    <main>
      <Nav />
      <div className="pt-24 pb-20 bg-gradient-navy">
        <div className="max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-8 text-accent text-sm font-medium">
            Case Study
          </div>
          <h1 className="text-4xl font-bold text-cream mb-6">{caseStudy.title}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        <div>
          <h2 className="text-cream text-xl font-bold mb-4">The Challenge</h2>
          <p className="text-cream/60 leading-relaxed">{caseStudy.challenge}</p>
        </div>

        <div>
          <h2 className="text-cream text-xl font-bold mb-4">The Solution</h2>
          <p className="text-cream/60 leading-relaxed">{caseStudy.solution}</p>
        </div>

        <div>
          <h2 className="text-cream text-xl font-bold mb-4">The Results</h2>
          <p className="text-cream/60 leading-relaxed">{caseStudy.results}</p>
        </div>

        {caseStudy.quote && (
          <blockquote className="border-l-4 border-accent pl-6 py-2">
            <p className="text-cream/80 text-xl italic leading-relaxed">&quot;{caseStudy.quote}&quot;</p>
          </blockquote>
        )}

        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-8 text-center">
          <h3 className="text-cream font-bold text-xl mb-3">Get results like this</h3>
          <p className="text-cream/60 text-sm mb-6">Book a 30-minute audit to see what InnieAI would build for your business.</p>
          <a
            href={calcomLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Book a Free Audit →
          </a>
        </div>
      </div>

      <Footer />
    </main>
  )
}
