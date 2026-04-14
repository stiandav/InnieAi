import React from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { KPIBar } from '@/components/admin/KPIBar'
import { ActionQueue } from '@/components/admin/ActionQueue'
import type { Client, Proposal } from '@/types/database'

async function getDashboardData() {
  try {
    const supabase = createServerClient()

    const startOfLastMonth = new Date()
    startOfLastMonth.setDate(1)
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1)
    startOfLastMonth.setHours(0, 0, 0, 0)

    const startOfThisMonth = new Date()
    startOfThisMonth.setDate(1)
    startOfThisMonth.setHours(0, 0, 0, 0)

    const lastWeekStart = new Date(Date.now() - 7 * 86400000).toISOString()
    const twoWeeksStart = new Date(Date.now() - 14 * 86400000).toISOString()

    const [
      { data: clients },
      { count: leadsThisWeek },
      { count: leadsLastWeek },
      { data: proposals },
      { data: lastMonthClients },
    ] = await Promise.all([
      supabase.from('clients').select('*').in('status', ['Active', 'Onboarding', 'Payment Issue']),
      supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', lastWeekStart),
      supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', twoWeeksStart).lt('created_at', lastWeekStart),
      supabase.from('proposals').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('mrr').eq('status', 'Active').lt('created_at', startOfThisMonth.toISOString()),
    ])

    const allClients: Client[] = (clients as Client[]) ?? []
    const allProposals: Proposal[] = (proposals as Proposal[]) ?? []

    const activeClients = allClients.filter(c => c.status === 'Active')
    const mrr = activeClients.reduce((sum, c) => sum + c.mrr, 0)
    const lastMrr = ((lastMonthClients ?? []) as { mrr: number }[]).reduce((sum, c) => sum + c.mrr, 0)
    const mrrDelta = mrr - lastMrr
    const mrrChange = mrrDelta === 0
      ? 'No change vs last month'
      : `${mrrDelta > 0 ? '+' : ''}$${Math.abs(mrrDelta).toLocaleString()} vs last month`

    const proposalsSent = allProposals.filter(p => p.status !== 'Draft').length
    const proposalsAccepted = allProposals.filter(p => p.status === 'Accepted').length
    const closeRate = proposalsSent > 0 ? Math.round((proposalsAccepted / proposalsSent) * 100) : 0

    const actionItems = []

    // Churn risks
    const churnRisks = allClients.filter(c => c.churn_score >= 7)
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
    const staleProposals = allProposals.filter(
      p => p.status === 'Viewed' && p.first_viewed_at && p.first_viewed_at < twoDaysAgo
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
    const paymentIssues = allClients.filter(c => c.status === 'Payment Issue')
    for (const c of paymentIssues.slice(0, 3)) {
      actionItems.push({
        type: 'payment' as const,
        message: `Payment failed: ${c.company} — retry link needed`,
        href: '/admin/billing',
        urgency: 'high' as const,
      })
    }

    const thisWeek = leadsThisWeek ?? 0
    const lastWeek = leadsLastWeek ?? 0
    const leadsDelta = thisWeek - lastWeek
    const leadsChange = lastWeek === 0
      ? null
      : `${leadsDelta >= 0 ? '+' : ''}${leadsDelta} vs last week`

    return {
      mrr,
      mrrChange,
      mrrChangePositive: mrrDelta >= 0,
      activeClientCount: activeClients.length,
      leadsThisWeek: thisWeek,
      leadsChange,
      leadsChangePositive: leadsDelta >= 0,
      proposalsSent,
      closeRate,
      actionItems,
    }
  } catch {
    return {
      mrr: 0,
      mrrChange: '',
      mrrChangePositive: true,
      activeClientCount: 0,
      leadsThisWeek: 0,
      leadsChange: null,
      leadsChangePositive: true,
      proposalsSent: 0,
      closeRate: 0,
      actionItems: [],
    }
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  const kpis = [
    { label: 'MRR', value: `$${data.mrr.toLocaleString()}`, change: data.mrrChange, changePositive: data.mrrChangePositive },
    { label: 'Active Clients', value: data.activeClientCount },
    { label: 'Leads This Week', value: data.leadsThisWeek, change: data.leadsChange ?? undefined, changePositive: data.leadsChangePositive },
    { label: 'Proposals (All Time)', value: data.proposalsSent },
    { label: 'Close Rate', value: `${data.closeRate}%` },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-cream mb-1">{new Date().getHours() < 12 ? 'Good morning.' : new Date().getHours() < 17 ? 'Good afternoon.' : 'Good evening.'}</h1>
        <p className="text-cream/40 text-sm">Here&apos;s what needs your attention today.</p>
      </div>

      <ActionQueue items={data.actionItems} />
      <KPIBar kpis={kpis} />
    </div>
  )
}
