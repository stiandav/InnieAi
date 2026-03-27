'use client'

import React, { useState } from 'react'

const plans = [
  {
    name: 'Starter',
    monthly: 1500,
    setup: 1500,
    description: 'For businesses ready to start generating leads and automating follow-up.',
    features: [
      '1–2 automation services',
      'Up to 50 scored leads per month',
      'AI follow-up email sequences',
      'Weekly performance report',
      'Client dashboard portal',
      'Email support',
    ],
    popular: false,
    cta: 'Get Started',
  },
  {
    name: 'Growth',
    monthly: 2500,
    setup: 2000,
    description: 'For businesses serious about growth. More services, more leads, more results.',
    features: [
      '3–4 automation services',
      'Up to 200 scored leads per month',
      'AI follow-up sequences (email + SMS)',
      'Reputation & review automation',
      'Weekly AI performance reports',
      'Client dashboard portal',
      'Priority email support',
    ],
    popular: true,
    cta: 'Get Started',
  },
  {
    name: 'Scale',
    monthly: 4000,
    setup: 2500,
    description: 'Full-service automation. Every system running. Priority support. Quarterly strategy.',
    features: [
      'All 5 automation services',
      'Unlimited leads per month',
      'AI customer support agent',
      'Full reputation automation',
      'Quarterly strategy call',
      'Priority phone + email support',
      'Custom reporting dashboard',
    ],
    popular: false,
    cta: 'Get Started',
  },
]

export function Pricing() {
  const [showSetup, setShowSetup] = useState(false)

  return (
    <section id="pricing" className="py-32 bg-navy-light">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold text-cream mb-6">
            Straightforward pricing.<br />No surprises.
          </h2>
          <p className="text-xl text-cream/50 max-w-xl mx-auto mb-8">
            All plans include a one-time setup fee and a monthly retainer. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-navy-muted rounded-lg p-1">
            <button
              onClick={() => setShowSetup(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !showSetup ? 'bg-accent text-white' : 'text-cream/50 hover:text-cream'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setShowSetup(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                showSetup ? 'bg-accent text-white' : 'text-cream/50 hover:text-cream'
              }`}
            >
              Setup Fee
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.popular
                  ? 'bg-accent/10 border-2 border-accent'
                  : 'bg-navy border border-white/[0.07]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-cream mb-2">{plan.name}</h3>
                <p className="text-cream/50 text-sm mb-6">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-cream/50 text-lg">$</span>
                  <span className="text-5xl font-bold text-cream">
                    {showSetup
                      ? plan.setup.toLocaleString()
                      : plan.monthly.toLocaleString()}
                  </span>
                  <span className="text-cream/50 text-sm ml-1">
                    {showSetup ? 'one-time' : '/month'}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-10 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-cream/70 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`w-full text-center py-3.5 rounded-lg font-semibold text-sm transition-all ${
                  plan.popular
                    ? 'bg-accent hover:bg-accent-hover text-white'
                    : 'bg-white/5 hover:bg-white/10 text-cream border border-white/10'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-cream/30 text-sm mt-8">
          All plans require a one-time setup fee + monthly retainer. Billed via Stripe. Cancel with 30 days notice.
        </p>
      </div>
    </section>
  )
}
