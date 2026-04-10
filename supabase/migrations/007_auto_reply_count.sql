-- Track how many times the system has auto-replied to a lead's inbound email
-- Used to cap auto-replies at 3 before escalating to owner
ALTER TABLE leads ADD COLUMN IF NOT EXISTS auto_reply_count integer NOT NULL DEFAULT 0;
