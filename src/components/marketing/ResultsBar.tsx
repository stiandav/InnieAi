'use client'

import React, { useEffect, useRef, useState } from 'react'

const stats = [
  { value: 89, suffix: '', label: 'avg new Google reviews in 90 days', prefix: '' },
  { value: 3.2, suffix: 'x', label: 'avg increase in lead response rate', prefix: '' },
  { value: 47, suffix: '', label: 'active clients across 5 niches', prefix: '' },
  { value: 14, suffix: ' days', label: 'average time from signup to live', prefix: '' },
]

function CountUp({ target, suffix, prefix, duration = 1800 }: { target: number; suffix: string; prefix: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const steps = 60
    const increment = target / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(interval)
      } else {
        setCount(parseFloat(current.toFixed(1)))
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [started, target, duration])

  return (
    <span ref={ref}>
      {prefix}{typeof target === 'number' && !Number.isInteger(target) ? count.toFixed(1) : Math.round(count)}{suffix}
    </span>
  )
}

export function ResultsBar() {
  return (
    <section className="py-16 bg-navy border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2 tabular-nums">
                <CountUp target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </div>
              <p className="text-cream/50 text-sm leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
