import React from 'react'
import { createServerClient } from '@/lib/supabase/server'
import type { Affiliate } from '@/types/database'

export default async function AdminAffiliatesPage() {
  let affiliates: Affiliate[] = []
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('affiliates')
      .select('*')
      .order('total_earned', { ascending: false })
    affiliates = data ?? []
  } catch {
    affiliates = []
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cream mb-1">Affiliates</h1>
        <p className="text-cream/40 text-sm">{affiliates.length} partners · 15% recurring commission</p>
      </div>

      <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Name', 'Email', 'Ref Code', 'Commission', 'Total Earned', 'Joined'].map((h) => (
                <th key={h} className="text-left text-cream/40 font-medium pb-3 pr-4 text-xs uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {affiliates.map((aff) => (
              <tr key={aff.id} className="hover:bg-white/[0.02]">
                <td className="py-4 pr-4 text-cream font-medium">{aff.name}</td>
                <td className="py-4 pr-4 text-cream/60">{aff.email}</td>
                <td className="py-4 pr-4">
                  <code className="bg-navy-muted text-accent text-xs px-2 py-0.5 rounded">
                    {aff.ref_code}
                  </code>
                </td>
                <td className="py-4 pr-4 text-cream/60">{aff.commission_rate}%</td>
                <td className="py-4 pr-4 text-cream font-mono">${(aff.total_earned / 100).toLocaleString()}</td>
                <td className="py-4 pr-4 text-cream/40 text-xs">
                  {new Date(aff.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {affiliates.length === 0 && (
          <p className="text-cream/40 text-sm text-center py-8">No affiliates yet.</p>
        )}
      </div>
    </div>
  )
}
