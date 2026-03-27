'use client'

import React, { useState } from 'react'

const plans = [
  {
    name: 'Starter',
    monthly: 1500,
    setup: 1500,
    description: 'For businesses ready to stop losing leads and start building a review profile.',
    features: [
      'Lead generation (up to 50/month)',
      'AI follow-up email sequences',
      'Review collection automation',
      'Weekly AI performance report',
      'Client dashboard portal',
      'Email support',
    ],
    roi: 'Pays for itself with 1 new client/month',
    popular: false,
    cta: 'Get Started — Starter',
  },
  {
    name: 'Growth',
    monthly: 2500,
    setup: 2000,
    description: 'For businesses serious about scaling. More leads, more automation, priority support.',
    features: [
      'Lead generation (up to 200/month)',
      'AI follow-up sequences (email + SMS)',
      'Full reputation automation',
      'Churn prevention + upsell automation',
      'Weekly AI performance reports',
      'Client dashboard portal',
      'Priority email support',
    ],
    roi: 'Average client ROI: positive within 30 days',
    popular: true,
    cta: 'Get Started — Growth',
  },
  {
    name: 'Scale',
    monthly: 4000,
    setup: 2500,
    description: 'All 5 automations running. Full concierge support. Quarterly strategy included.',
    features: [
      'Unlimited lead generation',
      'All 5 automation services',
      'AI customer support agent (24/7)',
      'Full reputation automation',
      'Quarterly strategy call',
      'Priority phone + email support',
      'Custom reporting dashboard',
    ],
    roi: 'Built for businesses doing $50k+/month',
    popular: false,
    cta: 'Get Started — Scale',
  },
]

const calcomLink = process.env.NEXT_PUBLIC_CALCOM_LINK || '#'

export function Pricing() {
  const [showSetup, setShowSetup] = useState(false)

  return (
    <section id="pricing" className="py-32 bg-canvas">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-brand font-semibold text-sm uppercase tracking-widest mb-4">Pricing</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ink mb-6 tracking-tight">
            Straightforward pricing.<br />No surprises.
          </h2>
          <p className="text-xl text-muted max-w-xl mx-auto mb-4">
            All plans include a one-time setup fee and a monthly retainer. Cancel anytime with 30 days notice.
          </p>
        </div>

        {/* ROI comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { label: 'vs Marketing Agency', value: '$5,000–$10,000/mo', sub: 'for similar results', highlight: false },
            { label: 'vs Hiring In-House', value: '$4,000–$6,000/mo', sub: 'salary + benefits', highlight: false },
            { label: 'InnieAI Growth Plan', value: '$2,500/mo', sub: 'fully automated', highlight: true },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl px-6 py-5 text-center border ${
                item.highlight
                  ? 'bg-brand-light border-brand/25'
                  : 'bg-surface border-ink/8'
              }`}
            >
              <p className={`text-xs uppercase tracking-widest font-semibold mb-1 ${item.highlight ? 'text-brand' : 'text-muted'}`}>
                {item.label}
              </p>
              <p className={`text-2xl font-bold font-display tracking-tight ${item.highlight ? 'text-ink' : 'text-ink/30 line-through'}`}>
                {item.value}
              </p>
              <p className={`text-xs mt-1 ${item.highlight ? 'text-brand/70' : 'text-muted/50'}`}>{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 bg-surface rounded-lg p-1 border border-ink/8">
            <button
              onClick={() => setShowSetup(false)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                !showSetup ? 'bg-brand text-white shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              Monthly retainer
            </button>
            <button
              onClick={() => setShowSetup(true)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                showSetup ? 'bg-brand text-white shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              One-time setup
            </button>
          </div>
        </div>

        {showSetup && (
          <p className="text-center text-muted text-sm mb-8">
            The setup fee covers building your complete automation stack — lead gen scripts, email sequences, portal, and integrations. It&apos;s a one-time cost.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl p-8 flex flex-col ${
                plan.popular
                  ? 'bg-brand-light border-2 border-brand shadow-md'
                  : 'bg-surface border border-ink/8 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <div className="bg-brand text-white text-xs font-bold px-4 py-1.5 rounded-full">
                    MOST POPULAR
                  </div>
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    3 spots left
                  </div>
                </div>
              )}

              <div className="mb-6 mt-2">
                <h3 className="font-display text-xl font-bold text-ink mb-1 tracking-tight">{plan.name}</h3>
                <p className="text-muted text-sm mb-5">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-muted text-lg">$</span>
                  <span className="font-display text-5xl font-bold text-ink tabular-nums tracking-tight">
                    {(showSetup ? plan.setup : plan.monthly).toLocaleString()}
                  </span>
                  <span className="text-muted text-sm ml-1">
                    {showSetup ? 'one-time' : '/month'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <svg className="w-3.5 h-3.5 text-brand flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-brand text-xs font-medium">{plan.roi}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span className="text-muted text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={calcomLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full text-center py-3.5 rounded-lg font-semibold text-sm transition-all ${
                  plan.popular
                    ? 'bg-brand hover:bg-brand-hover text-white hover:-translate-y-0.5 shadow-md shadow-brand/20'
                    : 'bg-ink/5 hover:bg-ink/10 text-ink border border-ink/10'
                }`}
              >
                {plan.cta} →
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-muted/60 text-xs mt-8">
          All plans billed via Stripe. Cancel with 30 days notice. Setup fee is non-refundable.
        </p>
      </div>
    </section>
  )
}
