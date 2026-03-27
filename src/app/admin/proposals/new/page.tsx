'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

export default function NewProposalPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    clientName: '',
    company: '',
    niche: '',
    painPoints: '',
    tier: 'Growth' as 'Starter' | 'Growth' | 'Scale',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ id: string; url: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json() as { success: boolean; data?: { id: string; url: string }; error?: string }

      if (data.success && data.data) {
        setResult(data.data)
      } else {
        setError(data.error ?? 'Failed to generate proposal')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="p-8">
        <div className="max-w-lg mx-auto bg-navy-light border border-white/[0.06] rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-cream font-bold text-xl mb-2">Proposal Generated!</h2>
          <p className="text-cream/50 text-sm mb-6">Share this link with your prospect.</p>
          <div className="bg-navy rounded-lg px-4 py-3 mb-6">
            <p className="text-accent text-sm font-mono break-all">{result.url}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => window.open(result.url, '_blank')}
              className="flex-1"
            >
              Preview Proposal
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(result.url)}
            >
              Copy Link
            </Button>
          </div>
          <button
            onClick={() => router.push('/admin/proposals')}
            className="mt-4 text-cream/30 hover:text-cream/60 text-sm"
          >
            Back to Proposals
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-cream mb-1">New Proposal</h1>
          <p className="text-cream/40 text-sm">Claude will generate a personalized proposal based on the information below.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-navy-light border border-white/[0.06] rounded-2xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Client Name"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              placeholder="Dr. Sarah Johnson"
              required
            />
            <Input
              label="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Johnson Family Dental"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Niche / Industry"
              value={form.niche}
              onChange={(e) => setForm({ ...form, niche: e.target.value })}
              placeholder="dental"
              required
            />
            <Select
              label="Recommended Plan"
              value={form.tier}
              onChange={(e) => setForm({ ...form, tier: e.target.value as 'Starter' | 'Growth' | 'Scale' })}
              options={[
                { value: 'Starter', label: 'Starter — $1,500/mo + $1,500 setup' },
                { value: 'Growth', label: 'Growth — $2,500/mo + $2,000 setup' },
                { value: 'Scale', label: 'Scale — $4,000/mo + $2,500 setup' },
              ]}
            />
          </div>

          <Textarea
            label="Main Pain Points"
            value={form.painPoints}
            onChange={(e) => setForm({ ...form, painPoints: e.target.value })}
            placeholder="Describe the prospect's specific challenges. E.g. Losing patients to competitors, no follow-up system, low Google reviews (22), spending $3k/mo on ads with unclear ROI..."
            rows={5}
            required
          />

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} size="lg" className="w-full">
            {loading ? 'Generating with Claude...' : 'Generate Proposal →'}
          </Button>
        </form>
      </div>
    </div>
  )
}
