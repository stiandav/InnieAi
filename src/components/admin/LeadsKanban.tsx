'use client'

import React, { useState } from 'react'
import type { Lead, LeadStatus } from '@/types/database'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'

const columns: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'Lead', label: 'Lead', color: 'text-blue-400' },
  { status: 'Contacted', label: 'Contacted', color: 'text-yellow-400' },
  { status: 'Proposal Sent', label: 'Proposal Sent', color: 'text-orange-400' },
  { status: 'Closed Won', label: 'Closed Won', color: 'text-green-400' },
  { status: 'Active Client', label: 'Client', color: 'text-accent' },
  { status: 'Churned', label: 'Churned', color: 'text-red-400' },
]

interface LeadsKanbanProps {
  leads: Lead[]
}

export function LeadsKanban({ leads: initialLeads }: LeadsKanbanProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [selected, setSelected] = useState<Lead | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function updateLead(id: string, updates: Partial<Lead>) {
    setSaving(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
        )
        if (selected?.id === id) setSelected((prev) => prev ? { ...prev, ...updates } : null)
      }
    } finally {
      setSaving(false)
    }
  }

  function openCard(lead: Lead) {
    setSelected(lead)
    setNotes(lead.notes ?? '')
  }

  async function saveNotes() {
    if (!selected) return
    await updateLead(selected.id, { notes })
    setSelected(null)
  }

  const scoreColor = (score: number) =>
    score >= 8 ? 'success' : score >= 5 ? 'warning' : 'default'

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
        {columns.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.status)
          return (
            <div key={col.status} className="flex-shrink-0 w-64">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                <span className="bg-white/10 text-cream/60 text-xs px-2 py-0.5 rounded-full">
                  {colLeads.length}
                </span>
              </div>
              <div className="space-y-2">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-navy-light border border-white/[0.06] rounded-xl p-4 kanban-card hover:border-white/[0.12] transition-all"
                    onClick={() => openCard(lead)}
                  >
                    <p className="text-cream text-sm font-medium mb-1 truncate">{lead.company_name}</p>
                    <p className="text-cream/40 text-xs mb-3">{lead.city} · {lead.niche}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant={scoreColor(lead.score)}>Score {lead.score}</Badge>
                      {lead.competitive_flag && (
                        <span className="text-yellow-400 text-xs">⚡ Hot</span>
                      )}
                    </div>
                    {lead.rating && (
                      <p className="text-cream/30 text-xs mt-2">
                        ⭐ {lead.rating} ({lead.review_count} reviews)
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.company_name} maxWidth="md">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-cream/40 text-xs">City</p>
                <p className="text-cream">{selected.city}</p>
              </div>
              <div>
                <p className="text-cream/40 text-xs">Niche</p>
                <p className="text-cream">{selected.niche}</p>
              </div>
              <div>
                <p className="text-cream/40 text-xs">Phone</p>
                <p className="text-cream">{selected.phone ?? '—'}</p>
              </div>
              <div>
                <p className="text-cream/40 text-xs">Email</p>
                <p className="text-cream">{selected.email ?? '—'}</p>
              </div>
              <div>
                <p className="text-cream/40 text-xs">Score</p>
                <p className="text-cream">{selected.score}/10</p>
              </div>
              <div>
                <p className="text-cream/40 text-xs">Sequence Step</p>
                <p className="text-cream">{selected.sequence_step}/4</p>
              </div>
            </div>

            <div>
              <p className="text-cream/40 text-xs mb-1">Status</p>
              <select
                value={selected.status}
                onChange={(e) => updateLead(selected.id, { status: e.target.value as LeadStatus })}
                className="bg-navy-muted border border-white/10 text-cream text-sm rounded-lg px-3 py-2 w-full"
              >
                {columns.map((c) => (
                  <option key={c.status} value={c.status}>{c.label}</option>
                ))}
              </select>
            </div>

            <Textarea
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes about this lead..."
            />

            {selected.website && (
              <a href={selected.website} target="_blank" rel="noopener noreferrer"
                className="text-accent text-sm hover:underline block">
                → View Website
              </a>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={saveNotes} loading={saving} className="flex-1">
                Save Notes
              </Button>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
