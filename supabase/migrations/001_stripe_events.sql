-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/fiyjhzfaysnrevpltzjh/sql
CREATE TABLE IF NOT EXISTS stripe_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);
