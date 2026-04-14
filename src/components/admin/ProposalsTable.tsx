'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import type { Proposal } from '@/types/database'
import { Badge } from '@/components/ui/Badge'

interface ProposalsTableProps {
  proposals: Proposal[]
}

const statusVariant: Record<Proposal['status'], 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  Draft: 'default',
  Sent: 'info',
  Viewed: 'warning',
  Accepted: 'success',
  Declined: 'danger',
  'Pending Payment': 'warning',
}

function SendButton({ proposalId, clientEmail }: { proposalId: string; clientEmail: string | null }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function send() {
    if (!clientEmail) {
      alert('No email on this proposal — edit it to add one first.')
      return
    }
    setState('sending')
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send' }),
      })
      const data = await res.json() as { success: boolean }
      setState(data.success ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') return <span className="text-green-400 text-xs">Sent ✓</span>
  if (state === 'error') return <span className="text-red-400 text-xs">Failed</span>

  return (
    <button
      onClick={send}
      disabled={state === 'sending'}
      className="text-accent text-xs hover:underline disabled:opacity-50"
    >
      {state === 'sending' ? 'Sending…' : 'Send →'}
    </button>
  )
}

export function ProposalsTable({ proposals }: ProposalsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Client', 'Company', 'Tier', 'Status', 'Views', 'Created', 'Actions'].map((h) => (
              <th key={h} className="text-left text-cream/40 font-medium pb-3 pr-4 text-xs uppercase tracking-widest">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {proposals.map((p) => (
            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
              <td className="py-4 pr-4 text-cream font-medium">{p.client_name}</td>
              <td className="py-4 pr-4 text-cream/60">{p.company}</td>
              <td className="py-4 pr-4">
                <Badge variant="default">{p.tier}</Badge>
              </td>
              <td className="py-4 pr-4">
                <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
              </td>
              <td className="py-4 pr-4 text-cream/60">{p.view_count}</td>
              <td className="py-4 pr-4 text-cream/40 text-xs">
                {new Date(p.created_at).toLocaleDateString()}
              </td>
              <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/proposal/${p.id}`}
                    target="_blank"
                    className="text-cream/40 text-xs hover:text-cream/70 hover:underline"
                  >
                    Preview
                  </Link>
                  {(p.status === 'Draft' || p.status === 'Sent' || p.status === 'Viewed') && (
                    <SendButton proposalId={p.id} clientEmail={p.client_email} />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
