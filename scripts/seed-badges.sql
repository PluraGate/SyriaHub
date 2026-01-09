-- Re-seed standard achievement badges
-- Run this script in Supabase SQL Editor to restore preset badges after database clear

-- First, ensure the badges table exists (it should from migrations)
-- If not, create it:
-- CREATE TABLE IF NOT EXISTS badges (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name TEXT UNIQUE NOT NULL,
--     description TEXT,
--     icon_url TEXT,
--     criteria JSONB,
--     created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- Insert standard badges with upsert logic
INSERT INTO badges (name, description, icon_url, criteria) VALUES
  ('First Step', 'Created your first post', 'footprints', '{"type": "post_count", "threshold": 1}'),
  ('Regular Contributor', 'Created 10 posts', 'pen_tool', '{"type": "post_count", "threshold": 10}'),
  ('Prolific Writer', 'Created 25 posts', 'book_open', '{"type": "post_count", "threshold": 25}'),
  ('Problem Solver', 'Had 5 answers accepted', 'check_circle', '{"type": "solution_count", "threshold": 5}'),
  ('Expert Responder', 'Had 15 answers accepted', 'award', '{"type": "solution_count", "threshold": 15}'),
  ('Rising Star', 'Reached 50 reputation points', 'trending_up', '{"type": "reputation_score", "threshold": 50}'),
  ('Expert', 'Reached 100 reputation points', 'star', '{"type": "reputation_score", "threshold": 100}'),
  ('Trusted Voice', 'Reached 500 reputation points', 'shield', '{"type": "reputation_score", "threshold": 500}'),
  ('Community Leader', 'Reached 1000 reputation points', 'crown', '{"type": "reputation_score", "threshold": 1000}')
ON CONFLICT (name) DO UPDATE 
SET criteria = EXCLUDED.criteria,
    description = EXCLUDED.description,
    icon_url = EXCLUDED.icon_url;

-- Verify the badges were inserted
SELECT id, name, description, icon_url, criteria FROM badges ORDER BY name;
