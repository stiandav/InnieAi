import React from 'react'

const services = [
  {
    icon: '🎯',
    title: 'Lead Generation Automation',
    description:
      'AI finds and scores potential customers for your clients daily using Google Places and review data. Delivered as a ranked list of the highest-value prospects in their area.',
    outcome: 'Up to 200 scored leads per month',
    color: 'from-blue-500/20 to-blue-600/5',
  },
  {
    icon: '📧',
    title: 'AI Follow-Up Sequences',
    description:
      'Personalized multi-touch email sequences triggered automatically when a new lead comes in. Every message is written by AI based on the prospect\'s business profile and pain points.',
    outcome: 'Never lose a lead to slow follow-up',
    color: 'from-purple-500/20 to-purple-600/5',
  },
  {
    icon: '🤖',
    title: 'AI Customer Support Agent',
    description:
      'A trained chatbot on the client\'s website that handles FAQs, books appointments, and escalates complex issues to a human. Available 24/7 — replaces the need for a full-time receptionist.',
    outcome: 'Answer 80% of inquiries instantly',
    color: 'from-green-500/20 to-green-600/5',
  },
  {
    icon: '⭐',
    title: 'Reputation & Review Automation',
    description:
      'After every transaction, AI requests Google reviews from happy customers and intercepts unhappy ones before they post publicly. Build your 5-star reputation on autopilot.',
    outcome: '3-5x more Google reviews in 90 days',
    color: 'from-yellow-500/20 to-yellow-600/5',
  },
  {
    icon: '📊',
    title: 'Weekly Performance Reporting',
    description:
      'Every Monday, the client receives an AI-written business summary: leads generated, revenue attributed, what\'s working, what to fix, and the focus for the week ahead.',
    outcome: 'Full visibility delivered to your inbox',
    color: 'from-rose-500/20 to-rose-600/5',
  },
]

export function Services() {
  return (
    <section id="services" className="py-32 bg-navy-light">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">What We Automate</p>
          <h2 className="text-4xl md:text-5xl font-bold text-cream mb-6">
            Five systems running<br />while you sleep
          </h2>
          <p className="text-xl text-cream/50 max-w-2xl mx-auto">
            InnieAI builds and manages the five growth systems that most local businesses know they need but never have time to build properly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className={`relative rounded-2xl border border-white/[0.07] p-8 bg-gradient-to-br ${service.color} overflow-hidden group hover:border-white/[0.12] transition-all duration-300`}
            >
              <div className="text-4xl mb-5">{service.icon}</div>
              <h3 className="text-xl font-semibold text-cream mb-3">{service.title}</h3>
              <p className="text-cream/55 text-sm leading-relaxed mb-6">{service.description}</p>
              <div className="flex items-center gap-2 text-accent text-sm font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {service.outcome}
              </div>
            </div>
          ))}

          {/* Sixth card — CTA */}
          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-8 flex flex-col justify-center items-center text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-cream mb-3">Ready to automate?</h3>
            <p className="text-cream/55 text-sm mb-6">Book a free 30-minute audit. We&apos;ll show you exactly what we&apos;d build for your business.</p>
            <a
              href="#pricing"
              className="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              See Pricing →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
