-- Add upsell_sent_at column (used by upsell-check.ts for 30-day retry logic)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS upsell_sent_at timestamptz;

-- Performance indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_clients_stripe_customer   ON clients(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_clients_status            ON clients(status);
CREATE INDEX IF NOT EXISTS idx_proposals_status          ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_email_sequences_lead_sent ON email_sequences(lead_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_leads_status_step         ON leads(status, sequence_step);
CREATE INDEX IF NOT EXISTS idx_leads_niche_status        ON leads(niche, status);
