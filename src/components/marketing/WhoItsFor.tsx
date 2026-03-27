import React from 'react'
import Link from 'next/link'

const niches = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    niche: 'Dental Practices',
    slug: 'dental',
    pain: '60% of new patient inquiries go unanswered within the first hour. Patients book your competitor.',
    outcome: '89 new Google reviews · 3x new patient inquiries · full follow-up on autopilot',
    color: 'from-blue-500/10 to-transparent',
    border: 'border-blue-500/20 hover:border-blue-500/40',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    niche: 'Med Spas',
    slug: 'medspa',
    pain: 'You\'re spending $3–5k/month on ads with unpredictable ROI and no follow-up system to convert the leads you do get.',
    outcome: '200 scored leads/month · AI follow-up replaces ad spend · automated review collection',
    color: 'from-purple-500/10 to-transparent',
    border: 'border-purple-500/20 hover:border-purple-500/40',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    niche: 'Gyms & Fitness',
    slug: 'gyms',
    pain: 'The average gym loses 50% of members every year. No one follows up. No one notices until they\'ve already cancelled.',
    outcome: 'Automated member retention · churn prediction · new lead sequences that convert',
    color: 'from-green-500/10 to-transparent',
    border: 'border-green-500/20 hover:border-green-500/40',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    niche: 'Contractors',
    slug: 'contractors',
    pain: 'You win jobs by being first to respond. But you\'re on a job site all day. Every missed call is a $10k+ contract gone.',
    outcome: 'Instant AI follow-up on every inquiry · automated quote follow-ups · review collection after every job',
    color: 'from-yellow-500/10 to-transparent',
    border: 'border-yellow-500/20 hover:border-yellow-500/40',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    niche: 'Real Estate',
    slug: 'real-estate',
    pain: 'Leads go cold in 5 minutes. If you\'re not responding instantly at all hours, someone else is closing the deal.',
    outcome: '24/7 instant lead response · automated showing follow-ups · reputation building on autopilot',
    color: 'from-rose-500/10 to-transparent',
    border: 'border-rose-500/20 hover:border-rose-500/40',
  },
]

export function WhoItsFor() {
  return (
    <section className="py-32 bg-navy-light" id="who">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Built For You</p>
          <h2 className="text-4xl md:text-5xl font-bold text-cream mb-6">
            Not a generic tool.<br />Tailored to your industry.
          </h2>
          <p className="text-xl text-cream/50 max-w-2xl mx-auto">
            We know your niche — the leads you lose, the reviews you miss, the follow-ups that never happen. We built the fix.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {niches.map((n) => (
            <Link
              key={n.slug}
              href={`/for/${n.slug}`}
              className={`group relative rounded-2xl border bg-gradient-to-br ${n.color} ${n.border} p-7 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-cream/70 group-hover:text-cream transition-colors">
                  {n.icon}
                </div>
                <svg className="w-4 h-4 text-cream/20 group-hover:text-cream/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>

              <div>
                <h3 className="text-cream font-semibold text-lg mb-2">{n.niche}</h3>
                <p className="text-cream/50 text-sm leading-relaxed mb-4">{n.pain}</p>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-accent/80 text-xs leading-relaxed">{n.outcome}</p>
                </div>
              </div>

              <div className="mt-auto pt-2">
                <span className="text-cream/40 text-xs group-hover:text-cream/60 transition-colors">
                  See results for {n.niche} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
