'use client'

import React, { useState, useEffect } from 'react'
import type { Closer } from '@/types/database'

export default function ClosersPage() {
  const [closers, setClosers] = useState<Closer[]>([])
  const [form, setForm] = useState({ name: '', email: '', commission_pct: 20 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/closers')
      .then((r) => r.json())
      .then(setClosers)
      .catch(() => null)
  }, [])

  async function addCloser(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/closers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json() as Closer & { error?: string }
      if (data.error) { setError(data.error); return }
      setClosers((prev) => [data, ...prev])
      setForm({ name: '', email: '', commission_pct: 20 })
    } catch {
      setError('Failed to add closer')
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(id: string, is_active: boolean) {
    await fetch('/api/admin/closers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !is_active }),
    })
    setClosers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !is_active } : c))
    )
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cream mb-1">Closers</h1>
        <p className="text-cream/40 text-sm">
          Freelance sales closers. Inbound calls are auto-assigned round-robin based on call count.
        </p>
      </div>

      <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6 mb-6">
        <h2 className="text-cream font-semibold text-sm mb-4">Cal.com Webhook URL</h2>
        <p className="text-cream/40 text-xs mb-2">
          Add this to cal.com → Settings → Developer → Webhooks → BOOKING_CREATED
        </p>
        <div className="bg-navy rounded-lg px-4 py-3 font-mono text-accent text-sm break-all">
          {baseUrl}/api/webhooks/calcom
        </div>
      </div>

      <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6 mb-8">
        <h2 className="text-cream font-semibold text-sm mb-4">Add Closer</h2>
        <form onSubmit={addCloser} className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="flex-1 min-w-[160px] bg-navy border border-white/10 rounded-lg px-3 py-2 text-cream text-sm placeholder-cream/30 focus:outline-none focus:border-accent/40"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="flex-1 min-w-[200px] bg-navy border border-white/10 rounded-lg px-3 py-2 text-cream text-sm placeholder-cream/30 focus:outline-none focus:border-accent/40"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={50}
              value={form.commission_pct}
              onChange={(e) => setForm({ ...form, commission_pct: parseInt(e.target.value) || 20 })}
              className="w-20 bg-navy border border-white/10 rounded-lg px-3 py-2 text-cream text-sm focus:outline-none focus:border-accent/40"
            />
            <span className="text-cream/40 text-sm">% commission</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-accent text-navy px-5 py-2 rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Closer'}
          </button>
        </form>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>

      {closers.length === 0 ? (
        <div className="text-center py-16 text-cream/30">
          <p className="text-sm">No closers added yet.</p>
          <p className="text-xs mt-1">When you add closers, inbound calls will be auto-assigned to them.</p>
        </div>
      ) : (
        <div className="bg-navy-light border border-white/[0.06] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-cream/40 text-xs font-medium px-6 py-3">Name</th>
                <th className="text-left text-cream/40 text-xs font-medium px-6 py-3">Email</th>
                <th className="text-left text-cream/40 text-xs font-medium px-6 py-3">Commission</th>
                <th className="text-left text-cream/40 text-xs font-medium px-6 py-3">Calls</th>
                <th className="text-left text-cream/40 text-xs font-medium px-6 py-3">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {closers.map((c) => (
                <tr key={c.id} className={c.is_active ? '' : 'opacity-50'}>
                  <td className="px-6 py-4 text-cream text-sm font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-cream/60 text-sm">{c.email}</td>
                  <td className="px-6 py-4 text-cream/60 text-sm">{c.commission_pct}%</td>
                  <td className="px-6 py-4 text-cream/60 text-sm">{c.calls_assigned}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.is_active
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-white/5 text-cream/40'
                    }`}>
                      {c.is_active ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleActive(c.id, c.is_active)}
                      className="text-cream/30 hover:text-cream/70 text-xs transition-colors"
                    >
                      {c.is_active ? 'Pause' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
