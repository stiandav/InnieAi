'use client'

import React, { useState } from 'react'

type Step = 'auth' | 'form' | 'done'

export default function CloserPortalPage() {
  const [step, setStep] = useState<Step>('auth')
  const [secret, setSecret] = useState('')
  const [authError, setAuthError] = useState('')
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    company: '',
    niche: '',
    painPoints: '',
    tier: 'Growth' as 'Starter' | 'Growth' | 'Scale',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [proposalUrl, setProposalUrl] = useState('')

  function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    if (!secret.trim()) { setAuthError('Enter your closer key'); return }
    setAuthError('')
    setStep('form')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/closer/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, ...form }),
      })
      const data = await res.json() as { proposalUrl?: string; error?: string }
      if (res.status === 401) { setStep('auth'); setAuthError('Invalid key — try again'); return }
      if (data.error) { setError(data.error); return }
      setProposalUrl(data.proposalUrl ?? '')
      setStep('done')
    } catch {
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'auth') {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center px-6">
        <div className="max-w-sm w-full">
          <h1 className="text-cream font-bold text-2xl mb-1 text-center">InnieAI Closer Portal</h1>
          <p className="text-cream/40 text-sm text-center mb-8">Enter your closer key to continue.</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              placeholder="Closer key"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full bg-navy-light border border-white/10 rounded-lg px-4 py-3 text-cream placeholder-cream/30 focus:outline-none focus:border-accent/40"
              autoFocus
            />
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-accent text-navy py-3 rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors"
            >
              Continue →
            </button>
          </form>
        </div>
      </main>
    )
  }

  if (step === 'done') {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-14 h-14 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-cream font-bold text-2xl mb-2">Proposal created</h2>
          <p className="text-cream/50 text-sm mb-6">
            {form.clientEmail ? `Sent to ${form.clientEmail} and copied below.` : 'Copy the link below and send it to the client.'}
          </p>
          <div className="bg-navy-light border border-white/[0.06] rounded-xl px-5 py-4 mb-4">
            <p className="text-accent text-sm font-mono break-all">{proposalUrl}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigator.clipboard.writeText(proposalUrl)}
              className="px-5 py-2.5 bg-accent text-navy rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              Copy link
            </button>
            <button
              onClick={() => { setForm({ clientName: '', clientEmail: '', company: '', niche: '', painPoints: '', tier: 'Growth' }); setStep('form') }}
              className="px-5 py-2.5 bg-white/5 text-cream/60 rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              New proposal
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-navy flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full">
        <h1 className="text-cream font-bold text-2xl mb-1">New Proposal</h1>
        <p className="text-cream/40 text-sm mb-8">Claude generates the proposal. The client gets a checkout link.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-cream/50 text-xs mb-1.5">Client name</label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                placeholder="Dr. Sarah Johnson"
                required
                className="w-full bg-navy-light border border-white/10 rounded-lg px-3 py-2.5 text-cream text-sm placeholder-cream/30 focus:outline-none focus:border-accent/40"
              />
            </div>
            <div>
              <label className="block text-cream/50 text-xs mb-1.5">Client email</label>
              <input
                type="email"
                value={form.clientEmail}
                onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                placeholder="sarah@dental.com"
                className="w-full bg-navy-light border border-white/10 rounded-lg px-3 py-2.5 text-cream text-sm placeholder-cream/30 focus:outline-none focus:border-accent/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-cream/50 text-xs mb-1.5">Business name</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Johnson Family Dental"
                required
                className="w-full bg-navy-light border border-white/10 rounded-lg px-3 py-2.5 text-cream text-sm placeholder-cream/30 focus:outline-none focus:border-accent/40"
              />
            </div>
            <div>
              <label className="block text-cream/50 text-xs mb-1.5">Niche</label>
              <input
                type="text"
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
                placeholder="dental"
                required
                className="w-full bg-navy-light border border-white/10 rounded-lg px-3 py-2.5 text-cream text-sm placeholder-cream/30 focus:outline-none focus:border-accent/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-cream/50 text-xs mb-1.5">Plan</label>
            <select
              value={form.tier}
              onChange={(e) => setForm({ ...form, tier: e.target.value as 'Starter' | 'Growth' | 'Scale' })}
              className="w-full bg-navy-light border border-white/10 rounded-lg px-3 py-2.5 text-cream text-sm focus:outline-none focus:border-accent/40"
            >
              <option value="Starter">Starter — $1,500/mo + $1,500 setup</option>
              <option value="Growth">Growth — $2,500/mo + $2,000 setup</option>
              <option value="Scale">Scale — $4,000/mo + $2,500 setup</option>
            </select>
          </div>

          <div>
            <label className="block text-cream/50 text-xs mb-1.5">Pain points (from the call)</label>
            <textarea
              value={form.painPoints}
              onChange={(e) => setForm({ ...form, painPoints: e.target.value })}
              placeholder="What specific problems did they describe? Low reviews, slow follow-up, losing leads to competitors, spending $3k/mo on ads with no system..."
              rows={5}
              required
              className="w-full bg-navy-light border border-white/10 rounded-lg px-3 py-2.5 text-cream text-sm placeholder-cream/30 focus:outline-none focus:border-accent/40 resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-navy py-3.5 rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-60"
          >
            {loading ? 'Generating proposal...' : 'Generate & send proposal →'}
          </button>
        </form>
      </div>
    </main>
  )
}
