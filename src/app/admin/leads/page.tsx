import React from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { LeadsKanban } from '@/components/admin/LeadsKanban'
import type { Lead } from '@/types/database'

export default async function AdminLeadsPage() {
  let leads: Lead[] = []
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('leads')
      .select('*')
      .not('status', 'in', '("Invalid","Churned")')
      .order('score', { ascending: false })
    leads = data ?? []
  } catch {
    leads = []
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-cream mb-1">Leads</h1>
          <p className="text-cream/40 text-sm">{leads.length} leads in pipeline</p>
        </div>
      </div>
      <LeadsKanban leads={leads} />
    </div>
  )
}
