import React from 'react'

interface HeroProps {
  calcomLink: string
}

export function Hero({ calcomLink }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-navy" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-accent/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/4 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

        {/* Scarcity badge */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-amber-300 text-sm font-medium">Only 5 spots left per niche per city</span>
        </div>

        {/* Headline — outcome-first */}
        <h1 className="text-5xl md:text-7xl font-bold text-cream leading-[1.05] mb-6">
          47 new patients.<br />
          <span className="text-accent">90 days. Zero ad spend.</span>
        </h1>

        {/* Pain-naming subhead */}
        <p className="text-xl md:text-2xl text-cream/60 max-w-2xl mx-auto mb-6 leading-relaxed">
          Most local businesses lose 60% of their leads to slow follow-up. InnieAI builds the automation that finds leads, follows up instantly, collects reviews, and reports results — every week, on autopilot.
        </p>

        {/* Inline testimonial — social proof above the fold */}
        <div className="inline-flex items-start gap-3 bg-white/[0.04] border border-white/[0.08] rounded-xl px-5 py-4 mb-10 max-w-xl mx-auto text-left">
          <div className="flex gap-0.5 flex-shrink-0 mt-0.5">
            {[1,2,3,4,5].map(i => (
              <svg key={i} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>
          <p className="text-cream/70 text-sm leading-relaxed">
            <span className="text-cream font-medium">&ldquo;We went from 22 reviews to 89 in four months.</span> That kind of social proof changes everything for a local business.&rdquo;
            <span className="block text-cream/40 text-xs mt-1">— Dr. Marcus Johnson, Elite Dental Group</span>
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a
            href={calcomLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-150 shadow-lg shadow-accent/25 hover:shadow-accent/35 hover:-translate-y-0.5"
          >
            Get My Free Automation Audit →
          </a>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-cream border border-white/10 font-medium px-8 py-4 rounded-lg text-lg transition-all duration-150"
          >
            See How It Works ↓
          </a>
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-cream/40 text-sm">
          {[
            'No contracts required',
            'Live in under 14 days',
            'Weekly performance reports',
            'Cancel anytime',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy-light to-transparent pointer-events-none" />
    </section>
  )
}
