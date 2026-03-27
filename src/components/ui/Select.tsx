import React from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
}

export function Select({ label, options, error, className = '', id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-cream/70 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`
          w-full bg-navy-muted border rounded-lg px-4 py-2.5 text-cream
          focus:outline-none focus:ring-2 transition-colors text-sm
          ${error
            ? 'border-red-500/50 focus:ring-red-500/30'
            : 'border-white/10 focus:ring-accent/30 focus:border-accent/50'
          }
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
