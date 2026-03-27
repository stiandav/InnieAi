import React from 'react'

const steps = [
  {
    number: '01',
    title: 'Audit',
    description:
      'We audit your current marketing and operations — your online presence, review profile, lead flow, follow-up process, and growth gaps. You get a full picture of what\'s costing you revenue.',
    duration: '30 min call',
  },
  {
    number: '02',
    title: 'Build',
    description:
      'We build your custom automation stack in under two weeks. Lead gen scripts tuned to your niche and city. Email sequences trained on your business. A portal so you can see everything in one place.',
    duration: '7–14 days',
  },
  {
    number: '03',
    title: 'Automate',
    description:
      'Everything runs. Leads come in daily. Follow-ups go out automatically. Reviews get collected. Every Monday, your performance report lands in your inbox. You watch the business grow.',
    duration: 'Ongoing, hands-free',
  },
]

export function HowItWorks() {
  return (
    <section className="py-32 bg-navy">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">The Process</p>
          <h2 className="text-4xl md:text-5xl font-bold text-cream mb-6">
            From audit to automated<br />in under two weeks
          </h2>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="relative mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <span className="text-accent font-bold text-lg">{step.number}</span>
                  </div>
                </div>
                <div>
                  <div className="inline-block bg-navy-muted text-accent/70 text-xs font-medium px-3 py-1 rounded-full mb-3">
                    {step.duration}
                  </div>
                  <h3 className="text-2xl font-semibold text-cream mb-4">{step.title}</h3>
                  <p className="text-cream/55 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
