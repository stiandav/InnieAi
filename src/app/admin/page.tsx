import React from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { KPIBar } from '@/components/admin/KPIBar'
import { ActionQueue } from '@/components/admin/ActionQueue'
import type { Client, Proposal } from '@/types/database'

async function getDashboardData() {
  try {
    const supabase = createServerClient()

    const [
      { data: clients },
      { data: leads },
      { data: proposals },
    ] = await Promise.all([
      supabase.from('clients').select('*').in('status', ['Active', 'Onboarding', 'Payment Issue']),
      supabase.from('leads').select('id, created_at').gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      supabase.from('proposals').select('*').order('created_at', { ascending: false }),
    ])

    const activeClients = (clients ?? []).filter((c: Client) => c.status === 'Active')
    const mrr = activeClients.reduce((sum: number, c: Client) => sum + c.mrr, 0)
    const proposalsSent = (proposals ?? []).filter((p: Proposal) => p.status !== 'Draft').length
    const proposalsAccepted = (proposals ?? []).filter((p: Proposal) => p.status === 'Accepted').length
    const closeRate = proposalsSent > 0 ? Math.round((proposalsAccepted / proposalsSent) * 100) : 0

    const actionItems = []

    // Churn risks
    const churnRisks = (clients ?? []).filter((c: Client) => c.churn_score >= 7)
    for (const c of churnRisks.slice(0, 3)) {
      actionItems.push({
        type: 'churn' as const,
        message: `Churn risk: ${c.name} at ${c.company} (score: ${c.churn_score})`,
        href: '/admin/clients',
        urgency: 'high' as const,
      })
    }

    // Stale proposals (viewed > 48h ago, not accepted)
    const twoDaysAgo = new Date(Date.now() - 48 * 3600000).toISOString()
    const staleProposals = (proposals ?? []).filter(
      (p: Proposal) => p.status === 'Viewed' && p.first_viewed_at && p.first_viewed_at < twoDaysAgo
    )
    for (const p of staleProposals.slice(0, 3)) {
      actionItems.push({
        type: 'proposal' as const,
        message: `Follow up: ${p.client_name} viewed proposal 48h+ ago`,
        href: '/admin/proposals',
        urgency: 'medium' as const,
      })
    }

    // Payment issues
    const paymentIssues = (clients ?? []).filter((c: Client) => c.status === 'Payment Issue')
    for (const c of paymentIssues.slice(0, 3)) {
      actionItems.push({
        type: 'payment' as const,
        message: `Payment failed: ${c.company} — retry link needed`,
        href: '/admin/billing',
        urgency: 'high' as const,
      })
    }

    return {
      mrr,
      activeClientCount: activeClients.length,
      leadsThisWeek: (leads ?? []).length,
      proposalsSent,
      closeRate,
      actionItems,
    }
  } catch {
    return {
      mrr: 0,
      activeClientCount: 0,
      leadsThisWeek: 0,
      proposalsSent: 0,
      closeRate: 0,
      actionItems: [],
    }
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  const kpis = [
    { label: 'MRR', value: `$${(data.mrr / 100).toLocaleString()}`, change: '+$2,500 this month', changePositive: true },
    { label: 'Active Clients', value: data.activeClientCount },
    { label: 'Leads This Week', value: data.leadsThisWeek, change: 'vs 47 last week', changePositive: true },
    { label: 'Proposals Sent', value: data.proposalsSent },
    { label: 'Close Rate', value: `${data.closeRate}%` },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-cream mb-1">Good morning.</h1>
        <p className="text-cream/40 text-sm">Here&apos;s what needs your attention today.</p>
      </div>

      <ActionQueue items={data.actionItems} />
      <KPIBar kpis={kpis} />
    </div>
  )
}
