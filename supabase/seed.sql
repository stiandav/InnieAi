-- ============================================================
-- InnieAI Seed Data
-- Populates the admin dashboard with realistic demo data
-- Run AFTER schema.sql
-- ============================================================

-- LEADS
insert into leads (company_name, contact_name, email, phone, website, city, niche, rating, review_count, score, status, sequence_step, notes) values
('Bright Smile Dental', 'Dr. Sarah Chen', 'sarah@brightsmile.com', '619-555-0101', 'https://brightsmile.com', 'San Diego', 'dental', 3.8, 12, 8, 'Contacted', 1, 'Opened first email, no reply yet'),
('Desert Fitness Club', 'Mike Torres', 'mike@desertfitness.com', '602-555-0102', null, 'Phoenix', 'gym', 3.5, 8, 9, 'Lead', 0, 'No website — high pain signal'),
('Luxe MedSpa', 'Jessica Park', 'jessica@luxemedspa.com', '702-555-0103', 'https://luxemedspa.com', 'Las Vegas', 'medspa', 4.1, 31, 6, 'Proposal Sent', 2, 'Viewed proposal twice, follow up needed'),
('Rocky Mountain Contractors', 'Bob Walsh', 'bob@rmcontractors.com', '303-555-0104', 'https://rmcontractors.com', 'Denver', 'contractor', 3.9, 18, 7, 'Contacted', 1, null),
('Prestige Real Estate', 'Amanda Liu', 'amanda@prestigere.com', '310-555-0105', 'https://prestigere.com', 'Los Angeles', 'real-estate', 4.0, 22, 6, 'Lead', 0, null),
('Sunset Law Group', 'David Kowalski', 'david@sunsetlaw.com', '619-555-0106', null, 'San Diego', 'law', 3.6, 9, 9, 'Lead', 0, 'No website, low reviews — perfect fit'),
('Core Strength Gym', 'Rachel Martinez', 'rachel@corestrength.com', '702-555-0107', 'https://corestrength.com', 'Las Vegas', 'gym', 4.2, 15, 7, 'Contacted', 1, null),
('Advanced Dental Care', 'Dr. James Patel', 'james@advanceddental.com', '602-555-0108', 'https://advanceddental.com', 'Phoenix', 'dental', 3.7, 7, 8, 'Lead', 0, null),
('LA Skin Studios', 'Monica Reed', 'monica@laskin.com', '310-555-0109', 'https://laskin.com', 'Los Angeles', 'medspa', 3.9, 19, 7, 'Lead', 0, null),
('Peak Performance Fitness', 'Tyler Brooks', null, '303-555-0110', null, 'Denver', 'gym', 3.4, 5, 9, 'Lead', 0, 'No email, no website — call first'),
('Millennium Dental', 'Dr. Lisa Wong', 'lisa@millenniumdental.com', '619-555-0111', 'https://millenniumdental.com', 'San Diego', 'dental', 4.3, 28, 5, 'Closed Won', 3, 'Accepted proposal, awaiting setup fee'),
('Southwest Builders', 'Carlos Diaz', 'carlos@swbuilders.com', '602-555-0112', 'https://swbuilders.com', 'Phoenix', 'contractor', 4.0, 35, 5, 'Lead', 0, null);

-- CLIENTS
insert into clients (name, email, company, niche, tier, mrr, setup_fee, status, churn_score, onboarding_complete, created_at) values
('Jennifer Walsh', 'jennifer@renewmedspa.com', 'Renew MedSpa', 'medspa', 'Growth', 2500, 2000, 'Active', 2, true, now() - interval '75 days'),
('Marcus Johnson', 'marcus@elitedental.com', 'Elite Dental Group', 'dental', 'Scale', 4000, 2500, 'Active', 1, true, now() - interval '120 days'),
('Tanya Rodriguez', 'tanya@fitnessforward.com', 'Fitness Forward', 'gym', 'Starter', 1500, 1500, 'Active', 3, true, now() - interval '62 days'),
('Steven Park', 'steven@parklaw.com', 'Park & Associates Law', 'law', 'Growth', 2500, 2000, 'Active', 1, true, now() - interval '90 days'),
('Nicole Chen', 'nicole@chenrealty.com', 'Chen Realty Group', 'real-estate', 'Starter', 1500, 1500, 'Onboarding', 0, false, now() - interval '3 days');

-- PROPOSALS
insert into proposals (client_name, company, niche, pain_points, tier, content_html, status, view_count, created_at) values
('Dr. Kevin Hart', 'Hart Family Dental', 'dental', 'Losing patients to competitors, no online review strategy, manual follow-up process', 'Growth', '<h1>Proposal for Hart Family Dental</h1><p>InnieAI will automate your patient acquisition and retention...</p>', 'Viewed', 3, now() - interval '2 days'),
('Sandra Williams', 'Williams MedSpa', 'medspa', 'No lead generation system, spending $3k/mo on ads with poor ROI', 'Scale', '<h1>Proposal for Williams MedSpa</h1><p>InnieAI will replace your ad spend with automated lead generation...</p>', 'Sent', 1, now() - interval '5 days'),
('James Cooper', 'Cooper Contracting', 'contractor', 'Missing follow-up calls, losing bids to competitors who respond faster', 'Starter', '<h1>Proposal for Cooper Contracting</h1><p>InnieAI will ensure you are always first to respond...</p>', 'Declined', 0, now() - interval '10 days');

-- POSTS (Blog)
insert into posts (title, slug, content, niche, meta_description, published, published_at) values
('How AI Automation Is Transforming Dental Practices in 2025', 'ai-automation-dental-practices-2025', '<h1>How AI Automation Is Transforming Dental Practices in 2025</h1><p>The dental industry is experiencing a quiet revolution. While most practices are still relying on front desk staff to manually follow up with patients, a growing number of forward-thinking dentists are turning to AI automation to run their patient acquisition and retention on autopilot...</p>', 'dental', 'Discover how AI automation tools are helping dental practices generate more patients, collect reviews, and reduce no-shows — without hiring additional staff.', true, now() - interval '3 days'),
('The Real Cost of Slow Follow-Up for Med Spas', 'real-cost-slow-followup-medspa', '<h1>The Real Cost of Slow Follow-Up for Med Spas</h1><p>A potential client visits your website, fills out a contact form, and waits. And waits. By the time your front desk gets around to calling, they have already booked with your competitor down the street...</p>', 'medspa', 'Med spas lose 50% of leads within 24 hours due to slow follow-up. Learn how AI automation changes this.', true, now() - interval '7 days'),
('Why Gyms Are Losing Members They Already Have', 'gyms-losing-members-retention', '<h1>Why Gyms Are Losing Members They Already Have</h1><p>The gym industry has an obsession with new member acquisition. But the data tells a different story: the average gym loses 50% of its members every year, and the cost to replace them is 5x higher than keeping them...</p>', 'gym', 'Gym member retention is the biggest revenue opportunity most owners overlook. AI automation changes the math.', true, now() - interval '14 days');

-- TESTIMONIALS
insert into testimonials (rating, quote, author_name, author_title, published) values
(5, 'InnieAI completely transformed our patient acquisition. We went from 8 new patients a month to 31, without any extra ad spend. The automation just runs — I barely think about marketing anymore.', 'Dr. Marcus Johnson', 'Owner, Elite Dental Group', true),
(5, 'I was skeptical at first. Now I get a weekly report every Monday telling me exactly how the business is doing. InnieAI is like having a full-time operations manager for a fraction of the cost.', 'Jennifer Walsh', 'Owner, Renew MedSpa', true),
(5, 'The follow-up sequences alone paid for the entire investment. We were losing 60% of our leads to slow response times. Now every lead gets a personalized message within minutes.', 'Tanya Rodriguez', 'Owner, Fitness Forward', true),
(5, 'Our Google reviews went from 22 to 89 in four months. That kind of social proof changes everything for a law firm.', 'Steven Park', 'Partner, Park & Associates Law', true);

-- AFFILIATES
insert into affiliates (name, email, ref_code, commission_rate, total_earned) values
('Chris Dawson', 'chris@marketingwithchris.com', 'CHRIS15', 15.00, 375000),
('Digital Agency Co', 'hello@digitalagencyco.com', 'DAC15', 15.00, 150000);
