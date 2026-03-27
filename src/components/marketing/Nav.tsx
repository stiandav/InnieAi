'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-canvas/95 backdrop-blur-sm border-b border-ink/8' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-ink font-bold text-xl tracking-tight">
          Innie<span className="text-brand">AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#services" className="text-muted hover:text-ink text-sm transition-colors">Services</Link>
          <Link href="#who" className="text-muted hover:text-ink text-sm transition-colors">Industries</Link>
          <Link href="#pricing" className="text-muted hover:text-ink text-sm transition-colors">Pricing</Link>
          <Link href="/blog" className="text-muted hover:text-ink text-sm transition-colors">Blog</Link>
          <a
            href={process.env.NEXT_PUBLIC_CALCOM_LINK || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all hover:-translate-y-0.5 shadow-sm"
          >
            Free Audit Call →
          </a>
        </div>

        <button
          className="md:hidden text-muted hover:text-ink"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-canvas border-t border-ink/8 px-6 py-4 flex flex-col gap-4">
          <Link href="#services" onClick={() => setMobileOpen(false)} className="text-muted hover:text-ink text-sm">Services</Link>
          <Link href="#who" onClick={() => setMobileOpen(false)} className="text-muted hover:text-ink text-sm">Industries</Link>
          <Link href="#pricing" onClick={() => setMobileOpen(false)} className="text-muted hover:text-ink text-sm">Pricing</Link>
          <Link href="/blog" onClick={() => setMobileOpen(false)} className="text-muted hover:text-ink text-sm">Blog</Link>
          <a
            href={process.env.NEXT_PUBLIC_CALCOM_LINK || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand text-white text-sm font-semibold px-5 py-3 rounded-lg text-center"
          >
            Free Audit Call →
          </a>
        </div>
      )}
    </nav>
  )
}
