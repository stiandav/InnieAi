-- Fix status constraints to match what the application code actually uses

-- Add 'Replied' to leads status (used by inbound reply webhook)
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('Lead','Contacted','Replied','Proposal Sent','Closed Won','Active Client','Churned','Invalid'));

-- Add 'Pending Payment' to proposals status (used by proposals accept route)
ALTER TABLE proposals DROP CONSTRAINT IF EXISTS proposals_status_check;
ALTER TABLE proposals ADD CONSTRAINT proposals_status_check
  CHECK (status IN ('Draft','Sent','Viewed','Accepted','Declined','Pending Payment'));
