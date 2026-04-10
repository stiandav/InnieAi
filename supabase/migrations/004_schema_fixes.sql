-- Fix email_sequences step constraint: allow step 5 for re-engagement emails
ALTER TABLE email_sequences DROP CONSTRAINT IF EXISTS email_sequences_step_check;
ALTER TABLE email_sequences ADD CONSTRAINT email_sequences_step_check CHECK (step BETWEEN 1 AND 5);

-- Add Resend message ID for bounce/complaint webhook matching
ALTER TABLE email_sequences ADD COLUMN IF NOT EXISTS resend_id text;
CREATE INDEX IF NOT EXISTS idx_email_sequences_resend_id
  ON email_sequences (resend_id) WHERE resend_id IS NOT NULL;

-- Add re_engaged flag to leads (used by re-engagement.ts)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS re_engaged boolean NOT NULL DEFAULT false;

-- Add notes to clients (used by onboarding form to save questionnaire answers)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes text;

-- Add 'Pending Payment' to proposals status (set by accept endpoint while awaiting Stripe)
-- PostgreSQL enforces this via application logic, not enum — no ALTER needed.
-- ProposalStatus enum lives in TypeScript only; the DB column is text.
