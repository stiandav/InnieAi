import React from 'react'

interface PreFooterCTAProps {
  calcomLink: string
}

export function PreFooterCTA({ calcomLink }: PreFooterCTAProps) {
  return (
    <section className="py-24 bg-ink relative overflow-hidden">
      {/* Subtle green tint */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,_rgba(26,107,68,0.15)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <p className="text-brand text-sm font-semibold uppercase tracking-widest mb-4">Get Started</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-canvas mb-6 leading-tight tracking-tight">
          Ready to stop doing<br />this manually?
        </h2>
        <p className="text-canvas/55 text-xl mb-10 max-w-xl mx-auto leading-relaxed">
          Book a free 30-minute audit. We&apos;ll map out exactly what we&apos;d automate for your business — no pitch, no pressure.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <a
            href={calcomLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-150 shadow-md shadow-brand/30 hover:-translate-y-0.5"
          >
            Book Free Audit Call →
          </a>
          <a
            href="#pricing"
            className="w-full sm:w-auto bg-canvas/8 hover:bg-canvas/15 text-canvas border border-canvas/15 font-medium px-8 py-4 rounded-lg text-lg transition-all duration-150"
          >
            View Pricing
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-canvas/35 text-sm">
          {['No contracts', '14-day setup', 'Weekly reports', 'Cancel anytime'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-brand" fill="currentColor" viewBox="0 0 20 20">
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
