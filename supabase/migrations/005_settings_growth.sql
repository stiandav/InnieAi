-- Key-value settings store — lets the growth engine change system behaviour
-- without touching code or GitHub secrets.
-- outreach.ts reads max_emails_per_day from here first.

CREATE TABLE IF NOT EXISTS settings (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Seed defaults
INSERT INTO settings (key, value) VALUES
  ('max_emails_per_day', '10'),
  ('email_warmup_active', 'true'),
  ('base_niches',  'dental,medspa,gym,contractor,real-estate,law'),
  ('base_cities',  'San Diego CA,Los Angeles CA,Phoenix AZ,Las Vegas NV,Denver CO')
ON CONFLICT (key) DO NOTHING;

-- Autonomous growth decision log
-- Every action the growth engine takes is recorded here for auditing.

CREATE TABLE IF NOT EXISTS growth_decisions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action      text NOT NULL,   -- 'scale_email_volume' | 'add_niche' | 'add_city' | 'hire_closer' | etc.
  reason      text NOT NULL,   -- human-readable why
  data        jsonb,           -- before/after values, amounts, job posts, etc.
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_growth_decisions_created ON growth_decisions (created_at DESC);
