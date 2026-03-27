import React from 'react'

interface KPI {
  label: string
  value: string | number
  change?: string
  changePositive?: boolean
}

interface KPIBarProps {
  kpis: KPI[]
}

export function KPIBar({ kpis }: KPIBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-navy-light border border-white/[0.06] rounded-xl p-5"
        >
          <p className="text-cream/40 text-xs uppercase tracking-widest font-medium mb-2">
            {kpi.label}
          </p>
          <p className="text-cream text-2xl font-bold mb-1">{kpi.value}</p>
          {kpi.change && (
            <p
              className={`text-xs font-medium ${
                kpi.changePositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {kpi.change}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
