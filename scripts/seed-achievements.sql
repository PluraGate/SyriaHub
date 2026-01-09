-- Re-seed achievements for the Gamification system
-- Run this script in Supabase SQL Editor if achievements are empty after database clear
-- This is a standalone script that mirrors the migration data

-- First verify the table exists and check if data exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'achievements') THEN
    RAISE NOTICE 'Achievements table exists';
  ELSE
    RAISE EXCEPTION 'Achievements table does not exist! Run migrations first.';
  END IF;
END $$;

-- Delete existing achievements and re-insert (use with caution!)
-- Uncomment the line below if you want to replace all achievements
-- DELETE FROM achievements;

-- Insert achievements with upsert logic
INSERT INTO achievements (name, description, icon, category, criteria, xp_reward, is_hidden) VALUES
  -- Contribution achievements
  ('First Steps', 'Create your first post', 'footprints', 'contribution', '{"type": "post_count", "threshold": 1}', 25, false),
  ('Prolific Writer', 'Create 10 posts', 'pen-tool', 'contribution', '{"type": "post_count", "threshold": 10}', 100, false),
  ('Author Extraordinaire', 'Create 50 posts', 'book-open', 'contribution', '{"type": "post_count", "threshold": 50}', 500, false),
  ('Thought Leader', 'Create 100 posts', 'lightbulb', 'contribution', '{"type": "post_count", "threshold": 100}', 1000, false),
  
  -- Community achievements
  ('Helpful Hand', 'Have 5 answers accepted as solutions', 'hand-helping', 'community', '{"type": "solution_count", "threshold": 5}', 150, false),
  ('Community Pillar', 'Have 25 answers accepted as solutions', 'award', 'community', '{"type": "solution_count", "threshold": 25}', 500, false),
  ('Solution Master', 'Have 100 answers accepted as solutions', 'trophy', 'community', '{"type": "solution_count", "threshold": 100}', 2000, false),
  ('Discussion Starter', 'Start 10 discussions with 5+ replies', 'message-circle', 'community', '{"type": "discussions_started", "threshold": 10}', 150, false),
  ('Team Player', 'Join 3 groups', 'users', 'community', '{"type": "groups_joined", "threshold": 3}', 75, false),
  
  -- Expertise achievements
  ('Rising Star', 'Reach 100 reputation points', 'star', 'expertise', '{"type": "reputation_score", "threshold": 100}', 50, false),
  ('Expert', 'Reach 500 reputation points', 'medal', 'expertise', '{"type": "reputation_score", "threshold": 500}', 200, false),
  ('Master', 'Reach 2000 reputation points', 'crown', 'expertise', '{"type": "reputation_score", "threshold": 2000}', 750, false),
  ('Popular Voice', 'Get 100 total upvotes on your content', 'thumbs-up', 'expertise', '{"type": "total_upvotes", "threshold": 100}', 150, false),
  ('Influencer', 'Get 500 total upvotes on your content', 'trending-up', 'expertise', '{"type": "total_upvotes", "threshold": 500}', 500, false),
  
  -- Engagement/Special achievements  
  ('Consistent Contributor', '7-day login streak', 'flame', 'special', '{"type": "login_streak", "threshold": 7}', 100, false),
  ('Dedicated Member', '30-day login streak', 'zap', 'special', '{"type": "login_streak", "threshold": 30}', 500, false),
  ('Survey Master', 'Complete 10 surveys', 'clipboard-check', 'special', '{"type": "surveys_completed", "threshold": 10}', 100, false),
  ('Profile Pro', 'Complete your profile 100%', 'user-check', 'special', '{"type": "profile_complete", "threshold": 100}', 50, false),
  ('Early Adopter', 'Joined during beta phase', 'rocket', 'special', '{"type": "early_adopter"}', 200, false),
  ('Inviter', 'Successfully invite 5 new members', 'user-plus', 'special', '{"type": "invites_used", "threshold": 5}', 150, false)
ON CONFLICT (name) DO UPDATE 
SET 
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  criteria = EXCLUDED.criteria,
  xp_reward = EXCLUDED.xp_reward,
  is_hidden = EXCLUDED.is_hidden;

-- Verify the achievements were inserted
SELECT 
  name, 
  category, 
  xp_reward, 
  COALESCE((criteria->>'threshold')::text, 'N/A') as threshold
FROM achievements 
ORDER BY category, xp_reward;

-- Show count
SELECT COUNT(*) as total_achievements FROM achievements;
