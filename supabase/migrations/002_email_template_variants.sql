-- Email template variants — stores AI-optimized email templates
-- Created by: template-optimizer.ts (runs weekly, Sunday 10am PST)
-- Used by: outreach.ts (checked before falling back to static templates)

CREATE TABLE IF NOT EXISTS email_template_variants (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  step        integer NOT NULL,           -- 1-5 (matches sequence step)
  niche       text NOT NULL DEFAULT 'all', -- specific niche or 'all' for any niche
  subject     text NOT NULL,
  body        text NOT NULL,              -- uses {{placeholders}} for dynamic content
  is_active   boolean NOT NULL DEFAULT true,

  -- Performance snapshot at time of creation (for auditing improvement over time)
  open_rate_at_creation  float,
  reply_rate_at_creation float,
  sends       integer DEFAULT 0,          -- incremented by outreach script (optional)

  created_at  timestamp with time zone DEFAULT now()
);

-- Fast lookup by outreach script: step + niche + is_active
CREATE INDEX IF NOT EXISTS idx_template_variants_lookup
  ON email_template_variants (step, niche, is_active);

-- Only one active variant per step × niche at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_template_variants_active_unique
  ON email_template_variants (step, niche)
  WHERE is_active = true;
