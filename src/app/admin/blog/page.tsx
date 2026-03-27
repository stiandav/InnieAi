'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

// Client page — fetches posts on mount
export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Array<{
    id: string; title: string; niche: string | null; published: boolean; published_at: string | null; created_at: string
  }>>([])
  const [loading, setLoading] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function loadPosts() {
    setLoading(true)
    try {
      const res = await fetch('/api/blog/list')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts ?? [])
      }
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }

  async function triggerPost() {
    setTriggering(true)
    try {
      await fetch('/api/blog/trigger', { method: 'POST' })
      await loadPosts()
    } finally {
      setTriggering(false)
    }
  }

  React.useEffect(() => {
    loadPosts()
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cream mb-1">Blog</h1>
          <p className="text-cream/40 text-sm">Auto-published Tuesday + Friday at 7am PST</p>
        </div>
        <Button onClick={triggerPost} loading={triggering}>
          Trigger Post Now
        </Button>
      </div>

      <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6">
        {!loaded || loading ? (
          <p className="text-cream/40 text-sm">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-cream/40 text-sm">No posts yet. Trigger one above or wait for the scheduled action.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Title', 'Niche', 'Status', 'Published', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-cream/40 font-medium pb-3 pr-4 text-xs uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02]">
                    <td className="py-4 pr-4 text-cream font-medium max-w-xs truncate">{post.title}</td>
                    <td className="py-4 pr-4 text-cream/60">{post.niche ?? '—'}</td>
                    <td className="py-4 pr-4">
                      <Badge variant={post.published ? 'success' : 'default'}>
                        {post.published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="py-4 pr-4 text-cream/40 text-xs">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 pr-4">
                      {post.published && (
                        <a
                          href={`/blog/${post.id}`}
                          target="_blank"
                          className="text-accent text-xs hover:underline"
                        >
                          View →
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
