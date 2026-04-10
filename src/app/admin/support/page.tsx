'use client'

import React, { useState, useEffect } from 'react'

type TicketRow = {
  id: string
  message: string
  status: 'open' | 'resolved'
  resolved_at: string | null
  created_at: string
  clients: { name: string; company: string; email: string } | null
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open')

  useEffect(() => {
    fetch('/api/admin/support')
      .then((r) => r.json())
      .then(setTickets)
      .catch(() => null)
  }, [])

  async function resolve(id: string) {
    await fetch('/api/admin/support', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'resolved', resolved_at: new Date().toISOString() }
          : t
      )
    )
  }

  const filtered = tickets.filter((t) =>
    filter === 'all' ? true : t.status === filter
  )
  const openCount = tickets.filter((t) => t.status === 'open').length

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-cream mb-1">Support Tickets</h1>
          <p className="text-cream/40 text-sm">Messages submitted by clients from their portal.</p>
        </div>
        {openCount > 0 && (
          <span className="bg-accent/15 text-accent text-sm font-medium px-3 py-1 rounded-full">
            {openCount} open
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {(['open', 'resolved', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
              filter === f
                ? 'bg-accent/15 text-accent'
                : 'text-cream/40 hover:text-cream hover:bg-white/5'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-cream/30 text-sm">
          {filter === 'open' ? 'No open tickets.' : 'No tickets found.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <div
              key={ticket.id}
              className={`bg-navy-light border rounded-xl p-5 ${
                ticket.status === 'open' ? 'border-accent/20' : 'border-white/[0.06]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-cream font-medium text-sm">
                      {ticket.clients?.name ?? 'Unknown'}
                    </span>
                    <span className="text-cream/40 text-xs">
                      {ticket.clients?.company}
                    </span>
                    <span className="text-cream/20 text-xs">·</span>
                    <span className="text-cream/40 text-xs">
                      {new Date(ticket.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                      })}
                    </span>
                    {ticket.status === 'open' && (
                      <span className="bg-accent/15 text-accent text-xs px-2 py-0.5 rounded-full">
                        Open
                      </span>
                    )}
                  </div>
                  <p className="text-cream/70 text-sm leading-relaxed whitespace-pre-wrap">
                    {ticket.message}
                  </p>
                  {ticket.clients?.email && (
                    <a
                      href={`mailto:${ticket.clients.email}`}
                      className="text-accent/70 hover:text-accent text-xs mt-2 inline-block transition-colors"
                    >
                      Reply: {ticket.clients.email}
                    </a>
                  )}
                </div>
                {ticket.status === 'open' && (
                  <button
                    onClick={() => resolve(ticket.id)}
                    className="flex-shrink-0 text-cream/30 hover:text-green-400 text-xs transition-colors px-3 py-1.5 border border-white/10 hover:border-green-400/30 rounded-lg"
                  >
                    Mark resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
