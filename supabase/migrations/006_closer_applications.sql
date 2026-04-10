-- Closer job applications
-- Submitted via /jobs/closer, auto-qualified by Claude, auto-onboarded if approved

CREATE TABLE IF NOT EXISTS closer_applications (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text NOT NULL,
  email         text NOT NULL,
  experience    text NOT NULL,   -- their sales background
  why_them      text NOT NULL,   -- why they want the role
  linkedin_url  text,
  status        text NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  claude_score  integer,         -- 1-10 score from Claude evaluation
  claude_notes  text,            -- Claude's reasoning
  closer_id     uuid REFERENCES closers(id),  -- set when approved + added as closer
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_closer_applications_status ON closer_applications (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_closer_applications_email  ON closer_applications (email);
