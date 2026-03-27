'use client'

import React from 'react'
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
                <Link
                  href={`/proposal/${p.id}`}
                  target="_blank"
                  className="text-accent text-xs hover:underline"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
