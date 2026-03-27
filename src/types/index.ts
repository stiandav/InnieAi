export * from './database'
export * from './api'

export type NicheSlug = 'real-estate' | 'dental' | 'medspa' | 'gyms' | 'contractors'

export const NICHE_LABELS: Record<NicheSlug, string> = {
  'real-estate': 'Real Estate',
  dental: 'Dental',
  medspa: 'Med Spas',
  gyms: 'Gyms & Fitness',
  contractors: 'Contractors',
}

export const PRICING = {
  Starter: { monthly: 1500, setup: 1500 },
  Growth: { monthly: 2500, setup: 2000 },
  Scale: { monthly: 4000, setup: 2500 },
} as const
