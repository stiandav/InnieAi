# InnieAI

> Your business runs. You don't have to.

InnieAI is a fully automated AI agency platform. It generates leads, sends personalized email sequences, manages client onboarding, collects testimonials, publishes blog content, and emails weekly performance reports — all without manual work.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    INNIEAI PLATFORM                     │
├──────────────┬──────────────────┬──────────────────────┤
│   Marketing  │  Admin Dashboard │   Client Portal      │
│   Website    │  /admin          │   /portal/[id]       │
│   /          │                  │                      │
├──────────────┴──────────────────┴──────────────────────┤
│                   Next.js 14 App Router                 │
│                   TypeScript + Tailwind                 │
├─────────────────────────────────────────────────────────┤
│  Supabase DB  │  Stripe  │  Resend  │  Anthropic Claude │
├─────────────────────────────────────────────────────────┤
│              GitHub Actions (7 cron jobs)               │
│  lead-gen · outreach · churn · upsell · reports · blog  │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/yourusername/innieai.git
cd innieai
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in all values. See the **Environment Variables** section below.

### 3. Set up the database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run `supabase/schema.sql` (creates all tables + RLS policies)
4. Run `supabase/seed.sql` (populates demo data)

### 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000/setup` to verify all services are connected.

---

## Environment Variables

| Variable | Where to Find It |
|----------|-----------------|
| `SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_KEY` | Supabase Dashboard → Project Settings → API |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |
| `RESEND_FROM_EMAIL` | Your verified sending domain email |
| `RESEND_DOMAIN` | Your verified domain in Resend |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks |
| `STRIPE_*_PRICE_ID` | Create products/prices in Stripe Dashboard (see below) |
| `GOOGLE_PLACES_API_KEY` | Google Cloud Console → APIs → Places API |
| `OWNER_EMAIL` | Your email address (receives all alerts + reports) |
| `NEXT_PUBLIC_BASE_URL` | Your production URL (e.g., `https://innieai.co`) |
| `CALCOM_LINK` | Your Cal.com booking URL |

### Stripe Setup

Create 6 prices in Stripe Dashboard (Products → Add Product):

| Product | Price | Type |
|---------|-------|------|
| InnieAI Starter — Setup | $1,500 | One-time |
| InnieAI Starter — Monthly | $1,500 | Recurring (monthly) |
| InnieAI Growth — Setup | $2,000 | One-time |
| InnieAI Growth — Monthly | $2,500 | Recurring (monthly) |
| InnieAI Scale — Setup | $2,500 | One-time |
| InnieAI Scale — Monthly | $4,000 | Recurring (monthly) |

Copy each Price ID (starts with `price_`) into your `.env`.

---

## How Each Automation Works

### Lead Generation (`scripts/lead-gen.ts`)
- **Schedule**: Daily at 7am PST via `daily-lead-gen.yml`
- **What it does**: Searches Google Places API for businesses in `TARGET_NICHES` × `TARGET_CITIES`. Scores each lead 1-10 based on rating, review count, and website presence. Deduplicates by phone and name. Saves to Supabase `leads` table.
- **To customize**: Edit `TARGET_NICHES` and `TARGET_CITIES` at the top of the script.

### Email Outreach (`scripts/outreach.ts`)
- **Schedule**: Daily at 9am PST via `daily-outreach.yml`
- **What it does**: Sends up to 40 emails/day across a 4-touch sequence (Day 1, 3, 7, 14). Each email is personalized by Claude using the business's name, niche, and Google data. Tracks opens via 1px pixel. Removes unsubscribes automatically.
- **To customize**: Edit `MAX_EMAILS_PER_DAY` in the script. Edit email templates in `src/lib/email-templates/outreach/`.

### Churn Prevention (`scripts/churn-check.ts`)
- **Schedule**: Daily at 6am PST via `churn-check.yml`
- **What it does**: Calculates churn score for each active client based on portal login recency, payment history, and report open rates. Sends a personal Claude-written email to clients scoring 7+. Alerts owner for scores 9+.

### Upsell Automation (`scripts/upsell-check.ts`)
- **Schedule**: Daily at 10am PST via `upsell-check.yml`
- **What it does**: Finds Starter clients who have been active for 60+ days with a churn score below 4. Sends one personalized upsell email (never repeats). Notifies owner if accepted.

### Weekly Reports (`scripts/weekly-reports.ts`)
- **Schedule**: Monday at 8am PST via `weekly-reports.yml`
- **What it does**: For each active client: fetches their week's data, generates a 400-word AI report with Claude, saves to database, and emails to client. Also sends an owner summary with MRR, churn risks, and upsell opportunities.

### Blog Publisher (`scripts/blog-publisher.ts`)
- **Schedule**: Tuesday + Friday at 7am PST via `blog-publisher.yml`
- **What it does**: Claude generates an 800-word SEO blog post targeting AI automation keywords for a rotating niche. Auto-publishes to `/blog/[slug]` via Supabase.

### Health Check (`.github/workflows/health-check.yml`)
- **Schedule**: Every 6 hours
- **What it does**: Pings the site. Sends an email alert to the owner if it returns a non-200 status.

---

## How to Manually Add a Client

1. Go to `/admin/clients`
2. Insert directly into Supabase:
   ```sql
   INSERT INTO clients (name, email, company, niche, tier, mrr, setup_fee, status)
   VALUES ('John Smith', 'john@company.com', 'Smith Dental', 'dental', 'Growth', 250000, 200000, 'Onboarding');
   ```
3. The `portal_token` is auto-generated. Copy it from Supabase to send the client their portal link: `/portal/[client-id]`

---

## How to Add a New Target City or Niche

**New city**: Open `scripts/lead-gen.ts` and add to the `TARGET_CITIES` array:
```typescript
const TARGET_CITIES = [
  'San Diego, CA',
  'Houston, TX', // add new city here
  ...
]
```

**New niche**: Add to `TARGET_NICHES`:
```typescript
const TARGET_NICHES = [
  { query: 'veterinary clinic', tag: 'vet' }, // add new niche here
  ...
]
```

---

## How to Edit Email Templates

1. Go to `/admin/email-templates` in the admin dashboard to edit via the UI, OR
2. Edit the files directly:
   - `src/lib/email-templates/outreach/day1.ts` — Day 1 intro email
   - `src/lib/email-templates/outreach/day3.ts` — Day 3 value email
   - `src/lib/email-templates/outreach/day7.ts` — Day 7 social proof
   - `src/lib/email-templates/outreach/day14.ts` — Day 14 breakup

Available template variables: `{{company_name}}`, `{{contact_name}}`, `{{city}}`, `{{niche}}`, `{{calcom_link}}`

---

## Deploy to Vercel

1. Push your code to GitHub (see next section)
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. In the Vercel project settings, add all environment variables from your `.env` file
4. Deploy

**Stripe webhook**: After deploying, create a webhook in Stripe Dashboard pointing to:
```
https://yourdomain.com/api/webhooks/stripe
```
Subscribe to: `checkout.session.completed`, `invoice.payment_failed`, `invoice.payment_succeeded`, `customer.subscription.deleted`

---

## Setting GitHub Secrets

For the cron jobs to run, add every variable from your `.env` as a GitHub Secret:

1. Go to your GitHub repo → Settings → Secrets and Variables → Actions
2. Click **New repository secret** for each variable
3. The secret names must exactly match the variable names in `.env`

---

## Troubleshooting

**Setup page shows red for Supabase**: Check that `SUPABASE_URL` includes `https://` and that the service key starts with `eyJ`.

**Emails not sending**: Verify your domain DNS records in Resend. Check that `RESEND_FROM_EMAIL` matches your verified domain.

**Stripe webhooks failing**: Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` locally to test. The webhook secret changes between local testing and production.

**Lead gen script finds nothing**: Check your `GOOGLE_PLACES_API_KEY` is enabled for Places API (New) in Google Cloud Console.

**Scripts fail in GitHub Actions**: Check that all secrets are set correctly. View the Action logs for the specific error.

---

## Email Warmup Instructions

Before running the outreach script at full volume:

1. **Week 1**: Set `MAX_EMAILS_PER_DAY = 5` in `scripts/outreach.ts`
2. **Week 2**: Increase to 10/day
3. **Week 3**: Increase to 20/day
4. **Week 4+**: Full 40/day

This prevents your domain from being flagged as spam. Also:
- Use a subdomain for outreach (e.g., `outreach.yourdomain.com`)
- Monitor bounce rates in Resend — pause if >5%
- Ensure SPF, DKIM, and DMARC DNS records are set correctly in Resend
