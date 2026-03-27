-- ============================================================
-- InnieAI Database Schema
-- Run this in Supabase SQL Editor to set up all tables
-- ============================================================

-- LEADS
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  website text,
  city text not null,
  niche text not null,
  rating numeric(3,1),
  review_count integer default 0,
  score integer default 0 check (score between 0 and 10),
  status text not null default 'Lead'
    check (status in ('Lead','Contacted','Proposal Sent','Closed Won','Active Client','Churned','Invalid')),
  source text default 'google_places',
  sequence_step integer default 0,
  notes text,
  competitive_flag boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists leads_status_idx on leads(status);
create index if not exists leads_niche_city_idx on leads(niche, city);
create unique index if not exists leads_dedup_phone_idx on leads(phone) where phone is not null;

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at_column();

-- CLIENTS
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  company text not null,
  niche text not null,
  tier text not null check (tier in ('Starter','Growth','Scale')),
  mrr integer not null,
  setup_fee integer not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'Onboarding'
    check (status in ('Onboarding','Active','Payment Issue','Churned')),
  churn_score integer default 0,
  onboarding_complete boolean default false,
  portal_token uuid default gen_random_uuid() unique,
  last_portal_login timestamptz,
  upsell_sent boolean default false,
  ref_code text,
  created_at timestamptz default now()
);

create index if not exists clients_status_idx on clients(status);
create index if not exists clients_churn_idx on clients(churn_score);

-- PROPOSALS
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  company text not null,
  niche text not null,
  pain_points text not null,
  tier text not null check (tier in ('Starter','Growth','Scale')),
  content_html text,
  status text not null default 'Draft'
    check (status in ('Draft','Sent','Viewed','Accepted','Declined')),
  first_viewed_at timestamptz,
  view_count integer default 0,
  stripe_checkout_url text,
  decline_reason text,
  created_at timestamptz default now()
);

-- EMAIL SEQUENCES
create table if not exists email_sequences (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  step integer not null check (step between 1 and 4),
  subject text not null,
  body text not null,
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  replied boolean default false,
  bounced boolean default false,
  unsubscribed boolean default false,
  created_at timestamptz default now()
);

create index if not exists email_seq_lead_idx on email_sequences(lead_id);
create index if not exists email_seq_step_idx on email_sequences(step, sent_at);

-- REPORTS
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  week_of date not null,
  content text not null,
  sent_at timestamptz,
  opened_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists reports_client_idx on reports(client_id, week_of);

-- TESTIMONIALS
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  token uuid default gen_random_uuid() unique,
  rating integer check (rating between 1 and 5),
  quote text,
  author_name text,
  author_title text,
  published boolean default false,
  created_at timestamptz default now()
);

-- CASE STUDIES
create table if not exists case_studies (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  title text not null,
  challenge text not null,
  solution text not null,
  results text not null,
  quote text,
  slug text unique not null,
  published boolean default false,
  created_at timestamptz default now()
);

-- POSTS (Blog)
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text not null,
  niche text,
  meta_description text,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists posts_published_idx on posts(published, published_at desc);

-- AFFILIATES
create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  ref_code text unique not null,
  commission_rate numeric(4,2) default 15.00,
  total_earned integer default 0,
  created_at timestamptz default now()
);

-- REFERRALS
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references affiliates(id),
  client_id uuid references clients(id),
  converted boolean default false,
  commission_amount integer default 0,
  paid boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table leads enable row level security;
alter table clients enable row level security;
alter table proposals enable row level security;
alter table email_sequences enable row level security;
alter table reports enable row level security;
alter table testimonials enable row level security;
alter table case_studies enable row level security;
alter table posts enable row level security;
alter table affiliates enable row level security;
alter table referrals enable row level security;

-- Public read for published content
create policy "Public can read published posts" on posts
  for select using (published = true);

create policy "Public can read published testimonials" on testimonials
  for select using (published = true);

create policy "Public can read published case_studies" on case_studies
  for select using (published = true);

-- Service role bypasses all RLS (used by server-side code + scripts)
-- No additional policies needed for server-side operations using service key
