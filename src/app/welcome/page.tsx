import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Welcome to InnieAI',
  robots: { index: false, follow: false },
}

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-navy flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-accent/15 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-cream font-bold text-3xl mb-3 tracking-tight">
          You&apos;re in.
        </h1>
        <p className="text-cream/60 text-lg mb-2">
          Payment confirmed. Welcome to InnieAI.
        </p>
        <p className="text-cream/40 text-sm mb-10">
          Check your inbox — we&apos;ve sent you an onboarding link to get your automations set up. It takes about 5 minutes.
        </p>

        <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6 text-left space-y-4 mb-8">
          <h2 className="text-cream font-semibold text-sm">What happens next</h2>
          <ol className="space-y-3">
            {[
              'Open the onboarding email and complete the 3-step questionnaire (5 min)',
              'We build your automation stack within 14 days',
              'You get access to your client portal with live stats',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-cream/60 text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-cream/30 text-xs">
          Didn&apos;t get the email?{' '}
          <a href="mailto:hello@innieai.co" className="text-accent/60 hover:text-accent transition-colors">
            Contact us
          </a>
        </p>

        <Link
          href="/"
          className="mt-6 inline-block text-cream/20 hover:text-cream/50 text-xs transition-colors"
        >
          ← Back to site
        </Link>
      </div>
    </main>
  )
}
