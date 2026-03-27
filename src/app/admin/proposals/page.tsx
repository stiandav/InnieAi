import React from 'react'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { ProposalsTable } from '@/components/admin/ProposalsTable'
import type { Proposal } from '@/types/database'

export default async function AdminProposalsPage() {
  let proposals: Proposal[] = []
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false })
    proposals = data ?? []
  } catch {
    proposals = []
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-cream mb-1">Proposals</h1>
          <p className="text-cream/40 text-sm">{proposals.length} total</p>
        </div>
        <Link
          href="/admin/proposals/new"
          className="bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          + New Proposal
        </Link>
      </div>
      <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6">
        <ProposalsTable proposals={proposals} />
      </div>
    </div>
  )
}
