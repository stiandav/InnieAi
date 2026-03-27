import React from 'react'

interface HeroProps {
  calcomLink: string
}

export function Hero({ calcomLink }: HeroProps) {
  return (
    <section className="relative bg-canvas pt-32 pb-24 overflow-hidden">
      {/* Subtle warm texture — no blobs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,_#E8F3EC_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 text-center">

        {/* Scarcity badge */}
        <div className="inline-flex items-center gap-2 bg-brand-light border border-brand/20 rounded-full px-4 py-1.5 mb-10">
          <span className="w-1.5 h-1.5 bg-brand rounded-full" />
          <span className="text-brand text-sm font-medium">Only 5 spots left per niche per city</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-7xl font-bold text-ink leading-[1.04] tracking-tighter mb-7">
          47 new patients.<br />
          <span className="text-brand">90 days. Zero ad spend.</span>
        </h1>

        {/* Subhead */}
        <p className="text-xl md:text-2xl text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
          Most local businesses lose 60% of their leads to slow follow-up. InnieAI builds the automation that finds leads, follows up instantly, collects reviews, and reports results — every week, on autopilot.
        </p>

        {/* Inline testimonial */}
        <div className="inline-flex items-start gap-3 bg-surface border border-ink/8 rounded-xl px-5 py-4 mb-10 max-w-xl mx-auto text-left shadow-sm">
          <div className="flex gap-0.5 flex-shrink-0 mt-0.5">
            {[1,2,3,4,5].map(i => (
              <svg key={i} className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>
          <p className="text-ink/70 text-sm leading-relaxed">
            <span className="text-ink font-medium">&ldquo;We went from 22 reviews to 89 in four months.</span> That kind of social proof changes everything for a local business.&rdquo;
            <span className="block text-muted text-xs mt-1">— Dr. Marcus Johnson, Elite Dental Group</span>
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a
            href={calcomLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-150 shadow-md shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-0.5"
          >
            Get My Free Automation Audit →
          </a>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto bg-transparent hover:bg-ink/5 text-ink border border-ink/15 font-medium px-8 py-4 rounded-lg text-lg transition-all duration-150"
          >
            See How It Works ↓
          </a>
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-muted text-sm">
          {[
            'No contracts required',
            'Live in under 14 days',
            'Weekly performance reports',
            'Cancel anytime',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brand flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
