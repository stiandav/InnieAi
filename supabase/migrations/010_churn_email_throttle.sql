-- Add churn_email_sent_at to clients so churn-check.ts can throttle emails (max once per 7 days)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS churn_email_sent_at timestamptz;
