import React from 'react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-navy border-t border-white/[0.06] py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="text-cream font-bold text-xl tracking-tight block mb-3">
              Innie<span className="text-accent">AI</span>
            </Link>
            <p className="text-cream/40 text-sm leading-relaxed max-w-xs mb-5">
              AI automation for local service businesses. Lead gen, follow-up, reputation, and reporting — fully on autopilot.
            </p>
            <div className="flex items-center gap-2 text-cream/30 text-xs">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              All systems operational
            </div>
          </div>

          <div>
            <p className="text-cream/25 text-xs uppercase tracking-widest font-medium mb-4">Industries</p>
            <ul className="space-y-2.5">
              {[
                ['Dental Practices', '/for/dental'],
                ['Med Spas', '/for/medspa'],
                ['Gyms & Fitness', '/for/gyms'],
                ['Contractors', '/for/contractors'],
                ['Real Estate', '/for/real-estate'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-cream/45 hover:text-cream text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-cream/25 text-xs uppercase tracking-widest font-medium mb-4">Company</p>
            <ul className="space-y-2.5">
              {[
                ['Blog', '/blog'],
                ['Partner Program', '/partners'],
                ['Pricing', '/#pricing'],
                ['Services', '/#services'],
                ['Book a Call', process.env.NEXT_PUBLIC_CALCOM_LINK || '#'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-cream/45 hover:text-cream text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cream/25 text-sm">
            © {new Date().getFullYear()} InnieAI. All rights reserved.
          </p>
          <p className="text-cream/20 text-xs">
            Powered by Anthropic Claude · Google Places · Stripe · Resend
          </p>
        </div>
      </div>
    </footer>
  )
}
