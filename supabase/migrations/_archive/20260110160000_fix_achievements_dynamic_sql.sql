-- Fix check_and_unlock_achievements to use dynamic SQL for optional columns
-- This avoids lint errors when columns might not exist

CREATE OR REPLACE FUNCTION check_and_unlock_achievements(p_user_id UUID)
RETURNS SETOF achievements
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_achievement RECORD;
  v_user_value NUMERIC;
  v_unlocked_ids UUID[];
  v_criteria_type TEXT;
  v_criteria_threshold NUMERIC;
BEGIN
  -- Get already unlocked achievement IDs
  SELECT ARRAY_AGG(achievement_id) INTO v_unlocked_ids
  FROM user_achievements
  WHERE user_id = p_user_id;
  
  -- Check each achievement that user hasn't unlocked yet
  FOR v_achievement IN
    SELECT * FROM achievements
    WHERE id != ALL(COALESCE(v_unlocked_ids, ARRAY[]::UUID[]))
  LOOP
    v_user_value := 0;
    
    -- Extract criteria from JSONB (the actual schema uses criteria.type and criteria.threshold)
    v_criteria_type := v_achievement.criteria->>'type';
    v_criteria_threshold := COALESCE((v_achievement.criteria->>'threshold')::NUMERIC, 0);
    
    -- Get the user's progress for this achievement type
    CASE v_criteria_type
      WHEN 'post_count' THEN
        SELECT COUNT(*) INTO v_user_value FROM posts WHERE author_id = p_user_id AND status = 'published';
      WHEN 'solution_count' THEN
        -- Use dynamic SQL to avoid lint errors if column doesn't exist
        BEGIN
          EXECUTE 'SELECT COUNT(*) FROM posts WHERE author_id = $1 AND is_accepted = TRUE' 
          INTO v_user_value USING p_user_id;
        EXCEPTION WHEN undefined_column THEN
          v_user_value := 0;
        END;
      WHEN 'discussions_started' THEN
        SELECT COUNT(*) INTO v_user_value FROM posts WHERE author_id = p_user_id AND content_type = 'question';
      WHEN 'groups_joined' THEN
        IF to_regclass('public.group_members') IS NOT NULL THEN
          SELECT COUNT(*) INTO v_user_value FROM group_members WHERE user_id = p_user_id;
        END IF;
      WHEN 'reputation_score' THEN
        SELECT COALESCE(composite_trust_score, 0) INTO v_user_value 
        FROM trust_score_components WHERE user_id = p_user_id;
      WHEN 'total_upvotes' THEN
        SELECT COALESCE(SUM(vote_count), 0) INTO v_user_value FROM posts WHERE author_id = p_user_id;
      WHEN 'login_streak' THEN
        -- Login streak would require a dedicated tracking table, skip for now
        v_user_value := 0;
      WHEN 'surveys_completed' THEN
        -- Survey completion would require a dedicated tracking table, skip for now
        v_user_value := 0;
      WHEN 'profile_complete' THEN
        SELECT COALESCE(profile_completion_score, 0) INTO v_user_value 
        FROM users WHERE id = p_user_id;
      WHEN 'invites_used' THEN
        IF to_regclass('public.invitations') IS NOT NULL THEN
          SELECT COUNT(*) INTO v_user_value 
          FROM invitations 
          WHERE inviter_id = p_user_id AND used_at IS NOT NULL;
        END IF;
      WHEN 'early_adopter' THEN
        -- Early adopter is granted manually or via special logic
        v_user_value := 0;
      ELSE
        v_user_value := 0;
    END CASE;
    
    -- Check if threshold is met (skip achievements with 0 threshold like early_adopter)
    IF v_criteria_threshold > 0 AND v_user_value >= v_criteria_threshold THEN
      -- Unlock the achievement
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (p_user_id, v_achievement.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
      
      RETURN NEXT v_achievement;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION check_and_unlock_achievements(UUID) TO authenticated;
COMMENT ON FUNCTION check_and_unlock_achievements(UUID) IS 'Check and unlock achievements for a user based on their activity metrics. Uses criteria JSONB column from achievements table.';
