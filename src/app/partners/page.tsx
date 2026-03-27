'use client'

import React, { useState } from 'react'
import { Nav } from '@/components/marketing/Nav'
import { Footer } from '@/components/marketing/Footer'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function PartnersPage() {
  const [form, setForm] = useState({ name: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ refCode: string } | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json() as { success: boolean; data?: { refCode: string }; error?: string }
      if (data.success && data.data) {
        setResult(data.data)
      } else {
        setError(data.error ?? 'Failed to sign up.')
      }
    } catch {
      setError('Network error.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <Nav />
      <section className="pt-32 pb-24 bg-gradient-navy">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-8 text-accent text-sm font-medium">
            InnieAI Partner Program
          </div>
          <h1 className="text-5xl font-bold text-cream mb-6">
            Earn 15% recurring commission.<br />Forever.
          </h1>
          <p className="text-xl text-cream/60 max-w-2xl mx-auto mb-4">
            Refer a business to InnieAI and earn 15% of their monthly retainer for as long as they stay a client. No cap. No expiration.
          </p>
        </div>
      </section>

      <section className="py-24 bg-navy-light">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { label: 'Starter Referral', value: '$225/mo', sub: 'per Starter client' },
              { label: 'Growth Referral', value: '$375/mo', sub: 'per Growth client' },
              { label: 'Scale Referral', value: '$600/mo', sub: 'per Scale client' },
            ].map((item) => (
              <div key={item.label} className="bg-navy border border-white/[0.06] rounded-2xl p-8 text-center">
                <p className="text-cream/40 text-sm mb-3">{item.label}</p>
                <p className="text-4xl font-bold text-cream mb-1">{item.value}</p>
                <p className="text-cream/40 text-sm">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="max-w-lg mx-auto">
            {result ? (
              <div className="bg-navy border border-white/[0.06] rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-cream font-bold text-xl mb-3">You&apos;re in!</h2>
                <p className="text-cream/50 text-sm mb-6">Your unique referral link:</p>
                <div className="bg-navy-muted rounded-lg px-4 py-3 mb-6">
                  <p className="text-accent font-mono text-sm">
                    {typeof window !== 'undefined' ? window.location.origin : 'https://innieai.co'}/ref/{result.refCode}
                  </p>
                </div>
                <p className="text-cream/40 text-xs">Share this link. Earn 15% monthly for every client who signs up.</p>
              </div>
            ) : (
              <div className="bg-navy border border-white/[0.06] rounded-2xl p-8">
                <h2 className="text-cream font-bold text-xl mb-2">Apply to become a partner</h2>
                <p className="text-cream/50 text-sm mb-6">We approve all applications within 24 hours.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Chris Dawson"
                    required
                  />
                  <Input
                    label="Email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="chris@agency.com"
                    type="email"
                    required
                  />
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <Button type="submit" loading={submitting} size="lg" className="w-full">
                    Apply Now →
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
