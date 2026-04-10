export type LeadStatus =
  | 'Lead'
  | 'Contacted'
  | 'Replied'
  | 'Proposal Sent'
  | 'Closed Won'
  | 'Active Client'
  | 'Churned'
  | 'Invalid'

export type ClientStatus = 'Onboarding' | 'Active' | 'Payment Issue' | 'Churned'

export type ProposalStatus = 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Declined' | 'Pending Payment'

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
  re_engaged: boolean
  auto_reply_count: number
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
  upsell_sent_at: string | null
  ref_code: string | null
  notes: string | null
  created_at: string
}

export interface Proposal {
  id: string
  client_name: string
  client_email: string | null
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
  follow_up_sent_at: string | null
  closer_id: string | null
  created_at: string
}

export interface EmailSequence {
  id: string
  lead_id: string
  step: 1 | 2 | 3 | 4 | 5
  subject: string
  body: string
  sent_at: string | null
  opened_at: string | null
  clicked_at: string | null
  replied: boolean
  bounced: boolean
  unsubscribed: boolean
  resend_id: string | null
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

export interface SupportTicket {
  id: string
  client_id: string
  message: string
  status: 'open' | 'resolved'
  resolved_at: string | null
  created_at: string
}

export interface Closer {
  id: string
  name: string
  email: string
  commission_pct: number
  is_active: boolean
  calls_assigned: number
  created_at: string
}

type TableDef<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

// Supabase Database type for createClient
export interface Database {
  public: {
    Tables: {
      leads: TableDef<Lead, Omit<Lead, 'id' | 'created_at' | 'updated_at'>, Partial<Lead>>
      clients: TableDef<Client, Omit<Client, 'id' | 'created_at' | 'portal_token'>, Partial<Client>>
      proposals: TableDef<Proposal, Omit<Proposal, 'id' | 'created_at'>, Partial<Proposal>>
      email_sequences: TableDef<EmailSequence, Omit<EmailSequence, 'id' | 'created_at'>, Partial<EmailSequence>>
      reports: TableDef<Report, Omit<Report, 'id' | 'created_at'>, Partial<Report>>
      testimonials: TableDef<Testimonial, Omit<Testimonial, 'id' | 'created_at' | 'token'>, Partial<Testimonial>>
      case_studies: TableDef<CaseStudy, Omit<CaseStudy, 'id' | 'created_at'>, Partial<CaseStudy>>
      posts: TableDef<Post, Omit<Post, 'id' | 'created_at'>, Partial<Post>>
      affiliates: TableDef<Affiliate, Omit<Affiliate, 'id' | 'created_at'>, Partial<Affiliate>>
      referrals: TableDef<Referral, Omit<Referral, 'id' | 'created_at'>, Partial<Referral>>
      support_tickets: TableDef<SupportTicket, Omit<SupportTicket, 'id' | 'created_at'>, Partial<SupportTicket>>
      closers: TableDef<Closer, Omit<Closer, 'id' | 'created_at'>, Partial<Closer>>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
