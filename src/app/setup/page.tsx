'use client'

import React, { useEffect, useState } from 'react'
import type { SetupCheckResult } from '@/types/api'

interface SetupData {
  envChecks: SetupCheckResult[]
  serviceChecks: SetupCheckResult[]
  allGreen: boolean
}

function StatusIcon({ status }: { status: 'ok' | 'error' | 'missing' }) {
  if (status === 'ok') return <span className="text-green-400 text-lg">✓</span>
  if (status === 'error') return <span className="text-red-400 text-lg">✗</span>
  return <span className="text-yellow-400 text-lg">○</span>
}

export default function SetupPage() {
  const [data, setData] = useState<SetupData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/setup')
      .then((r) => r.json())
      .then((d) => setData(d as SetupData))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-navy py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <p className="text-accent font-bold text-xl mb-2">Innie<span className="text-cream">AI</span></p>
          <h1 className="text-cream text-2xl font-bold mb-1">Setup Validation</h1>
          <p className="text-cream/40 text-sm">Check all environment variables and service connections.</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-cream/50">
            <div className="animate-spin w-5 h-5 border-2 border-accent border-t-transparent rounded-full" />
            Running checks...
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Overall status */}
            <div className={`rounded-2xl p-6 border text-center ${
              data.allGreen
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-yellow-500/10 border-yellow-500/30'
            }`}>
              <p className={`text-2xl font-bold ${data.allGreen ? 'text-green-400' : 'text-yellow-400'}`}>
                {data.allGreen ? '✓ All systems go' : '⚠ Action required'}
              </p>
              <p className={`text-sm mt-1 ${data.allGreen ? 'text-green-400/70' : 'text-yellow-400/70'}`}>
                {data.allGreen
                  ? 'InnieAI is fully configured and ready to run.'
                  : 'Some environment variables or services need attention.'}
              </p>
            </div>

            {/* Service checks */}
            <div className="bg-navy-light border border-white/[0.06] rounded-2xl p-6">
              <h2 className="text-cream font-semibold mb-5">Live Service Connections</h2>
              <div className="space-y-3">
                {data.serviceChecks.map((check) => (
                  <div key={check.service} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center gap-3">
                      <StatusIcon status={check.status} />
                      <span className="text-cream text-sm font-medium">{check.service}</span>
                    </div>
                    <span className={`text-xs ${
                      check.status === 'ok' ? 'text-green-400/70' :
                      check.status === 'missing' ? 'text-yellow-400/70' :
                      'text-red-400/70'
                    }`}>
                      {check.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Env var checks */}
            <div className="bg-navy-light border border-white/[0.06] rounded-2xl p-6">
              <h2 className="text-cream font-semibold mb-5">Environment Variables</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.envChecks.map((check) => (
                  <div key={check.service} className="flex items-center gap-3">
                    <StatusIcon status={check.status} />
                    <span className={`text-xs font-mono ${
                      check.status === 'ok' ? 'text-cream/60' : 'text-yellow-400'
                    }`}>
                      {check.service}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {!data.allGreen && (
              <div className="bg-navy-light border border-white/[0.06] rounded-2xl p-6">
                <h2 className="text-cream font-semibold mb-4">Next Steps</h2>
                <ol className="space-y-2 text-cream/60 text-sm">
                  <li>1. Copy <code className="text-accent">.env.example</code> to <code className="text-accent">.env</code> and fill in all values</li>
                  <li>2. Run <code className="text-accent">supabase/schema.sql</code> in your Supabase SQL Editor</li>
                  <li>3. Run <code className="text-accent">supabase/seed.sql</code> to populate demo data</li>
                  <li>4. Add all env vars as GitHub Secrets for cron jobs to work</li>
                  <li>5. Configure Stripe webhook endpoint: <code className="text-accent">/api/webhooks/stripe</code></li>
                </ol>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="text-accent text-sm hover:underline"
            >
              Re-run checks
            </button>
          </div>
        ) : (
          <p className="text-red-400">Failed to load setup data.</p>
        )}
      </div>
    </div>
  )
}
