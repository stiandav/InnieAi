import React from 'react'
import Link from 'next/link'

interface ActionItem {
  type: 'lead' | 'churn' | 'proposal' | 'payment'
  message: string
  href: string
  urgency: 'high' | 'medium'
}

interface ActionQueueProps {
  items: ActionItem[]
}

const typeConfig = {
  lead: { icon: '📋', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  churn: { icon: '⚠️', color: 'text-red-400', bg: 'bg-red-500/10' },
  proposal: { icon: '📄', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  payment: { icon: '💳', color: 'text-red-400', bg: 'bg-red-500/10' },
}

export function ActionQueue({ items }: ActionQueueProps) {
  if (items.length === 0) {
    return (
      <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6">
        <h2 className="text-cream font-semibold mb-4">Daily Action Queue</h2>
        <p className="text-cream/40 text-sm flex items-center gap-2">
          <span className="text-green-400">✓</span>
          All clear — nothing urgent today.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-navy-light border border-white/[0.06] rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-cream font-semibold">Daily Action Queue</h2>
        <span className="bg-red-500/15 text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full">
          {items.length} items
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => {
          const config = typeConfig[item.type]
          return (
            <Link
              key={i}
              href={item.href}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.03] transition-colors group"
            >
              <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0 text-sm`}>
                {config.icon}
              </div>
              <p className={`text-sm flex-1 ${config.color} group-hover:text-cream transition-colors`}>
                {item.message}
              </p>
              <svg className="w-4 h-4 text-cream/20 group-hover:text-cream/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
