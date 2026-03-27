'use client'

import React, { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (res.ok) {
      const from = searchParams.get('from') || '/admin'
      router.push(from)
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-navy-light border border-white/[0.07] rounded-2xl p-8 space-y-4">
      <div>
        <label className="block text-cream/60 text-sm mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-navy border border-white/10 rounded-lg px-4 py-2.5 text-cream text-sm focus:outline-none focus:border-accent/50 transition-colors"
          placeholder="Enter admin password"
          autoFocus
          required
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !password}
        className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}

export default function AdminLogin() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-cream font-bold text-2xl tracking-tight">
            Innie<span className="text-accent">AI</span>
          </h1>
          <p className="text-cream/40 text-sm mt-2">Admin access</p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
