import React from 'react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-navy border-t border-white/[0.06] py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="text-cream font-bold text-xl tracking-tight block mb-4">
              Innie<span className="text-accent">AI</span>
            </Link>
            <p className="text-cream/50 text-sm leading-relaxed max-w-xs">
              AI automation for local service businesses. Lead gen, follow-up, reputation, and reporting — on autopilot.
            </p>
          </div>

          <div>
            <p className="text-cream/30 text-xs uppercase tracking-widest font-medium mb-4">Services</p>
            <ul className="space-y-2">
              {[
                ['Lead Generation', '/#services'],
                ['AI Follow-Up', '/#services'],
                ['Support Agent', '/#services'],
                ['Review Automation', '/#services'],
                ['Weekly Reports', '/#services'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-cream/50 hover:text-cream text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-cream/30 text-xs uppercase tracking-widest font-medium mb-4">Company</p>
            <ul className="space-y-2">
              {[
                ['Blog', '/blog'],
                ['Partners', '/partners'],
                ['For Real Estate', '/for/real-estate'],
                ['For Dental', '/for/dental'],
                ['For Med Spas', '/for/medspa'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-cream/50 hover:text-cream text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cream/30 text-sm">
            © {new Date().getFullYear()} InnieAI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/for/real-estate" className="text-cream/30 hover:text-cream/60 text-xs transition-colors">Real Estate</Link>
            <Link href="/for/dental" className="text-cream/30 hover:text-cream/60 text-xs transition-colors">Dental</Link>
            <Link href="/for/medspa" className="text-cream/30 hover:text-cream/60 text-xs transition-colors">Med Spas</Link>
            <Link href="/for/gyms" className="text-cream/30 hover:text-cream/60 text-xs transition-colors">Gyms</Link>
            <Link href="/for/contractors" className="text-cream/30 hover:text-cream/60 text-xs transition-colors">Contractors</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
