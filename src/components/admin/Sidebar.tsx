'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '⬡' },
  { href: '/admin/leads', label: 'Leads', icon: '◎' },
  { href: '/admin/clients', label: 'Clients', icon: '◈' },
  { href: '/admin/proposals', label: 'Proposals', icon: '◻' },
  { href: '/admin/billing', label: 'Billing', icon: '◇' },
  { href: '/admin/blog', label: 'Blog', icon: '◁' },
  { href: '/admin/affiliates', label: 'Affiliates', icon: '◉' },
  { href: '/admin/email-templates', label: 'Templates', icon: '◌' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-navy-light border-r border-white/[0.06] flex flex-col py-6 flex-shrink-0">
      <Link href="/admin" className="px-6 mb-8 block">
        <span className="text-cream font-bold text-xl tracking-tight">
          Innie<span className="text-accent">AI</span>
        </span>
        <span className="block text-cream/30 text-xs mt-0.5">Admin Dashboard</span>
      </Link>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-accent/15 text-accent font-medium'
                  : 'text-cream/50 hover:text-cream hover:bg-white/5'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-6 mt-6 border-t border-white/[0.06] pt-4">
        <Link
          href="/"
          className="text-cream/30 hover:text-cream/60 text-xs flex items-center gap-2 transition-colors"
        >
          ← View Site
        </Link>
      </div>
    </aside>
  )
}
