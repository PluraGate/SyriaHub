-- ============================================
-- GAMIFICATION SYSTEM - XP, LEVELS, ACHIEVEMENTS
-- ============================================

-- 1. Add XP and Level columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS xp_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS progress_visibility TEXT DEFAULT 'public' 
  CHECK (progress_visibility IN ('public', 'private'));

-- 2. Create user_levels table (level definitions)
CREATE TABLE IF NOT EXISTS user_levels (
  level INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  xp_required INTEGER NOT NULL,
  perks TEXT[],  -- Array of perks unlocked at this level
  color TEXT NOT NULL  -- CSS color class for the tier
);

-- 3. Create achievements table (expanded from badges)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,  -- Lucide icon name
  category TEXT NOT NULL CHECK (category IN ('contribution', 'community', 'expertise', 'special')),
  criteria JSONB NOT NULL,  -- Criteria for unlocking
  xp_reward INTEGER DEFAULT 0,  -- XP earned when unlocked
  is_hidden BOOLEAN DEFAULT false,  -- Hidden until unlocked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  progress JSONB DEFAULT '{}'::jsonb,  -- For partial progress tracking
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS user_achievements_unlocked_at_idx ON user_achievements(unlocked_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- User levels - anyone can view
CREATE POLICY "Anyone can view user levels" ON user_levels FOR SELECT USING (true);

-- Achievements - anyone can view
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Only admins can manage achievements" ON achievements FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- User achievements - users can view their own, admins can view all, public for public profiles
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all achievements" ON user_achievements FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "Public can view if progress visibility is public" ON user_achievements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_achievements.user_id 
      AND users.progress_visibility = 'public'
    )
  );

-- ============================================
-- SEED LEVEL DATA
-- ============================================

INSERT INTO user_levels (level, name, tier, xp_required, perks, color) VALUES
  -- Bronze Tier (1-10)
  (1, 'Newcomer', 'bronze', 0, ARRAY['Basic profile'], 'bg-amber-700'),
  (2, 'Explorer', 'bronze', 100, ARRAY['Can comment'], 'bg-amber-700'),
  (3, 'Learner', 'bronze', 250, ARRAY['Extended bio'], 'bg-amber-700'),
  (4, 'Curious', 'bronze', 450, ARRAY['Custom avatar'], 'bg-amber-700'),
  (5, 'Engaged', 'bronze', 700, ARRAY['Profile banner'], 'bg-amber-700'),
  (6, 'Active', 'bronze', 1000, ARRAY['Featured tag'], 'bg-amber-600'),
  (7, 'Regular', 'bronze', 1350, ARRAY['Invite boost +1'], 'bg-amber-600'),
  (8, 'Dedicated', 'bronze', 1750, ARRAY['Early access'], 'bg-amber-600'),
  (9, 'Committed', 'bronze', 2200, ARRAY['Priority support'], 'bg-amber-600'),
  (10, 'Established', 'bronze', 2700, ARRAY['Bronze badge'], 'bg-amber-600'),
  
  -- Silver Tier (11-25)
  (11, 'Rising Star', 'silver', 3300, ARRAY['Silver frame'], 'bg-gray-400'),
  (12, 'Contributor', 'silver', 4000, ARRAY['Custom theme'], 'bg-gray-400'),
  (13, 'Influencer', 'silver', 4800, ARRAY['Highlight posts'], 'bg-gray-400'),
  (14, 'Mentor', 'silver', 5700, ARRAY['Mentorship badge'], 'bg-gray-400'),
  (15, 'Leader', 'silver', 6700, ARRAY['Create groups'], 'bg-gray-400'),
  (16, 'Expert', 'silver', 7800, ARRAY['Verified status'], 'bg-gray-400'),
  (17, 'Specialist', 'silver', 9000, ARRAY['Research tools'], 'bg-gray-400'),
  (18, 'Authority', 'silver', 10300, ARRAY['Featured profile'], 'bg-gray-400'),
  (19, 'Innovator', 'silver', 11700, ARRAY['Beta features'], 'bg-gray-400'),
  (20, 'Pioneer', 'silver', 13200, ARRAY['Silver badge'], 'bg-gray-400'),
  (21, 'Trailblazer', 'silver', 14800, ARRAY['Invite boost +2'], 'bg-gray-400'),
  (22, 'Veteran', 'silver', 16500, ARRAY['Custom flair'], 'bg-gray-400'),
  (23, 'Sage', 'silver', 18300, ARRAY['Sage title'], 'bg-gray-400'),
  (24, 'Guardian', 'silver', 20200, ARRAY['Guardian badge'], 'bg-gray-400'),
  (25, 'Champion', 'silver', 22200, ARRAY['Champion title'], 'bg-gray-400'),
  
  -- Gold Tier (26-40)
  (26, 'Gold Member', 'gold', 24300, ARRAY['Gold frame'], 'bg-yellow-500'),
  (27, 'Distinguished', 'gold', 26500, ARRAY['Profile spotlight'], 'bg-yellow-500'),
  (28, 'Renowned', 'gold', 28800, ARRAY['Featured content'], 'bg-yellow-500'),
  (29, 'Celebrated', 'gold', 31200, ARRAY['Celebration badge'], 'bg-yellow-500'),
  (30, 'Acclaimed', 'gold', 33700, ARRAY['Annual recap'], 'bg-yellow-500'),
  (31, 'Illustrious', 'gold', 36300, ARRAY['Invite boost +3'], 'bg-yellow-500'),
  (32, 'Prestigious', 'gold', 39000, ARRAY['VIP events'], 'bg-yellow-500'),
  (33, 'Eminent', 'gold', 41800, ARRAY['Custom emoji'], 'bg-yellow-500'),
  (34, 'Prominent', 'gold', 44700, ARRAY['Mod powers lite'], 'bg-yellow-500'),
  (35, 'Notable', 'gold', 47700, ARRAY['Gold badge'], 'bg-yellow-500'),
  (36, 'Esteemed', 'gold', 50800, ARRAY['Esteemed title'], 'bg-yellow-500'),
  (37, 'Honored', 'gold', 54000, ARRAY['Honor badge'], 'bg-yellow-500'),
  (38, 'Revered', 'gold', 57300, ARRAY['Revered frame'], 'bg-yellow-500'),
  (39, 'Exalted', 'gold', 60700, ARRAY['Exalted title'], 'bg-yellow-500'),
  (40, 'Legendary', 'gold', 64200, ARRAY['Legend status'], 'bg-yellow-500'),
  
  -- Platinum Tier (41-50)
  (41, 'Platinum Elite', 'platinum', 67800, ARRAY['Platinum frame'], 'bg-purple-500'),
  (42, 'Grandmaster', 'platinum', 71500, ARRAY['Grandmaster title'], 'bg-purple-500'),
  (43, 'Virtuoso', 'platinum', 75300, ARRAY['Virtuoso badge'], 'bg-purple-500'),
  (44, 'Luminary', 'platinum', 79200, ARRAY['Hall of fame'], 'bg-purple-500'),
  (45, 'Paragon', 'platinum', 83200, ARRAY['Paragon title'], 'bg-purple-500'),
  (46, 'Transcendent', 'platinum', 87300, ARRAY['Unique effects'], 'bg-purple-500'),
  (47, 'Mythical', 'platinum', 91500, ARRAY['Mythic frame'], 'bg-purple-500'),
  (48, 'Immortal', 'platinum', 95800, ARRAY['Immortal badge'], 'bg-purple-500'),
  (49, 'Eternal', 'platinum', 100200, ARRAY['Eternal flame'], 'bg-purple-500'),
  (50, 'Apex', 'platinum', 104700, ARRAY['Apex crown', 'All perks'], 'bg-purple-500')
ON CONFLICT (level) DO NOTHING;

-- ============================================
-- SEED ACHIEVEMENTS
-- ============================================

INSERT INTO achievements (name, description, icon, category, criteria, xp_reward) VALUES
  -- Contribution achievements
  ('First Steps', 'Create your first post', 'footprints', 'contribution', '{"type": "post_count", "threshold": 1}', 25),
  ('Prolific Writer', 'Create 10 posts', 'pen-tool', 'contribution', '{"type": "post_count", "threshold": 10}', 100),
  ('Author Extraordinaire', 'Create 50 posts', 'book-open', 'contribution', '{"type": "post_count", "threshold": 50}', 500),
  ('Thought Leader', 'Create 100 posts', 'lightbulb', 'contribution', '{"type": "post_count", "threshold": 100}', 1000),
  
  -- Community achievements
  ('Helpful Hand', 'Have 5 answers accepted as solutions', 'hand-helping', 'community', '{"type": "solution_count", "threshold": 5}', 150),
  ('Community Pillar', 'Have 25 answers accepted as solutions', 'award', 'community', '{"type": "solution_count", "threshold": 25}', 500),
  ('Solution Master', 'Have 100 answers accepted as solutions', 'trophy', 'community', '{"type": "solution_count", "threshold": 100}', 2000),
  ('Discussion Starter', 'Start 10 discussions with 5+ replies', 'message-circle', 'community', '{"type": "discussions_started", "threshold": 10}', 150),
  ('Team Player', 'Join 3 groups', 'users', 'community', '{"type": "groups_joined", "threshold": 3}', 75),
  
  -- Expertise achievements
  ('Rising Star', 'Reach 100 reputation points', 'star', 'expertise', '{"type": "reputation_score", "threshold": 100}', 50),
  ('Expert', 'Reach 500 reputation points', 'medal', 'expertise', '{"type": "reputation_score", "threshold": 500}', 200),
  ('Master', 'Reach 2000 reputation points', 'crown', 'expertise', '{"type": "reputation_score", "threshold": 2000}', 750),
  ('Popular Voice', 'Get 100 total upvotes on your content', 'thumbs-up', 'expertise', '{"type": "total_upvotes", "threshold": 100}', 150),
  ('Influencer', 'Get 500 total upvotes on your content', 'trending-up', 'expertise', '{"type": "total_upvotes", "threshold": 500}', 500),
  
  -- Engagement achievements  
  ('Consistent Contributor', '7-day login streak', 'flame', 'special', '{"type": "login_streak", "threshold": 7}', 100),
  ('Dedicated Member', '30-day login streak', 'zap', 'special', '{"type": "login_streak", "threshold": 30}', 500),
  ('Survey Master', 'Complete 10 surveys', 'clipboard-check', 'special', '{"type": "surveys_completed", "threshold": 10}', 100),
  ('Profile Pro', 'Complete your profile 100%', 'user-check', 'special', '{"type": "profile_complete", "threshold": 100}', 50),
  ('Early Adopter', 'Joined during beta phase', 'rocket', 'special', '{"type": "early_adopter"}', 200),
  ('Inviter', 'Successfully invite 5 new members', 'user-plus', 'special', '{"type": "invites_used", "threshold": 5}', 150)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- XP AWARDING FUNCTIONS
-- ============================================

-- Function to award XP and check for level up
CREATE OR REPLACE FUNCTION award_xp(p_user_id UUID, p_amount INTEGER, p_reason TEXT)
RETURNS JSON AS $$
DECLARE
  v_current_xp INTEGER;
  v_current_level INTEGER;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_level_info RECORD;
  v_leveled_up BOOLEAN := false;
BEGIN
  -- Get current XP and level
  SELECT xp_points, level INTO v_current_xp, v_current_level
  FROM users WHERE id = p_user_id;
  
  IF v_current_xp IS NULL THEN
    v_current_xp := 0;
    v_current_level := 1;
  END IF;
  
  v_new_xp := v_current_xp + p_amount;
  
  -- Find the new level based on XP
  SELECT level INTO v_new_level
  FROM user_levels
  WHERE xp_required <= v_new_xp
  ORDER BY xp_required DESC
  LIMIT 1;
  
  IF v_new_level IS NULL THEN
    v_new_level := 1;
  END IF;
  
  -- Update user
  UPDATE users
  SET xp_points = v_new_xp, level = v_new_level
  WHERE id = p_user_id;
  
  -- Check if leveled up
  IF v_new_level > v_current_level THEN
    v_leveled_up := true;
    
    -- Get level info for notification
    SELECT * INTO v_level_info FROM user_levels WHERE level = v_new_level;
    
    -- Notify user of level up
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      p_user_id,
      'system',
      'Level Up!',
      'Congratulations! You reached level ' || v_new_level || ' - ' || v_level_info.name || '!',
      '/profile/' || p_user_id
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'xp_earned', p_amount,
    'reason', p_reason,
    'new_xp', v_new_xp,
    'new_level', v_new_level,
    'leveled_up', v_leveled_up
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user progress
CREATE OR REPLACE FUNCTION get_user_progress(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_current_level RECORD;
  v_next_level RECORD;
  v_achievements_count INTEGER;
  v_total_achievements INTEGER;
BEGIN
  -- Get user data
  SELECT id, name, xp_points, level, progress_visibility, role
  INTO v_user FROM users WHERE id = p_user_id;
  
  IF v_user IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Get current and next level info
  SELECT * INTO v_current_level FROM user_levels WHERE level = v_user.level;
  SELECT * INTO v_next_level FROM user_levels WHERE level = v_user.level + 1;
  
  -- Count achievements
  SELECT COUNT(*) INTO v_achievements_count FROM user_achievements WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_total_achievements FROM achievements WHERE is_hidden = false;
  
  RETURN json_build_object(
    'success', true,
    'xp_points', COALESCE(v_user.xp_points, 0),
    'level', COALESCE(v_user.level, 1),
    'current_level', row_to_json(v_current_level),
    'next_level', row_to_json(v_next_level),
    'xp_to_next_level', CASE WHEN v_next_level IS NOT NULL 
      THEN v_next_level.xp_required - COALESCE(v_user.xp_points, 0) 
      ELSE 0 END,
    'progress_percentage', CASE WHEN v_next_level IS NOT NULL AND v_current_level IS NOT NULL
      THEN ROUND(
        ((COALESCE(v_user.xp_points, 0) - v_current_level.xp_required)::NUMERIC / 
        NULLIF(v_next_level.xp_required - v_current_level.xp_required, 0)) * 100
      )
      ELSE 100 END,
    'achievements_unlocked', v_achievements_count,
    'total_achievements', v_total_achievements,
    'visibility', v_user.progress_visibility,
    'role', v_user.role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS FOR AUTO XP
-- ============================================

-- Trigger to award XP on post creation
CREATE OR REPLACE FUNCTION trigger_award_xp_on_post()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'published' THEN
    PERFORM award_xp(NEW.author_id, 20, 'Created a post');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS award_xp_on_post_create ON posts;
CREATE TRIGGER award_xp_on_post_create
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_award_xp_on_post();

-- Trigger to award XP on solution acceptance
-- NOTE: Commented out until is_accepted column is confirmed to exist
-- CREATE OR REPLACE FUNCTION trigger_award_xp_on_solution()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF TG_OP = 'UPDATE' AND NEW.is_accepted = TRUE AND OLD.is_accepted = FALSE THEN
--     PERFORM award_xp(NEW.author_id, 30, 'Answer accepted as solution');
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- DROP TRIGGER IF EXISTS award_xp_on_solution ON posts;
-- CREATE TRIGGER award_xp_on_solution
--   AFTER UPDATE OF is_accepted ON posts
--   FOR EACH ROW
--   WHEN (NEW.is_accepted = TRUE AND OLD.is_accepted = FALSE)
--   EXECUTE FUNCTION trigger_award_xp_on_solution();

-- Trigger to award XP on comment
CREATE OR REPLACE FUNCTION trigger_award_xp_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM award_xp(NEW.user_id, 2, 'Left a comment');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS award_xp_on_comment ON comments;
CREATE TRIGGER award_xp_on_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_award_xp_on_comment();

-- Grant permissions
GRANT EXECUTE ON FUNCTION award_xp(UUID, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_progress(UUID) TO authenticated, anon;
