import React from 'react'

interface PreFooterCTAProps {
  calcomLink: string
}

export function PreFooterCTA({ calcomLink }: PreFooterCTAProps) {
  return (
    <section className="py-24 bg-navy relative overflow-hidden">
      <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Get Started</p>
        <h2 className="text-4xl md:text-5xl font-bold text-cream mb-6 leading-tight">
          Ready to stop doing<br />this manually?
        </h2>
        <p className="text-xl text-cream/50 mb-10 max-w-xl mx-auto">
          Book a free 30-minute audit. We&apos;ll map out exactly what we&apos;d automate for your business — no pitch, no pressure.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <a
            href={calcomLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-150 shadow-lg shadow-accent/25 hover:shadow-accent/35 hover:-translate-y-0.5"
          >
            Book Free Audit Call →
          </a>
          <a
            href="#pricing"
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-cream border border-white/10 font-medium px-8 py-4 rounded-lg text-lg transition-all duration-150"
          >
            View Pricing
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-cream/35 text-sm">
          {['No contracts', '14-day setup', 'Weekly reports', 'Cancel anytime'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-accent/60" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
