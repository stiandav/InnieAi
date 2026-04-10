'use client'

import React, { useState } from 'react'

type Step = 'job' | 'form' | 'done'

export default function UGCJobPage() {
  const [step, setStep] = useState<Step>('job')
  const [form, setForm] = useState({
    name: '',
    email: '',
    instagram_url: '',
    tiktok_url: '',
    niche_experience: '',
    content_samples: '',
    why_fit: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/jobs/ugc-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!data.success) { setError(data.error ?? 'Something went wrong'); return }
      setStep('done')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done') {
    return (
      <main className="min-h-screen bg-canvas flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-14 h-14 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-ink font-bold text-2xl mb-2">Application received</h2>
          <p className="text-muted text-base">
            We review UGC applications within 48 hours. If you&apos;re a fit, you&apos;ll get an email with your affiliate link and a creative brief.
          </p>
        </div>
      </main>
    )
  }

  if (step === 'form') {
    return (
      <main className="min-h-screen bg-canvas py-16 px-6">
        <div className="max-w-xl mx-auto">
          <button onClick={() => setStep('job')} className="text-muted text-sm mb-8 hover:text-ink transition-colors">
            ← Back
          </button>
          <h1 className="text-ink font-bold text-2xl mb-1">Apply — UGC Creator</h1>
          <p className="text-muted text-sm mb-8">Quick application. We respond within 48 hours.</p>

          <form onSubmit={handleApply} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-ink/60 text-xs font-medium mb-1.5">Full name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-brand/50" />
              </div>
              <div>
                <label className="block text-ink/60 text-xs font-medium mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-brand/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-ink/60 text-xs font-medium mb-1.5">Instagram <span className="text-ink/30">(optional)</span></label>
                <input type="url" value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-brand/50" />
              </div>
              <div>
                <label className="block text-ink/60 text-xs font-medium mb-1.5">TikTok <span className="text-ink/30">(optional)</span></label>
                <input type="url" value={form.tiktok_url} onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })}
                  placeholder="https://tiktok.com/@..."
                  className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-brand/50" />
              </div>
            </div>

            <div>
              <label className="block text-ink/60 text-xs font-medium mb-1.5">Niche experience</label>
              <textarea value={form.niche_experience} onChange={(e) => setForm({ ...form, niche_experience: e.target.value })} required rows={3}
                placeholder="What industries do you create content for? Dental, fitness, beauty, home services? Be specific about who watches your content."
                className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-brand/50 resize-none" />
            </div>

            <div>
              <label className="block text-ink/60 text-xs font-medium mb-1.5">Content samples or past brand work</label>
              <textarea value={form.content_samples} onChange={(e) => setForm({ ...form, content_samples: e.target.value })} required rows={3}
                placeholder="Links to past UGC, brand deal work, or your best-performing posts. Paste URLs, one per line."
                className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-brand/50 resize-none" />
            </div>

            <div>
              <label className="block text-ink/60 text-xs font-medium mb-1.5">Why are you a fit for an AI automation brand?</label>
              <textarea value={form.why_fit} onChange={(e) => setForm({ ...form, why_fit: e.target.value })} required rows={2}
                placeholder="Honest answer. What angle would you take? Who's your audience?"
                className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-brand/50 resize-none" />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-brand hover:bg-brand-hover text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit application →'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-canvas py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <span className="text-brand text-xs font-semibold uppercase tracking-widest">InnieAI · UGC · Affiliate</span>
          <h1 className="text-ink font-bold text-4xl mt-3 mb-4 tracking-tight">UGC Creator Partner</h1>
          <p className="text-muted text-lg">
            Create content for InnieAI. Earn 15% recurring commission on every client you refer — for the life of their subscription.
          </p>
        </div>

        <div className="space-y-8 text-ink/80 text-base leading-relaxed mb-12">
          <section>
            <h2 className="text-ink font-semibold text-lg mb-3">What InnieAI does</h2>
            <p>
              We build AI automation systems for local businesses — dental practices, gyms, med spas, contractors.
              The system finds their leads daily, follows up automatically, and generates weekly performance reports.
              Plans run $1,500–$4,000/month.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-semibold text-lg mb-3">What you do</h2>
            <ul className="space-y-2">
              {[
                'Create short-form content (Reels, TikTok, YouTube Shorts) showing the InnieAI system in action',
                'Use your unique affiliate link — every client who signs up through it earns you 15% recurring monthly commission',
                'We provide a full creative brief, brand assets, talking points, and product access so you can make authentic content',
                'No cold outreach. No sales. Just create content and share your link.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-brand flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-ink font-semibold text-lg mb-3">Compensation</h2>
            <p>
              <strong className="text-ink">15% of monthly recurring revenue</strong> from every client you refer.
              A single Starter client ($1,500/mo) earns you <strong className="text-ink">$225/month — every month they stay</strong>.
              A Growth client ($2,500/mo) earns $375/month. Paid on the 1st of each month. No cap.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-semibold text-lg mb-3">We&apos;re looking for creators who</h2>
            <ul className="space-y-2">
              {[
                'Make content for business owners (dental, fitness, beauty, home services, or similar local service niches)',
                'Have an audience of decision-makers, not just consumers',
                'Can make content that feels native to your platform — not an obvious ad',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-brand font-bold mt-0.5">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <button
          onClick={() => setStep('form')}
          className="px-8 py-4 bg-brand hover:bg-brand-hover text-white rounded-xl font-semibold text-base transition-all hover:-translate-y-0.5 shadow-md shadow-brand/20"
        >
          Apply to partner →
        </button>

        <p className="text-muted/50 text-xs mt-4">
          Applications reviewed within 48 hours. Approved creators receive their affiliate link and creative brief immediately.
        </p>
      </div>
    </main>
  )
}
