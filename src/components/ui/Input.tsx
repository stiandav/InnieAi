import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-cream/70 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full bg-navy-muted border rounded-lg px-4 py-2.5 text-cream
          placeholder:text-cream/30 focus:outline-none focus:ring-2
          transition-colors text-sm
          ${error
            ? 'border-red-500/50 focus:ring-red-500/30'
            : 'border-white/10 focus:ring-accent/30 focus:border-accent/50'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
