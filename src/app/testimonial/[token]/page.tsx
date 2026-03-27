'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

export default function TestimonialPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [quote, setQuote] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorTitle, setAuthorTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    params.then(({ token: t }) => setToken(t))
  }, [params])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/testimonial/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, quote, authorName, authorTitle }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (data.success) {
        setSubmitted(true)
      } else {
        setError(data.error ?? 'Something went wrong.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">⭐</div>
          <h1 className="text-cream text-2xl font-bold mb-3">Thank you so much!</h1>
          <p className="text-cream/50 text-sm">
            Your review means the world to us. We may feature it on our website to help other business owners learn about InnieAI.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy py-16 px-6 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <p className="text-accent font-bold text-xl mb-2">Innie<span className="text-cream">AI</span></p>
          <h1 className="text-cream text-2xl font-bold mb-2">How has InnieAI worked for you?</h1>
          <p className="text-cream/40 text-sm">Your feedback helps other business owners make the right decision.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-navy-light border border-white/[0.06] rounded-2xl p-8 space-y-6">
          {/* Star rating */}
          <div>
            <p className="text-cream/70 text-sm font-medium mb-3">Overall rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  <span className={(hoveredRating || rating) >= star ? 'text-yellow-400' : 'text-cream/20'}>
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Tell us about your experience"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="What results have you seen? What would you tell another business owner considering InnieAI?"
            rows={5}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Sarah Johnson"
              required
            />
            <Input
              label="Your title / company"
              value={authorTitle}
              onChange={(e) => setAuthorTitle(e.target.value)}
              placeholder="Owner, Johnson Dental"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <Button type="submit" loading={submitting} size="lg" className="w-full">
            Submit Review
          </Button>
        </form>
      </div>
    </div>
  )
}
