'use client'

import React from 'react'
import type { Client } from '@/types/database'
import { Badge } from '@/components/ui/Badge'

interface ClientsTableProps {
  clients: Client[]
}

const statusVariant: Record<Client['status'], 'success' | 'warning' | 'danger' | 'default'> = {
  Active: 'success',
  Onboarding: 'warning',
  'Payment Issue': 'danger',
  Churned: 'default',
}

export function ClientsTable({ clients }: ClientsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Client', 'Company', 'Tier', 'MRR', 'Status', 'Churn Score', 'Started', 'Actions'].map((h) => (
              <th key={h} className="text-left text-cream/40 font-medium pb-3 pr-4 text-xs uppercase tracking-widest">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-white/[0.02] transition-colors">
              <td className="py-4 pr-4 text-cream font-medium">{client.name}</td>
              <td className="py-4 pr-4 text-cream/60">{client.company}</td>
              <td className="py-4 pr-4">
                <Badge variant={client.tier === 'Scale' ? 'info' : client.tier === 'Growth' ? 'blue' : 'default'}>
                  {client.tier}
                </Badge>
              </td>
              <td className="py-4 pr-4 text-cream font-mono">
                ${(client.mrr / 100).toLocaleString()}
              </td>
              <td className="py-4 pr-4">
                <Badge variant={statusVariant[client.status]}>{client.status}</Badge>
              </td>
              <td className="py-4 pr-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      client.churn_score >= 7
                        ? 'bg-red-500/20 text-red-400'
                        : client.churn_score >= 4
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {client.churn_score}
                  </div>
                </div>
              </td>
              <td className="py-4 pr-4 text-cream/40 text-xs">
                {new Date(client.created_at).toLocaleDateString()}
              </td>
              <td className="py-4 pr-4">
                <a
                  href={`/portal/${client.id}`}
                  className="text-accent text-xs hover:underline"
                >
                  View Portal
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
