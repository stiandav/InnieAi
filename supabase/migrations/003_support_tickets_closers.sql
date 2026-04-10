-- Support tickets from client portal
-- Used by: /api/portal/support (stores + emails owner)
-- Admin view: /admin/support

CREATE TABLE IF NOT EXISTS support_tickets (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id   uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  message     text NOT NULL,
  status      text NOT NULL DEFAULT 'open',  -- 'open' | 'resolved'
  resolved_at timestamptz,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_client
  ON support_tickets (client_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_open
  ON support_tickets (status, created_at DESC);

-- Freelance closers for auto-assignment of inbound sales calls
-- Assigned round-robin when a cal.com booking webhook fires
-- Admin view: /admin/closers

CREATE TABLE IF NOT EXISTS closers (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name            text NOT NULL,
  email           text NOT NULL UNIQUE,
  commission_pct  integer NOT NULL DEFAULT 20,  -- % of setup fee paid on close
  is_active       boolean NOT NULL DEFAULT true,
  calls_assigned  integer NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- Proposals: add missing columns used by proposal-followup.ts
ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS client_email      text,
  ADD COLUMN IF NOT EXISTS follow_up_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS closer_id         uuid REFERENCES closers(id);
