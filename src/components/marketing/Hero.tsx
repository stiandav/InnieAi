import React from 'react'

interface HeroProps {
  calcomLink: string
}

export function Hero({ calcomLink }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-navy" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-accent text-sm font-medium">AI Automation Agency</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-cream leading-tight mb-6">
          Your business runs.
          <br />
          <span className="text-accent">You don&apos;t have to.</span>
        </h1>

        {/* Subhead */}
        <p className="text-xl md:text-2xl text-cream/60 max-w-2xl mx-auto mb-12 leading-relaxed">
          InnieAI automates your lead generation, follow-up, reputation, and reporting — so you can focus on the work, not the grind.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <a
            href={calcomLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-150 shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:-translate-y-0.5"
          >
            Book a Free Audit Call →
          </a>
          <a
            href="#services"
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-cream border border-white/10 font-medium px-8 py-4 rounded-lg text-lg transition-all duration-150"
          >
            See How It Works
          </a>
        </div>

        {/* Social proof strip */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-cream/40 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            No contracts required
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Live in under 2 weeks
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Weekly performance reports
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Cancel anytime
          </div>
        </div>
      </div>
    </section>
  )
}
