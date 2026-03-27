import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Nav } from '@/components/marketing/Nav'
import { Footer } from '@/components/marketing/Footer'

type NicheSlug = 'real-estate' | 'dental' | 'medspa' | 'gyms' | 'contractors'

interface NicheContent {
  label: string
  headline: string
  subhead: string
  painPoints: string[]
  useCases: string[]
  stat: string
  statLabel: string
  caseStudyTeaser: string
}

const nicheContent: Record<NicheSlug, NicheContent> = {
  'real-estate': {
    label: 'Real Estate Agents',
    headline: 'Stop losing listings to agents who respond faster.',
    subhead:
      'InnieAI automates your lead follow-up, review collection, and weekly reporting — so you close more deals without working more hours.',
    painPoints: [
      '67% of home buyers hire the first agent who responds to them',
      'Manual CRM follow-up takes hours you don\'t have after a showing',
      'Google reviews determine whether new leads call you or a competitor',
      'You have no idea which lead source is actually driving revenue',
    ],
    useCases: [
      'AI follows up with every new Zillow / Realtor.com lead within 2 minutes',
      'Automated 4-email sequence nurtures cold leads over 14 days',
      'Post-close review requests sent to every happy buyer and seller',
      'Monday report: leads contacted, listings won, revenue attributed',
    ],
    stat: '3.2x',
    statLabel: 'more listings closed vs. manual follow-up',
    caseStudyTeaser:
      'A San Diego real estate team went from 8 to 31 inbound leads per month in 90 days using InnieAI\'s lead gen and follow-up automation.',
  },
  dental: {
    label: 'Dental Practices',
    headline: 'Fill your chair. Stop chasing no-shows.',
    subhead:
      'InnieAI automates new patient acquisition, follow-up, and review collection — so your front desk can focus on the patients already in the office.',
    painPoints: [
      'New patient calls go to voicemail and 40% never call back',
      'Your Google rating is holding you back from ranking in local search',
      'Follow-up emails take 30+ minutes a day to write and send manually',
      'You\'re spending on ads without knowing what\'s actually converting',
    ],
    useCases: [
      'AI identifies local residents searching for a new dentist and initiates contact',
      'Automated new patient welcome and appointment reminder sequences',
      'Post-appointment review requests sent to satisfied patients automatically',
      'Monthly AI report: new patients, revenue attributed, review growth',
    ],
    stat: '4.1x',
    statLabel: 'more new patient inquiries vs. organic only',
    caseStudyTeaser:
      'Elite Dental Group in San Diego grew from 22 to 89 Google reviews in 4 months and added 23 net new patients per month using InnieAI.',
  },
  medspa: {
    label: 'Med Spas',
    headline: 'Your competitors are booking the clients you\'re losing.',
    subhead:
      'InnieAI automates your lead gen, follow-up, and reputation management — so your med spa stays fully booked without running more ads.',
    painPoints: [
      'Potential clients fill out your contact form and never hear back same day',
      'You\'re spending $3k–$8k/month on ads with no clear ROI',
      'One bad review can cost you 20 bookings — and nobody\'s monitoring',
      'Front desk is overwhelmed, so leads fall through the cracks daily',
    ],
    useCases: [
      'AI finds high-intent prospects in your city researching aesthetic treatments',
      'Personalized 4-step sequences follow up with every inquiry within minutes',
      'Automated review interception: happy clients get a review request, unhappy ones get a personal message',
      'Weekly report: consultations booked, revenue tracked, next steps',
    ],
    stat: '$4,800',
    statLabel: 'avg. monthly revenue recovered from lost leads',
    caseStudyTeaser:
      'Renew MedSpa went from 4 new bookings/month from organic to 28 after launching InnieAI\'s lead gen and follow-up in the first 60 days.',
  },
  gyms: {
    label: 'Gyms & Fitness Studios',
    headline: 'Keep the members you have. Win back the ones you lost.',
    subhead:
      'InnieAI automates member lead generation, follow-up, review collection, and churn prevention — so your gym grows without growing your overhead.',
    painPoints: [
      'The average gym loses 50% of its members every year',
      'New member trials don\'t convert because nobody follows up on day 3',
      'You\'re paying for ads but can\'t track which campaign drives actual sign-ups',
      'Front desk staff never have time to call cold leads from the inquiry form',
    ],
    useCases: [
      'AI finds local residents who recently posted about fitness or weight loss goals',
      '4-step sequence turns trial members into paying members automatically',
      'Post-90-day review requests sent to loyal members who love the gym',
      'Monday report: new members, trial conversions, churn risk members flagged',
    ],
    stat: '2.1x',
    statLabel: 'better trial-to-member conversion rate',
    caseStudyTeaser:
      'Fitness Forward in Phoenix converted 58% more free trial members in 45 days using InnieAI\'s automated follow-up sequences.',
  },
  contractors: {
    label: 'Contractors & Home Services',
    headline: 'Win more bids. Stop losing jobs to faster competitors.',
    subhead:
      'InnieAI automates your lead follow-up, reputation management, and reporting — so you quote faster, win more, and spend less time on admin.',
    painPoints: [
      'Homeowners get 3 quotes and hire whoever responds first — often within an hour',
      'Jobs fall through the cracks when you\'re on site and can\'t return calls',
      'You rely on word of mouth but have no system to capture Google reviews',
      'You don\'t know which lead source (Google, Yelp, referral) is worth spending on',
    ],
    useCases: [
      'AI identifies homeowners in your service area searching for your category',
      'Automated same-day follow-up sent to every new inquiry within minutes',
      'Post-job review requests sent to satisfied clients 24 hours after completion',
      'Weekly report: leads contacted, quotes sent, jobs won, revenue attributed',
    ],
    stat: '1.8x',
    statLabel: 'more bids won vs. manual response times',
    caseStudyTeaser:
      'Southwest Builders won 12 additional jobs in their first month with InnieAI by automating their lead response time from 4 hours to 8 minutes.',
  },
}

export async function generateStaticParams() {
  return (Object.keys(nicheContent) as NicheSlug[]).map((niche) => ({ niche }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ niche: string }>
}): Promise<Metadata> {
  const { niche } = await params
  const content = nicheContent[niche as NicheSlug]
  if (!content) return {}
  return {
    title: `InnieAI for ${content.label}`,
    description: content.subhead,
  }
}

export default async function NichePage({
  params,
}: {
  params: Promise<{ niche: string }>
}) {
  const { niche } = await params
  const content = nicheContent[niche as NicheSlug]
  if (!content) notFound()

  const calcomLink = process.env.CALCOM_LINK || process.env.NEXT_PUBLIC_CALCOM_LINK || '#'

  return (
    <main>
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-24 bg-gradient-navy relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-8 text-accent text-sm font-medium">
            InnieAI for {content.label}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-cream mb-6 leading-tight">
            {content.headline}
          </h1>
          <p className="text-xl text-cream/60 max-w-2xl mx-auto mb-10">
            {content.subhead}
          </p>
          <a
            href={calcomLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all shadow-lg shadow-accent/20 hover:-translate-y-0.5"
          >
            Book a Free Audit →
          </a>
        </div>
      </section>

      {/* Stat */}
      <section className="py-16 bg-accent">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-white/70 text-sm uppercase tracking-widest font-medium mb-2">Average result for {content.label.toLowerCase()}</p>
          <p className="text-6xl font-bold text-white mb-2">{content.stat}</p>
          <p className="text-white/80 text-lg">{content.statLabel}</p>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-24 bg-navy-light">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">The Problem</p>
              <h2 className="text-3xl font-bold text-cream mb-8">
                Sound familiar?
              </h2>
              <ul className="space-y-4">
                {content.painPoints.map((pain) => (
                  <li key={pain} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-cream/70 text-sm leading-relaxed">{pain}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">The Solution</p>
              <h2 className="text-3xl font-bold text-cream mb-8">
                What InnieAI does for you
              </h2>
              <ul className="space-y-4">
                {content.useCases.map((uc) => (
                  <li key={uc} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-cream/70 text-sm leading-relaxed">{uc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Case study teaser */}
      <section className="py-24 bg-navy">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Real Result</p>
          <blockquote className="text-2xl font-semibold text-cream leading-relaxed mb-8">
            &quot;{content.caseStudyTeaser}&quot;
          </blockquote>
          <a
            href={calcomLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-lg transition-all"
          >
            Get Results Like This →
          </a>
        </div>
      </section>

      {/* Navigation to other niches */}
      <section className="py-16 bg-navy-light border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-cream/40 text-sm mb-6">Also serving:</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {(Object.keys(nicheContent) as NicheSlug[])
              .filter((n) => n !== niche)
              .map((n) => (
                <Link
                  key={n}
                  href={`/for/${n}`}
                  className="bg-navy hover:bg-navy-muted text-cream/60 hover:text-cream border border-white/[0.07] text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  {nicheContent[n].label}
                </Link>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
