import React from 'react'

const services = [
  {
    pain: 'Your competitors are calling leads within 5 minutes. You\'re calling back tomorrow — and the job is already gone.',
    solution: 'Lead Generation + Instant Follow-Up',
    description: 'AI finds and scores the highest-value prospects in your niche and city every day. The moment a new lead comes in, a personalised follow-up sequence fires automatically — within minutes, not hours.',
    outcome: 'Up to 200 scored leads/month · Never lose a lead to slow response',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    accentColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    pain: '80% of customers say they\'d leave a review — but almost nobody asks. Your competitors have 200 reviews. You have 18.',
    solution: 'Reputation & Review Automation',
    description: 'After every transaction, AI sends a personalised review request. Happy customers get guided straight to Google. Unhappy ones get a private resolution path — before they post publicly.',
    outcome: '3–5x more Google reviews in 90 days · Intercept negative reviews before they go live',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    accentColor: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
  },
  {
    pain: 'Patients and clients ask the same 10 questions all day. Your front desk spends hours answering them instead of converting new business.',
    solution: 'AI Customer Support Agent',
    description: 'A trained AI agent handles your FAQs, books appointments, and qualifies leads — 24/7, on your website. It escalates real issues to a human. Everything else? Handled.',
    outcome: '80% of inquiries answered instantly · Frees your team for high-value work',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    accentColor: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  {
    pain: 'You don\'t know if your marketing is working until it\'s too late. No visibility. No early warning. No weekly check-in.',
    solution: 'Weekly AI Performance Reports',
    description: 'Every Monday, a plain-English report hits your inbox: leads generated, emails sent, reviews collected, revenue attributed, and the one thing to focus on this week. Written by AI. Read in 3 minutes.',
    outcome: 'Full clarity every Monday · Data-driven decisions without hiring an analyst',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    accentColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    pain: 'You spent $3,000 getting a client. Then they go quiet, drift away, and cancel — and you\'re back to square one.',
    solution: 'Churn Prevention + Upsell Automation',
    description: 'AI tracks engagement signals across every client. The moment a client shows churn signals, a personalised save email goes out before they cancel. Happy clients get an upgrade offer at exactly the right time.',
    outcome: 'Retain clients longer · Increase LTV with well-timed upsells',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    accentColor: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
  },
]

export function Services() {
  return (
    <section id="services" className="py-32 bg-navy-light">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">What We Build</p>
          <h2 className="text-4xl md:text-5xl font-bold text-cream mb-6">
            Five problems.<br />Five automations. One platform.
          </h2>
          <p className="text-xl text-cream/50 max-w-2xl mx-auto">
            Every automation targets a specific revenue leak in your business. Together, they compound.
          </p>
        </div>

        <div className="space-y-5">
          {services.map((service, i) => (
            <div
              key={i}
              className={`rounded-2xl border ${service.borderColor} bg-navy overflow-hidden transition-all duration-200`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 border-b md:border-b-0 md:border-r border-white/[0.06] bg-red-500/[0.03]">
                  <div className="flex items-center gap-2 text-red-400/60 text-xs font-semibold uppercase tracking-widest mb-4">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    The problem
                  </div>
                  <p className="text-cream/65 text-base leading-relaxed">{service.pain}</p>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${service.bgColor} flex items-center justify-center ${service.accentColor}`}>
                      {service.icon}
                    </div>
                    <h3 className="text-cream font-semibold text-lg">{service.solution}</h3>
                  </div>
                  <p className="text-cream/55 text-sm leading-relaxed mb-5">{service.description}</p>
                  <div className={`flex items-center gap-2 text-sm font-medium ${service.accentColor}`}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    {service.outcome}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
