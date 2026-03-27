import React from 'react'
import type { Metadata } from 'next'
import { Sidebar } from '@/components/admin/Sidebar'

export const metadata: Metadata = {
  title: 'Admin | InnieAI',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-navy overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
