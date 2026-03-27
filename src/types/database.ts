export type LeadStatus =
  | 'Lead'
  | 'Contacted'
  | 'Proposal Sent'
  | 'Closed Won'
  | 'Active Client'
  | 'Churned'
  | 'Invalid'

export type ClientStatus = 'Onboarding' | 'Active' | 'Payment Issue' | 'Churned'

export type ProposalStatus = 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Declined'

export type Tier = 'Starter' | 'Growth' | 'Scale'

export interface Lead {
  id: string
  company_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  website: string | null
  city: string
  niche: string
  rating: number | null
  review_count: number
  score: number
  status: LeadStatus
  source: string
  sequence_step: number
  notes: string | null
  competitive_flag: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  email: string
  company: string
  niche: string
  tier: Tier
  mrr: number
  setup_fee: number
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: ClientStatus
  churn_score: number
  onboarding_complete: boolean
  portal_token: string
  last_portal_login: string | null
  upsell_sent: boolean
  ref_code: string | null
  created_at: string
}

export interface Proposal {
  id: string
  client_name: string
  company: string
  niche: string
  pain_points: string
  tier: Tier
  content_html: string | null
  status: ProposalStatus
  first_viewed_at: string | null
  view_count: number
  stripe_checkout_url: string | null
  decline_reason: string | null
  created_at: string
}

export interface EmailSequence {
  id: string
  lead_id: string
  step: 1 | 2 | 3 | 4
  subject: string
  body: string
  sent_at: string | null
  opened_at: string | null
  clicked_at: string | null
  replied: boolean
  bounced: boolean
  unsubscribed: boolean
  created_at: string
}

export interface Report {
  id: string
  client_id: string
  week_of: string
  content: string
  sent_at: string | null
  opened_at: string | null
  created_at: string
}

export interface Testimonial {
  id: string
  client_id: string | null
  token: string
  rating: number | null
  quote: string | null
  author_name: string | null
  author_title: string | null
  published: boolean
  created_at: string
}

export interface CaseStudy {
  id: string
  client_id: string | null
  title: string
  challenge: string
  solution: string
  results: string
  quote: string | null
  slug: string
  published: boolean
  created_at: string
}

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  niche: string | null
  meta_description: string | null
  published: boolean
  published_at: string | null
  created_at: string
}

export interface Affiliate {
  id: string
  name: string
  email: string
  ref_code: string
  commission_rate: number
  total_earned: number
  created_at: string
}

export interface Referral {
  id: string
  affiliate_id: string | null
  client_id: string | null
  converted: boolean
  commission_amount: number
  paid: boolean
  created_at: string
}

// Supabase Database type for createClient
export interface Database {
  public: {
    Tables: {
      leads: { Row: Lead; Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Lead> }
      clients: { Row: Client; Insert: Omit<Client, 'id' | 'created_at' | 'portal_token'>; Update: Partial<Client> }
      proposals: { Row: Proposal; Insert: Omit<Proposal, 'id' | 'created_at'>; Update: Partial<Proposal> }
      email_sequences: { Row: EmailSequence; Insert: Omit<EmailSequence, 'id' | 'created_at'>; Update: Partial<EmailSequence> }
      reports: { Row: Report; Insert: Omit<Report, 'id' | 'created_at'>; Update: Partial<Report> }
      testimonials: { Row: Testimonial; Insert: Omit<Testimonial, 'id' | 'created_at' | 'token'>; Update: Partial<Testimonial> }
      case_studies: { Row: CaseStudy; Insert: Omit<CaseStudy, 'id' | 'created_at'>; Update: Partial<CaseStudy> }
      posts: { Row: Post; Insert: Omit<Post, 'id' | 'created_at'>; Update: Partial<Post> }
      affiliates: { Row: Affiliate; Insert: Omit<Affiliate, 'id' | 'created_at'>; Update: Partial<Affiliate> }
      referrals: { Row: Referral; Insert: Omit<Referral, 'id' | 'created_at'>; Update: Partial<Referral> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
