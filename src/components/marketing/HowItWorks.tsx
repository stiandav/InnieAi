import React from 'react'

const steps = [
  {
    number: '01',
    title: 'Free Audit Call',
    duration: '30 minutes',
    description: 'We dig into your current lead flow, follow-up process, review profile, and biggest growth bottlenecks. You walk away with a clear picture of exactly what\'s costing you revenue — whether you work with us or not.',
    detail: 'No pitch. No pressure. Just a frank look at where the leaks are.',
  },
  {
    number: '02',
    title: 'We Build Everything',
    duration: '7–14 days',
    description: 'We configure your full automation stack: lead scoring tuned to your niche and city, email sequences trained on your business, review collection flows, and your client portal. You answer a short onboarding form. We handle the rest.',
    detail: 'No tech skills required. No logins to set up. We deliver a live system.',
  },
  {
    number: '03',
    title: 'It Runs. You Watch.',
    duration: 'Ongoing, hands-free',
    description: 'Leads come in daily. Follow-ups fire automatically. Reviews get collected. Every Monday, your performance report lands in your inbox — leads generated, revenue attributed, what\'s working, what to improve.',
    detail: 'You log into your portal, see the numbers, and focus on running your business.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-brand font-semibold text-sm uppercase tracking-widest mb-4">The Process</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ink mb-6 tracking-tight">
            From audit to automated<br />in under two weeks
          </h2>
          <p className="text-xl text-muted max-w-xl mx-auto">
            Three steps. No tech skills needed. No long-term commitment required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px bg-ink/10" />

          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-brand-light border border-brand/15 flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-brand font-bold text-xl tabular-nums">{step.number}</span>
                </div>
                <div>
                  <div className="text-brand/70 text-xs font-semibold uppercase tracking-widest">{step.duration}</div>
                  <h3 className="font-display text-ink font-semibold text-xl tracking-tight">{step.title}</h3>
                </div>
              </div>

              <p className="text-muted leading-relaxed text-sm mb-4">{step.description}</p>

              <div className="mt-auto flex items-start gap-2 bg-canvas border border-ink/8 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-muted text-xs leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cost-of-inaction callout */}
        <div className="mt-20 rounded-xl border border-rose-200 bg-rose-50 p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
            </div>
            <div>
              <h4 className="font-display text-ink font-semibold mb-2 tracking-tight">What happens if you don&apos;t automate</h4>
              <p className="text-muted text-sm leading-relaxed">
                The average local business loses 3–5 potential clients per week to slow follow-up alone. At $2,000–$5,000 per client, that&apos;s $300k–$1.3M in annual revenue walking out the door. InnieAI pays for itself with the first 1–2 clients it helps you close.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
