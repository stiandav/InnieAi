'use client'

import React, { useState } from 'react'
import type { Metadata } from 'next'

// Note: metadata must be in a separate server component for Next.js App Router,
// but keeping this client component simple for the form interactivity.

type Step = 'job' | 'form' | 'done'

export default function CloserJobPage() {
  const [step, setStep] = useState<Step>('job')
  const [form, setForm] = useState({
    name: '',
    email: '',
    linkedin_url: '',
    experience: '',
    why_them: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/jobs/apply', {
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
            We review applications within 24 hours. If you&apos;re a fit, you&apos;ll get an email with access and your first briefing.
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
            ← Back to job post
          </button>
          <h1 className="text-ink font-bold text-2xl mb-1">Apply — Sales Closer</h1>
          <p className="text-muted text-sm mb-8">Takes 3 minutes. We respond within 24 hours.</p>

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

            <div>
              <label className="block text-ink/60 text-xs font-medium mb-1.5">LinkedIn URL <span className="text-ink/30">(optional)</span></label>
              <input type="url" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..."
                className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-brand/50" />
            </div>

            <div>
              <label className="block text-ink/60 text-xs font-medium mb-1.5">Sales background</label>
              <textarea value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} required rows={3}
                placeholder="What have you sold? Industries, deal sizes, close rates if you know them. Be specific."
                className="w-full border border-ink/15 rounded-lg px-3 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-brand/50 resize-none" />
            </div>

            <div>
              <label className="block text-ink/60 text-xs font-medium mb-1.5">Why do you want this role?</label>
              <textarea value={form.why_them} onChange={(e) => setForm({ ...form, why_them: e.target.value })} required rows={3}
                placeholder="Honest answer. What appeals to you about commission-only inbound closing for a B2B AI product?"
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

  // Job post view
  return (
    <main className="min-h-screen bg-canvas py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <span className="text-brand text-xs font-semibold uppercase tracking-widest">InnieAI · Remote · Commission</span>
          <h1 className="text-ink font-bold text-4xl mt-3 mb-4 tracking-tight">Sales Closer</h1>
          <p className="text-muted text-lg">
            Inbound only. Pre-qualified leads. Briefing before every call. 20% commission on close.
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
                'Take 15-minute inbound calls from pre-qualified prospects who booked after receiving our outreach',
                'Receive a Claude-generated briefing before every call — prospect background, pain points, talking points, likely objections',
                'Present the value, handle objections, close — then create the proposal link from our closer portal (takes 2 minutes)',
                'No cold calling. No lead generation. No admin. Just close.',
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
              <strong className="text-ink">20% of the setup fee on every close.</strong> Setup fees range from $1,500–$2,500 depending on plan.
              That&apos;s <strong className="text-ink">$300–$500 per deal</strong>. Paid within 5 days of client payment clearing.
              No cap. No base salary. If you close consistently, this scales with you.
            </p>
          </section>

          <section>
            <h2 className="text-ink font-semibold text-lg mb-3">You should apply if</h2>
            <ul className="space-y-2">
              {[
                'You have experience closing B2B or high-ticket sales (any industry)',
                'You can commit to showing up prepared and on time for scheduled calls',
                'You want a role where your income is directly tied to your performance',
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
          Apply now →
        </button>

        <p className="text-muted/50 text-xs mt-4">
          Applications reviewed within 24 hours. Qualified applicants receive access immediately.
        </p>
      </div>
    </main>
  )
}
