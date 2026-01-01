-- ============================================
-- GAMIFICATION ENHANCEMENTS
-- Vote XP, Achievement Auto-Unlock, Solution XP
-- ============================================

-- 1. VOTE XP TRIGGER
-- Award XP to post author when they receive an upvote

CREATE OR REPLACE FUNCTION trigger_award_xp_on_vote()
RETURNS TRIGGER AS $$
DECLARE
  v_post_author_id UUID;
BEGIN
  -- Only award XP for upvotes (value = 1)
  IF TG_OP = 'INSERT' AND NEW.value = 1 THEN
    -- Get the post author
    SELECT author_id INTO v_post_author_id FROM posts WHERE id = NEW.post_id;
    
    -- Don't award XP if voting on your own post
    IF v_post_author_id IS NOT NULL AND v_post_author_id != NEW.voter_id THEN
      PERFORM award_xp(v_post_author_id, 5, 'Received an upvote');
    END IF;
  END IF;
  
  -- Handle vote changes (downvote to upvote)
  IF TG_OP = 'UPDATE' AND OLD.value != 1 AND NEW.value = 1 THEN
    SELECT author_id INTO v_post_author_id FROM posts WHERE id = NEW.post_id;
    IF v_post_author_id IS NOT NULL AND v_post_author_id != NEW.voter_id THEN
      PERFORM award_xp(v_post_author_id, 5, 'Received an upvote');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS award_xp_on_vote ON post_votes;
CREATE TRIGGER award_xp_on_vote
  AFTER INSERT OR UPDATE ON post_votes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_award_xp_on_vote();

-- 2. SOLUTION ACCEPTANCE XP TRIGGER
-- Award XP when an answer is accepted as solution
-- First, ensure the accepted_answer_id column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'accepted_answer_id'
  ) THEN
    ALTER TABLE posts ADD COLUMN accepted_answer_id UUID REFERENCES posts(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION trigger_award_xp_on_answer_accepted()
RETURNS TRIGGER AS $$
BEGIN
  -- When accepted_answer_id changes from NULL to a value
  IF TG_OP = 'UPDATE' AND OLD.accepted_answer_id IS NULL AND NEW.accepted_answer_id IS NOT NULL THEN
    -- Get the answer author and award XP
    DECLARE
      v_answer_author_id UUID;
    BEGIN
      SELECT author_id INTO v_answer_author_id FROM posts WHERE id = NEW.accepted_answer_id;
      IF v_answer_author_id IS NOT NULL THEN
        PERFORM award_xp(v_answer_author_id, 30, 'Answer accepted as solution');
      END IF;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS award_xp_on_answer_accepted ON posts;
CREATE TRIGGER award_xp_on_answer_accepted
  AFTER UPDATE OF accepted_answer_id ON posts
  FOR EACH ROW
  WHEN (NEW.accepted_answer_id IS NOT NULL AND OLD.accepted_answer_id IS DISTINCT FROM NEW.accepted_answer_id)
  EXECUTE FUNCTION trigger_award_xp_on_answer_accepted();

-- 3. ACHIEVEMENT AUTO-UNLOCK FUNCTION
-- Check and unlock achievements for a user

CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_achievement RECORD;
  v_count INTEGER;
  v_unlocked TEXT[] := ARRAY[]::TEXT[];
  v_criteria_type TEXT;
  v_threshold INTEGER;
  v_user_value INTEGER;
  v_already_has BOOLEAN;
BEGIN
  FOR v_achievement IN SELECT * FROM achievements WHERE is_hidden = false LOOP
    -- Check if user already has this achievement
    SELECT EXISTS (
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id AND achievement_id = v_achievement.id
    ) INTO v_already_has;
    
    IF v_already_has THEN
      CONTINUE;
    END IF;
    
    -- Get criteria type and threshold
    v_criteria_type := v_achievement.criteria->>'type';
    v_threshold := COALESCE((v_achievement.criteria->>'threshold')::INTEGER, 0);
    v_user_value := 0;
    
    -- Check different criteria types
    CASE v_criteria_type
      WHEN 'post_count' THEN
        SELECT COUNT(*) INTO v_user_value FROM posts 
        WHERE author_id = p_user_id AND status = 'published';
        
      WHEN 'solution_count' THEN
        SELECT COUNT(*) INTO v_user_value FROM posts p
        JOIN posts q ON q.accepted_answer_id = p.id
        WHERE p.author_id = p_user_id;
        
      WHEN 'total_upvotes' THEN
        SELECT COALESCE(SUM(upvote_count), 0) INTO v_user_value FROM posts
        WHERE author_id = p_user_id;
        
      WHEN 'reputation_score' THEN
        SELECT COALESCE(reputation_score, 0) INTO v_user_value FROM users
        WHERE id = p_user_id;
        
      WHEN 'groups_joined' THEN
        SELECT COUNT(*) INTO v_user_value FROM group_members
        WHERE user_id = p_user_id;
        
      WHEN 'login_streak' THEN
        -- For login streaks, we'd need a login_history table
        -- Simplified: check if user level indicates activity
        SELECT level INTO v_user_value FROM users WHERE id = p_user_id;
        v_user_value := CASE WHEN v_user_value >= 5 THEN v_threshold ELSE 0 END;
        
      WHEN 'profile_complete' THEN
        SELECT CASE 
          WHEN name IS NOT NULL AND bio IS NOT NULL AND avatar_url IS NOT NULL 
          THEN 100 ELSE 50 
        END INTO v_user_value FROM users WHERE id = p_user_id;
        
      WHEN 'invites_used' THEN
        SELECT COUNT(*) INTO v_user_value FROM invite_codes
        WHERE created_by = p_user_id AND used_by IS NOT NULL;
        
      WHEN 'surveys_completed' THEN
        SELECT COUNT(*) INTO v_user_value FROM survey_responses
        WHERE user_id = p_user_id;
        
      ELSE
        -- Unknown criteria type, skip
        CONTINUE;
    END CASE;
    
    -- Check if threshold is met
    IF v_user_value >= v_threshold THEN
      -- Unlock the achievement
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (p_user_id, v_achievement.id)
      ON CONFLICT DO NOTHING;
      
      -- Award XP for the achievement
      IF v_achievement.xp_reward > 0 THEN
        PERFORM award_xp(p_user_id, v_achievement.xp_reward, 'Achievement: ' || v_achievement.name);
      END IF;
      
      -- Add to unlocked list
      v_unlocked := array_append(v_unlocked, v_achievement.name);
      
      -- Create notification
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (
        p_user_id,
        'badge',
        'Achievement Unlocked!',
        'You earned the "' || v_achievement.name || '" badge! +' || v_achievement.xp_reward || ' XP',
        '/achievements'
      );
    END IF;
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'unlocked', v_unlocked,
    'count', array_length(v_unlocked, 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_and_unlock_achievements(UUID) TO authenticated;

-- 4. TRIGGER TO AUTO-CHECK ACHIEVEMENTS ON VARIOUS ACTIONS

-- Check achievements after XP is awarded
CREATE OR REPLACE FUNCTION trigger_check_achievements_after_xp()
RETURNS TRIGGER AS $$
BEGIN
  -- Check achievements for user (async would be better in production)
  PERFORM check_and_unlock_achievements(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger would fire too often; better to check periodically or on specific actions
-- For now, we'll check achievements via API calls

-- 5. EVENT CREATION XP

CREATE OR REPLACE FUNCTION trigger_award_xp_on_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Award XP for creating an event
    PERFORM award_xp(NEW.author_id, 15, 'Created an event');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS award_xp_on_event_create ON posts;
CREATE TRIGGER award_xp_on_event_create
  AFTER INSERT ON posts
  FOR EACH ROW
  WHEN (NEW.content_type = 'event')
  EXECUTE FUNCTION trigger_award_xp_on_event();

-- 6. RESOURCE UPLOAD XP

CREATE OR REPLACE FUNCTION trigger_award_xp_on_resource()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM award_xp(NEW.author_id, 25, 'Shared a resource');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS award_xp_on_resource_upload ON posts;
CREATE TRIGGER award_xp_on_resource_upload
  AFTER INSERT ON posts
  FOR EACH ROW
  WHEN (NEW.content_type = 'resource')
  EXECUTE FUNCTION trigger_award_xp_on_resource();

-- 7. GET USER ACHIEVEMENTS FUNCTION

CREATE OR REPLACE FUNCTION get_user_achievements(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_unlocked JSON;
  v_available JSON;
  v_total_count INTEGER;
  v_unlocked_count INTEGER;
BEGIN
  -- Get unlocked achievements
  SELECT json_agg(row_to_json(t)) INTO v_unlocked
  FROM (
    SELECT 
      a.id,
      a.name,
      a.description,
      a.icon,
      a.category,
      a.xp_reward,
      ua.unlocked_at
    FROM user_achievements ua
    JOIN achievements a ON a.id = ua.achievement_id
    WHERE ua.user_id = p_user_id
    ORDER BY ua.unlocked_at DESC
  ) t;
  
  -- Get available (not unlocked) achievements
  SELECT json_agg(row_to_json(t)) INTO v_available
  FROM (
    SELECT 
      a.id,
      a.name,
      a.description,
      a.icon,
      a.category,
      a.xp_reward,
      a.criteria
    FROM achievements a
    WHERE a.is_hidden = false
    AND NOT EXISTS (
      SELECT 1 FROM user_achievements ua 
      WHERE ua.achievement_id = a.id AND ua.user_id = p_user_id
    )
    ORDER BY a.category, a.xp_reward
  ) t;
  
  SELECT COUNT(*) INTO v_total_count FROM achievements WHERE is_hidden = false;
  SELECT COUNT(*) INTO v_unlocked_count FROM user_achievements WHERE user_id = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'unlocked', COALESCE(v_unlocked, '[]'::json),
    'available', COALESCE(v_available, '[]'::json),
    'total_count', v_total_count,
    'unlocked_count', v_unlocked_count,
    'completion_percentage', ROUND((v_unlocked_count::NUMERIC / NULLIF(v_total_count, 0)) * 100)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_user_achievements(UUID) TO authenticated, anon;
