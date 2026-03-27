'use client'

import React, { useEffect, useState } from 'react'
import type { PortalDashboardData } from '@/types/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

export default function PortalPage({ params }: { params: Promise<{ clientId: string }> }) {
  const [clientId, setClientId] = useState<string | null>(null)
  const [data, setData] = useState<PortalDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [supportMsg, setSupportMsg] = useState('')
  const [supportSent, setSupportSent] = useState(false)

  useEffect(() => {
    params.then(({ clientId: cid }) => {
      setClientId(cid)
      fetch(`/api/portal/${cid}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success) setData(res.data as PortalDashboardData)
        })
        .finally(() => setLoading(false))
    })
  }, [params])

  async function sendSupport() {
    if (!clientId || !supportMsg.trim()) return
    await fetch('/api/portal/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, message: supportMsg }),
    })
    setSupportMsg('')
    setSupportSent(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <p className="text-cream/50">Portal not found. Please contact support.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy">
      {/* Header */}
      <div className="bg-navy-light border-b border-white/[0.06] px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-accent font-bold text-lg">Innie<span className="text-cream">AI</span></p>
            <p className="text-cream/40 text-xs">{data.client.company} Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={data.client.status === 'Active' ? 'success' : 'warning'}>
              {data.client.status}
            </Badge>
            <Badge variant="blue">{data.client.tier}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-cream mb-1">
            Welcome back, {data.client.name.split(' ')[0]}.
          </h1>
          <p className="text-cream/40 text-sm">
            Client since {new Date(data.client.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Leads This Month', value: data.stats.leadsThisMonth, icon: '🎯' },
            { label: 'Emails Sent', value: data.stats.emailsSentThisMonth, icon: '📧' },
            { label: 'Review Requests', value: data.stats.reviewRequestsSent, icon: '⭐' },
          ].map((stat) => (
            <div key={stat.label} className="bg-navy-light border border-white/[0.06] rounded-xl p-6">
              <p className="text-2xl mb-2">{stat.icon}</p>
              <p className="text-3xl font-bold text-cream mb-1">{stat.value}</p>
              <p className="text-cream/40 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Active automations */}
        <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-cream font-semibold mb-5">Active Automations</h2>
          <div className="space-y-3">
            {[
              { name: 'Lead Generation', description: 'Running daily at 7am PST', active: true },
              { name: 'Email Outreach', description: 'Sending up to 40 emails/day', active: true },
              { name: 'Review Automation', description: 'Requesting reviews post-transaction', active: data.client.tier !== 'Starter' },
              { name: 'Weekly Reports', description: 'Delivered every Monday at 8am PST', active: true },
            ].map((auto) => (
              <div key={auto.name} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-cream text-sm font-medium">{auto.name}</p>
                  <p className="text-cream/40 text-xs">{auto.description}</p>
                </div>
                <Badge variant={auto.active ? 'success' : 'default'}>
                  {auto.active ? 'Active' : 'Upgrade Required'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Latest report */}
        {data.latestReport && (
          <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-cream font-semibold">Latest Weekly Report</h2>
              <span className="text-cream/30 text-xs">
                Week of {new Date(data.latestReport.week_of).toLocaleDateString()}
              </span>
            </div>
            <div className="text-cream/60 text-sm leading-relaxed whitespace-pre-wrap">
              {data.latestReport.content}
            </div>
          </div>
        )}

        {/* Recent leads */}
        {data.recentLeads.length > 0 && (
          <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6">
            <h2 className="text-cream font-semibold mb-5">Recent Leads Generated</h2>
            <div className="space-y-2">
              {data.recentLeads.map((lead, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                  <div>
                    <p className="text-cream text-sm">{lead.company_name}</p>
                    <p className="text-cream/40 text-xs">{lead.city}</p>
                  </div>
                  <Badge variant={lead.score >= 8 ? 'success' : lead.score >= 5 ? 'warning' : 'default'}>
                    Score {lead.score}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Support */}
        <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-cream font-semibold mb-4">Support</h2>
          {supportSent ? (
            <div className="flex items-center gap-3 text-green-400 text-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Message sent! We&apos;ll get back to you shortly.
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                label="Send us a message"
                value={supportMsg}
                onChange={(e) => setSupportMsg(e.target.value)}
                placeholder="Question or issue with your automations..."
                rows={3}
              />
              <Button onClick={sendSupport} disabled={!supportMsg.trim()}>
                Send Message
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
