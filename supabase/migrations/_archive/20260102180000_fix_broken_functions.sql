-- Fix 9 broken database functions that have schema mismatches
-- These functions are actively used in the app but reference non-existent columns

-- First, drop all functions that need signature changes
DROP FUNCTION IF EXISTS check_and_unlock_achievements(UUID);
DROP FUNCTION IF EXISTS get_diverse_recommendations(UUID, INTEGER);
DROP FUNCTION IF EXISTS recalculate_trust_score(UUID);
DROP FUNCTION IF EXISTS get_moderation_metrics();
DROP FUNCTION IF EXISTS calculate_academic_impact(UUID);
DROP FUNCTION IF EXISTS find_matching_reviewers(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_supporting_evidence(UUID);
DROP FUNCTION IF EXISTS get_eligible_jurors(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_disputes(UUID);

-- =================================================================
-- 1. Fix check_and_unlock_achievements: posts has vote_count, not upvote_count
-- =================================================================
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
    
    -- Get the user's progress for this achievement type
    CASE v_achievement.condition_type
      WHEN 'posts_count' THEN
        SELECT COUNT(*) INTO v_user_value FROM posts WHERE author_id = p_user_id AND status = 'approved';
      WHEN 'comments_count' THEN
        SELECT COUNT(*) INTO v_user_value FROM comments WHERE author_id = p_user_id;
      WHEN 'votes_received' THEN
        -- Use vote_count column (not upvote_count)
        SELECT COALESCE(SUM(vote_count), 0) INTO v_user_value FROM posts WHERE author_id = p_user_id;
      WHEN 'followers_count' THEN
        SELECT COUNT(*) INTO v_user_value FROM follows WHERE following_id = p_user_id;
      WHEN 'days_active' THEN
        SELECT EXTRACT(DAY FROM NOW() - MIN(created_at)) INTO v_user_value FROM posts WHERE author_id = p_user_id;
      ELSE
        v_user_value := 0;
    END CASE;
    
    -- Check if threshold is met
    IF v_user_value >= v_achievement.condition_value THEN
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

-- =================================================================
-- 2. Fix get_diverse_recommendations: ambiguous id reference
-- =================================================================
CREATE OR REPLACE FUNCTION get_diverse_recommendations(
  p_user_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  author_id UUID,
  author_name TEXT,
  created_at TIMESTAMPTZ,
  category TEXT,
  diversity_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS id,
    p.title,
    p.content,
    p.author_id,
    u.name AS author_name,
    p.created_at,
    p.category,
    RANDOM()::NUMERIC AS diversity_score
  FROM posts p
  LEFT JOIN users u ON u.id = p.author_id
  WHERE p.status = 'approved'
    AND p.visibility = 'public'
    AND (p_user_id IS NULL OR p.author_id != p_user_id)
  ORDER BY RANDOM()
  LIMIT p_limit;
END;
$$;

-- =================================================================
-- 3. Fix recalculate_trust_score: posts uses forked_from_id, not forked_from
-- =================================================================
CREATE OR REPLACE FUNCTION recalculate_trust_score(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_count INTEGER;
  v_citation_count INTEGER;
  v_fork_count INTEGER;
  v_endorsement_count INTEGER;
  v_low_effort_penalty NUMERIC := 0;
  v_invite_ratio NUMERIC := 0;
  v_composite_score NUMERIC;
BEGIN
  -- Count user's publications
  SELECT COUNT(*) INTO v_post_count
  FROM posts
  WHERE author_id = p_user_id AND status = 'approved';
  
  -- Count citations received
  SELECT COUNT(*) INTO v_citation_count
  FROM citations c
  JOIN posts p ON p.id = c.target_post_id
  WHERE p.author_id = p_user_id;
  
  -- Count forks of user's posts (use forked_from_id column)
  SELECT COUNT(*) INTO v_fork_count
  FROM posts p
  WHERE p.forked_from_id IN (SELECT id FROM posts WHERE author_id = p_user_id);
  
  -- Count endorsements
  SELECT COUNT(*) INTO v_endorsement_count
  FROM skill_endorsements
  WHERE endorsed_user_id = p_user_id;
  
  -- Calculate composite score
  v_composite_score := LEAST(100, (
    (v_post_count * 5) +
    (v_citation_count * 10) +
    (v_fork_count * 3) +
    (v_endorsement_count * 2)
  ));
  
  -- Update trust score components table
  INSERT INTO trust_score_components (
    user_id,
    content_quality_score,
    citation_score,
    invite_subtree_citation_ratio,
    low_effort_penalty,
    composite_trust_score,
    last_recalculated_at
  )
  VALUES (
    p_user_id,
    LEAST(100, v_post_count * 10),
    LEAST(100, v_citation_count * 10),
    v_invite_ratio,
    v_low_effort_penalty,
    v_composite_score,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    content_quality_score = EXCLUDED.content_quality_score,
    citation_score = EXCLUDED.citation_score,
    composite_trust_score = EXCLUDED.composite_trust_score,
    last_recalculated_at = NOW();
END;
$$;

-- =================================================================
-- 4. Fix get_moderation_metrics: posts doesn't have moderated_at, use updated_at
-- =================================================================
CREATE OR REPLACE FUNCTION get_moderation_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'pending_posts', (SELECT COUNT(*) FROM posts WHERE status = 'pending'),
    'approved_posts', (SELECT COUNT(*) FROM posts WHERE status = 'approved'),
    'rejected_posts', (SELECT COUNT(*) FROM posts WHERE status = 'rejected'),
    'reviewed_today', (SELECT COUNT(*) FROM posts WHERE status IN ('approved', 'rejected') AND updated_at::DATE = CURRENT_DATE),
    'reviewed_this_week', (SELECT COUNT(*) FROM posts WHERE status IN ('approved', 'rejected') AND updated_at >= NOW() - INTERVAL '7 days'),
    'avg_review_hours', (
      SELECT ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600), 1)
      FROM posts 
      WHERE status IN ('approved', 'rejected')
        AND updated_at >= NOW() - INTERVAL '30 days'
    ),
    'pending_appeals', (SELECT COUNT(*) FROM moderation_appeals WHERE status = 'pending'),
    'total_flags', (SELECT COUNT(*) FROM reports WHERE status = 'pending')
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- =================================================================
-- 5. Fix calculate_academic_impact: citations uses 'type', not 'citation_type'
-- =================================================================
CREATE OR REPLACE FUNCTION calculate_academic_impact(p_post_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_citations', (SELECT COUNT(*) FROM citations WHERE target_post_id = p_post_id),
    'supporting_citations', (SELECT COUNT(*) FROM citations WHERE target_post_id = p_post_id AND type = 'internal'),
    'external_citations', (SELECT COUNT(*) FROM citations WHERE target_post_id = p_post_id AND type = 'external'),
    'fork_count', (SELECT COUNT(*) FROM posts WHERE forked_from_id = p_post_id),
    'view_count', (SELECT view_count FROM posts WHERE id = p_post_id),
    'comment_count', (SELECT COUNT(*) FROM comments WHERE post_id = p_post_id)
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- =================================================================
-- 6. Fix find_matching_reviewers: use trust_score_components, not users.reputation
-- =================================================================
CREATE OR REPLACE FUNCTION find_matching_reviewers(
  p_post_id UUID,
  p_count INTEGER DEFAULT 3
)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  expertise_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS user_id,
    u.name,
    COALESCE(tsc.composite_trust_score, 0) AS expertise_score
  FROM users u
  LEFT JOIN trust_score_components tsc ON tsc.user_id = u.id
  WHERE u.role IN ('researcher', 'admin')
    AND u.id != (SELECT author_id FROM posts WHERE id = p_post_id)
  ORDER BY tsc.composite_trust_score DESC NULLS LAST
  LIMIT p_count;
END;
$$;

-- =================================================================
-- 7. Fix get_supporting_evidence: citations uses 'type', not 'citation_type'
-- =================================================================
CREATE OR REPLACE FUNCTION get_supporting_evidence(p_post_id UUID)
RETURNS TABLE (
  citation_id UUID,
  source_post_id UUID,
  source_title TEXT,
  source_author TEXT,
  citation_type TEXT 
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS citation_id,
    c.source_post_id,
    p.title AS source_title,
    u.name AS source_author,
    c.type AS citation_type
  FROM citations c
  JOIN posts p ON p.id = c.source_post_id
  LEFT JOIN users u ON u.id = p.author_id
  WHERE c.target_post_id = p_post_id
    AND c.type = 'internal';
END;
$$;

-- =================================================================
-- 8. Fix get_user_stats: Use dynamic SQL to handle group_members conditionally
-- Already fixed in 20251231000000_fix_user_stats.sql with dynamic SQL
-- This ensures the function continues to work if group_members was dropped
-- =================================================================
-- (No change needed - already using dynamic SQL)

-- =================================================================
-- 9. Fix get_eligible_jurors: use trust_score_components, not users.reputation
-- =================================================================
CREATE OR REPLACE FUNCTION get_eligible_jurors(
  p_case_id UUID,
  p_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  juror_id UUID,
  name TEXT,
  trust_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS juror_id,
    u.name,
    COALESCE(tsc.composite_trust_score, 0) AS trust_score
  FROM users u
  LEFT JOIN trust_score_components tsc ON tsc.user_id = u.id
  WHERE u.role IN ('member', 'researcher', 'admin')
    AND COALESCE(tsc.composite_trust_score, 0) >= 20
    -- Exclude parties to the case
    AND u.id NOT IN (
      SELECT reporter_id FROM reports WHERE id = p_case_id
      UNION
      SELECT reported_user_id FROM reports WHERE id = p_case_id
    )
  ORDER BY RANDOM()
  LIMIT p_count;
END;
$$;

-- =================================================================
-- 10. Fix get_disputes: citations uses 'type', not 'citation_type'
-- This function looks for 'disputes' type which doesn't exist, needs adjustment
-- =================================================================
CREATE OR REPLACE FUNCTION get_disputes(p_post_id UUID)
RETURNS TABLE (
  disputing_post_id UUID,
  disputing_title TEXT,
  disputing_author TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Note: Original expected 'disputes' in citation_type, but citations.type 
  -- only has 'internal'/'external'. Return empty for now or adjust logic.
  RETURN QUERY
  SELECT 
    p.id AS disputing_post_id,
    p.title AS disputing_title,
    u.name AS disputing_author,
    c.created_at
  FROM citations c
  JOIN posts p ON p.id = c.source_post_id
  LEFT JOIN users u ON u.id = p.author_id
  WHERE c.target_post_id = p_post_id
    AND c.type = 'internal' -- Fallback since 'disputes' type doesn't exist
  LIMIT 0; -- Return empty until proper dispute logic is implemented
END;
$$;

-- =================================================================
-- 11. Fix get_user_growth: ensure return type matches
-- Already fixed in 20251229000003_fix_user_growth_rpc.sql
-- =================================================================
-- (No change needed - already fixed)

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_and_unlock_achievements(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_diverse_recommendations(UUID, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION recalculate_trust_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_moderation_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_academic_impact(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION find_matching_reviewers(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_supporting_evidence(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_eligible_jurors(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_disputes(UUID) TO anon, authenticated;

COMMENT ON FUNCTION check_and_unlock_achievements(UUID) IS 'Check and unlock achievements for a user based on their activity metrics';
COMMENT ON FUNCTION get_diverse_recommendations(UUID, INTEGER) IS 'Get diverse content recommendations, avoiding duplicates and own posts';
COMMENT ON FUNCTION recalculate_trust_score(UUID) IS 'Recalculate composite trust score for a user';
COMMENT ON FUNCTION get_moderation_metrics() IS 'Get moderation dashboard metrics for admins';
COMMENT ON FUNCTION calculate_academic_impact(UUID) IS 'Calculate academic impact metrics for a post';
COMMENT ON FUNCTION find_matching_reviewers(UUID, INTEGER) IS 'Find qualified reviewers for a post based on trust scores';
COMMENT ON FUNCTION get_supporting_evidence(UUID) IS 'Get citations that support a given post';
COMMENT ON FUNCTION get_eligible_jurors(UUID, INTEGER) IS 'Find eligible jurors for a moderation case';
COMMENT ON FUNCTION get_disputes(UUID) IS 'Get posts that dispute a given post (placeholder until dispute logic implemented)';

