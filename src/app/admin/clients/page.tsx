import React from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { ClientsTable } from '@/components/admin/ClientsTable'
import type { Client } from '@/types/database'

export default async function AdminClientsPage() {
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-cream mb-1">Clients</h1>
          <p className="text-cream/40 text-sm">
            {clients.filter((c) => c.status === 'Active').length} active ·{' '}
            Total MRR: ${(mrr / 100).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6">
        <ClientsTable clients={clients} />
      </div>
    </div>
  )
}
