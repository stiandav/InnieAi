import type { Tier } from './database'

export interface ApiResponse<T = null> {
  success: boolean
  data?: T
  error?: string
}

export interface CreateProposalRequest {
  clientName: string
  company: string
  niche: string
  painPoints: string
  tier: Tier
}

export interface CreateProposalResponse {
  id: string
  url: string
}

export interface AcceptProposalResponse {
  checkoutUrl: string
}

export interface DeclineProposalRequest {
  reason: string
}

export interface UpdateLeadRequest {
  id: string
  status?: string
  notes?: string
  sequence_step?: number
}

export interface OnboardingFormData {
  goals: string
  currentTools: string
  mainContact: string
  mainContactPhone: string
  monthlyRevenue: string
  biggestBottleneck: string
}

export interface TestimonialFormData {
  rating: number
  quote: string
  authorName: string
  authorTitle: string
}

export interface AffiliateSignupRequest {
  name: string
  email: string
}

export interface AffiliateSignupResponse {
  refCode: string
}

export interface SetupCheckResult {
  service: string
  status: 'ok' | 'error' | 'missing'
  message: string
}

export interface PortalDashboardData {
  client: {
    name: string
    company: string
    tier: string
    status: string
    created_at: string
  }
  stats: {
    leadsThisMonth: number
    emailsSentThisMonth: number
    reviewRequestsSent: number
  }
  recentLeads: Array<{ company_name: string; city: string; score: number; created_at: string }>
  latestReport: { content: string; week_of: string } | null
  invoices: Array<{ id: string; amount: number; status: string; created: number }>
}
