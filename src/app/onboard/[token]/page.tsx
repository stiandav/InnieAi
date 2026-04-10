'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

interface Client {
  id: string
  name: string
  company: string
  tier: string
  onboarding_complete: boolean
}

export default function OnboardPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const [form, setForm] = useState({
    goals: '',
    currentTools: '',
    mainContact: '',
    mainContactPhone: '',
    monthlyRevenue: '',
    biggestBottleneck: '',
    niche: '',
    city: '',
  })

  useEffect(() => {
    params.then(({ token: t }) => {
      setToken(t)
      // Load client by portal token
      fetch(`/api/onboard/${t}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setClient(data.data as Client)
        })
        .finally(() => setLoading(false))
    })
  }, [params])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/onboard/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json() as { success: boolean }
      if (data.success) {
        setStep(4) // success
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <p className="text-cream/50">Invalid onboarding link.</p>
      </div>
    )
  }

  if (client.onboarding_complete || step === 4) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-cream text-2xl font-bold mb-3">You&apos;re all set!</h1>
          <p className="text-cream/50 text-sm mb-6">
            We&apos;ve received your onboarding details for {client.company}. Our team will be in touch within 24 hours to confirm next steps.
          </p>
          <button
            onClick={() => router.push(`/portal/${client.id}`)}
            className="bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            View Your Dashboard →
          </button>
        </div>
      </div>
    )
  }

  const totalSteps = 3
  const progress = ((step - 1) / totalSteps) * 100

  return (
    <div className="min-h-screen bg-navy py-16 px-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-accent font-bold text-xl mb-2">Innie<span className="text-cream">AI</span></p>
          <h1 className="text-cream text-2xl font-bold mb-1">Welcome, {client.name}!</h1>
          <p className="text-cream/40 text-sm">Let&apos;s configure {client.company}&apos;s {client.tier} plan.</p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-navy-muted rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="bg-navy-light border border-white/[0.06] rounded-2xl p-8 space-y-6">
              <h2 className="text-cream font-semibold text-lg">Your Goals</h2>
              <Textarea
                label="What are your main business goals for the next 90 days?"
                value={form.goals}
                onChange={(e) => setForm({ ...form, goals: e.target.value })}
                placeholder="More new patients, more 5-star reviews, faster follow-up on inquiries..."
                rows={4}
                required
              />
              <Textarea
                label="What is your single biggest bottleneck right now?"
                value={form.biggestBottleneck}
                onChange={(e) => setForm({ ...form, biggestBottleneck: e.target.value })}
                placeholder="Not enough time to follow up on leads, losing customers to competitors..."
                rows={3}
                required
              />
              <Button type="button" onClick={() => setStep(2)} className="w-full" size="lg">
                Next →
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-navy-light border border-white/[0.06] rounded-2xl p-8 space-y-6">
              <h2 className="text-cream font-semibold text-lg">Your Business</h2>
              <Select
                label="What type of business are you?"
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
                options={[
                  { value: '', label: 'Select your industry...' },
                  { value: 'dental', label: 'Dental Practice' },
                  { value: 'medspa', label: 'Med Spa / Aesthetics' },
                  { value: 'gym', label: 'Gym / Fitness Studio' },
                  { value: 'contractor', label: 'General Contractor' },
                  { value: 'real-estate', label: 'Real Estate' },
                  { value: 'law', label: 'Law Firm' },
                  { value: 'chiropractic', label: 'Chiropractic' },
                  { value: 'physio', label: 'Physical Therapy' },
                  { value: 'accounting', label: 'Accounting / Finance' },
                  { value: 'other', label: 'Other' },
                ]}
                required
              />
              <Input
                label="What city are you in?"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Austin, TX"
                required
              />
              <Textarea
                label="What tools do you currently use? (CRM, scheduling, etc.)"
                value={form.currentTools}
                onChange={(e) => setForm({ ...form, currentTools: e.target.value })}
                placeholder="Jane App, Google Calendar, HubSpot, nothing formal..."
                rows={3}
                required
              />
              <Select
                label="Approximate monthly revenue range"
                value={form.monthlyRevenue}
                onChange={(e) => setForm({ ...form, monthlyRevenue: e.target.value })}
                options={[
                  { value: '', label: 'Select range...' },
                  { value: '$0–$10k', label: '$0 – $10,000' },
                  { value: '$10k–$30k', label: '$10,000 – $30,000' },
                  { value: '$30k–$75k', label: '$30,000 – $75,000' },
                  { value: '$75k–$150k', label: '$75,000 – $150,000' },
                  { value: '$150k+', label: '$150,000+' },
                ]}
                required
              />
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button type="button" onClick={() => setStep(3)} className="flex-1">Next →</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-navy-light border border-white/[0.06] rounded-2xl p-8 space-y-6">
              <h2 className="text-cream font-semibold text-lg">Contact Details</h2>
              <Input
                label="Primary point of contact (full name)"
                value={form.mainContact}
                onChange={(e) => setForm({ ...form, mainContact: e.target.value })}
                placeholder="Sarah Johnson"
                required
              />
              <Input
                label="Best phone number"
                value={form.mainContactPhone}
                onChange={(e) => setForm({ ...form, mainContactPhone: e.target.value })}
                placeholder="+1 (619) 555-0101"
                type="tel"
                required
              />
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>Back</Button>
                <Button type="submit" loading={submitting} className="flex-1" size="lg">
                  Complete Onboarding →
                </Button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-cream/20 text-xs mt-6">Step {step} of {totalSteps}</p>
      </div>
    </div>
  )
}
