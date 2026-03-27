import React from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import type { Client } from '@/types/database'

export default async function AdminBillingPage() {
  let clients: Client[] = []
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    clients = data ?? []
  } catch {
    clients = []
  }

  const mrr = clients
    .filter((c) => c.status === 'Active')
    .reduce((sum, c) => sum + c.mrr, 0)

  const paymentIssues = clients.filter((c) => c.status === 'Payment Issue')

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-cream mb-1">Billing</h1>
        <p className="text-cream/40 text-sm">Stripe subscription management</p>
      </div>

      {/* MRR summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6">
          <p className="text-cream/40 text-xs uppercase tracking-widest mb-2">Total MRR</p>
          <p className="text-3xl font-bold text-cream">${(mrr / 100).toLocaleString()}</p>
        </div>
        <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6">
          <p className="text-cream/40 text-xs uppercase tracking-widest mb-2">Active Subscriptions</p>
          <p className="text-3xl font-bold text-cream">{clients.filter((c) => c.status === 'Active').length}</p>
        </div>
        <div className={`rounded-xl p-6 border ${paymentIssues.length > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-navy-light border-white/[0.06]'}`}>
          <p className="text-cream/40 text-xs uppercase tracking-widest mb-2">Payment Issues</p>
          <p className={`text-3xl font-bold ${paymentIssues.length > 0 ? 'text-red-400' : 'text-cream'}`}>
            {paymentIssues.length}
          </p>
        </div>
      </div>

      {/* Subscriptions table */}
      <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6">
        <h2 className="text-cream font-semibold mb-6">All Subscriptions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Client', 'Plan', 'MRR', 'Status', 'Stripe ID', 'Started'].map((h) => (
                  <th key={h} className="text-left text-cream/40 font-medium pb-3 pr-4 text-xs uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02]">
                  <td className="py-4 pr-4 text-cream font-medium">{c.name}</td>
                  <td className="py-4 pr-4">
                    <Badge variant="default">{c.tier}</Badge>
                  </td>
                  <td className="py-4 pr-4 text-cream font-mono">${(c.mrr / 100).toLocaleString()}/mo</td>
                  <td className="py-4 pr-4">
                    <Badge variant={c.status === 'Active' ? 'success' : c.status === 'Payment Issue' ? 'danger' : 'default'}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-4 pr-4 text-cream/30 text-xs font-mono truncate max-w-32">
                    {c.stripe_subscription_id ?? '—'}
                  </td>
                  <td className="py-4 pr-4 text-cream/40 text-xs">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
