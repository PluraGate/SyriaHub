-- Fix missing badges table and rename to Epistemic/Knowledge focus
-- Migration: 20260103210000_epistemic_gamification_update.sql

-- 1. Ensure tables exist (fix for potential missing migration)
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT NOT NULL, -- using simpler icon names like 'star', 'trophy'
  criteria JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Policies for badges (Public read)
DO $$ BEGIN
  CREATE POLICY "Public read badges" ON badges FOR SELECT USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Policies for user_badges (Public read)
DO $$ BEGIN
  CREATE POLICY "Public read user_badges" ON user_badges FOR SELECT USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- 2. Update Badge Names to Epistemic Terms
-- We use upsert-like logic or direct updates

-- Update "First Step" -> "First Inquiry"
UPDATE badges 
SET name = 'First Inquiry', 
    description = 'Contributed your first piece of knowledge' 
WHERE name = 'First Step';

-- Update "Regular Contributor" -> "Knowledge Builder"
UPDATE badges 
SET name = 'Knowledge Builder', 
    description = 'Contributed 10 pieces of knowledge to the commons' 
WHERE name = 'Regular Contributor';

-- Update "Problem Solver" -> "Insight Provider"
UPDATE badges 
SET name = 'Insight Provider', 
    description = 'Provided 5 accepted insights or solutions' 
WHERE name = 'Problem Solver';

-- Update "Expert" -> "Subject Matter Reference"
UPDATE badges 
SET name = 'Subject Matter Reference', 
    description = 'Accumulated 100 knowledge points from community peer review' 
WHERE name = 'Expert';

-- 3. Insert defaults if they don't exist (using new names)
INSERT INTO badges (name, description, icon_url, criteria) VALUES
  ('First Inquiry', 'Contributed your first piece of knowledge', 'footprints', '{"type": "post_count", "threshold": 1}'),
  ('Knowledge Builder', 'Contributed 10 pieces of knowledge to the commons', 'pen_tool', '{"type": "post_count", "threshold": 10}'),
  ('Insight Provider', 'Provided 5 accepted insights or solutions', 'check_circle', '{"type": "solution_count", "threshold": 5}'),
  ('Subject Matter Reference', 'Accumulated 100 knowledge points from community peer review', 'star', '{"type": "reputation_score", "threshold": 100}')
ON CONFLICT (name) DO UPDATE 
SET criteria = EXCLUDED.criteria,
    description = EXCLUDED.description;
