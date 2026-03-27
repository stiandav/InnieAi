'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Proposal } from '@/types/database'
import { PRICING } from '@/types'
import { Button } from '@/components/ui/Button'

export default function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [showDecline, setShowDecline] = useState(false)
  const searchParams = useSearchParams()
  const accepted = searchParams.get('status') === 'accepted'

  useEffect(() => {
    params.then(({ id: pid }) => setId(pid))
  }, [params])

  useEffect(() => {
    if (!id) return
    fetch(`/api/proposals/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setProposal(data.data as Proposal)
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleAccept() {
    if (!id) return
    setAccepting(true)
    try {
      const res = await fetch(`/api/proposals/${id}/accept`, { method: 'POST' })
      const data = await res.json() as { success: boolean; data?: { checkoutUrl: string } }
      if (data.success && data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl
      }
    } finally {
      setAccepting(false)
    }
  }

  async function handleDecline() {
    if (!id) return
    setDeclining(true)
    try {
      await fetch(`/api/proposals/${id}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: declineReason }),
      })
      setShowDecline(false)
    } finally {
      setDeclining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <p className="text-cream/50">Proposal not found.</p>
      </div>
    )
  }

  const pricing = PRICING[proposal.tier]

  return (
    <div className="min-h-screen bg-navy py-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-accent font-bold text-2xl mb-2">
            Innie<span className="text-cream">AI</span>
          </p>
          <h1 className="text-3xl font-bold text-cream mb-2">
            Proposal for {proposal.company}
          </h1>
          <p className="text-cream/40 text-sm">
            Prepared for {proposal.client_name} · {new Date(proposal.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Accepted banner */}
        {accepted && (
          <div className="bg-green-500/15 border border-green-500/30 rounded-xl p-5 mb-8 text-center">
            <p className="text-green-400 font-semibold">Payment received — welcome to InnieAI! 🎉</p>
            <p className="text-green-400/70 text-sm mt-1">Check your inbox for onboarding next steps.</p>
          </div>
        )}

        {/* Proposal content */}
        <div className="bg-navy-light border border-white/[0.06] rounded-2xl p-8 mb-8">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: proposal.content_html ?? '' }}
          />
        </div>

        {/* Investment summary */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-8 mb-8">
          <h3 className="text-cream font-bold text-xl mb-6">Investment Summary</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-navy rounded-xl p-4">
              <p className="text-cream/40 text-xs uppercase tracking-widest mb-1">Setup Fee (one-time)</p>
              <p className="text-cream text-2xl font-bold">${pricing.setup.toLocaleString()}</p>
            </div>
            <div className="bg-navy rounded-xl p-4">
              <p className="text-cream/40 text-xs uppercase tracking-widest mb-1">Monthly Retainer</p>
              <p className="text-cream text-2xl font-bold">${pricing.monthly.toLocaleString()}/mo</p>
            </div>
          </div>
          <p className="text-cream/50 text-sm">
            Plan: <span className="text-cream font-medium">{proposal.tier}</span> ·
            No long-term contract · Cancel with 30 days notice
          </p>
        </div>

        {/* CTAs */}
        {proposal.status !== 'Accepted' && proposal.status !== 'Declined' && !accepted && (
          <div className="space-y-4">
            <Button
              onClick={handleAccept}
              loading={accepting}
              size="lg"
              className="w-full"
            >
              Accept & Get Started →
            </Button>

            {!showDecline ? (
              <button
                onClick={() => setShowDecline(true)}
                className="w-full text-center text-cream/30 hover:text-cream/60 text-sm transition-colors py-2"
              >
                This isn&apos;t for me right now
              </button>
            ) : (
              <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6 space-y-4">
                <p className="text-cream/60 text-sm">Help us improve — why isn&apos;t this a fit right now?</p>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full bg-navy border border-white/10 text-cream text-sm rounded-lg px-4 py-2.5 resize-none"
                  rows={3}
                  placeholder="Budget, timing, not the right fit..."
                />
                <Button variant="secondary" onClick={handleDecline} loading={declining} className="w-full">
                  Submit Feedback
                </Button>
              </div>
            )}
          </div>
        )}

        {proposal.status === 'Declined' && (
          <div className="text-center text-cream/40 text-sm py-4">
            This proposal has been declined. Thank you for your feedback.
          </div>
        )}
      </div>
    </div>
  )
}
