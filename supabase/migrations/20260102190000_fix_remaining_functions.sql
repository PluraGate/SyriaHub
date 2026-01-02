-- Fix remaining 3 broken database functions
-- Schema corrections:
-- - Use 'endorsements' table (not 'skill_endorsements')
-- - reports table has reporter_id and post_id (no reported_user_id)
-- - get_user_stats needs to handle missing tables gracefully

-- =================================================================
-- 1. Fix recalculate_trust_score: use 'endorsements' not 'skill_endorsements'
-- =================================================================
DROP FUNCTION IF EXISTS recalculate_trust_score(UUID);

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
  
  -- Count endorsements from 'endorsements' table (not skill_endorsements)
  SELECT COUNT(*) INTO v_endorsement_count
  FROM endorsements
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
-- 2. Fix get_eligible_jurors: reports links to post, not user
--    Get the post author as the "reported party"
-- =================================================================
DROP FUNCTION IF EXISTS get_eligible_jurors(UUID, INTEGER);

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
DECLARE
  v_reporter_id UUID;
  v_post_author_id UUID;
BEGIN
  -- Get the reporter and reported post's author from the reports table
  SELECT r.reporter_id, p.author_id
  INTO v_reporter_id, v_post_author_id
  FROM reports r
  JOIN posts p ON p.id = r.post_id
  WHERE r.id = p_case_id;
  
  RETURN QUERY
  SELECT 
    u.id AS juror_id,
    u.name,
    COALESCE(tsc.composite_trust_score, 0) AS trust_score
  FROM users u
  LEFT JOIN trust_score_components tsc ON tsc.user_id = u.id
  WHERE u.role IN ('member', 'researcher', 'admin')
    AND COALESCE(tsc.composite_trust_score, 0) >= 20
    -- Exclude parties to the case (reporter and reported post author)
    AND u.id != COALESCE(v_reporter_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND u.id != COALESCE(v_post_author_id, '00000000-0000-0000-0000-000000000000'::UUID)
  ORDER BY RANDOM()
  LIMIT p_count;
END;
$$;

-- =================================================================
-- 3. Fix get_user_stats: ensure it handles all dependencies correctly
--    Already uses dynamic SQL, but let's refresh it with correct table refs
-- =================================================================
DROP FUNCTION IF EXISTS get_user_stats(UUID);

CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_post_count BIGINT := 0;
  v_comment_count BIGINT := 0;
  v_follower_count BIGINT := 0;
  v_following_count BIGINT := 0;
  v_group_count BIGINT := 0;
  v_academic_impact NUMERIC := 0;
BEGIN
  -- Get post count
  SELECT COUNT(*) INTO v_post_count FROM posts WHERE author_id = user_uuid;
  
  -- Get comment count (comments table uses 'author_id' or 'user_id' - check which exists)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'author_id' AND table_schema = 'public') THEN
    EXECUTE 'SELECT COUNT(*) FROM comments WHERE author_id = $1' INTO v_comment_count USING user_uuid;
  ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'user_id' AND table_schema = 'public') THEN
    EXECUTE 'SELECT COUNT(*) FROM comments WHERE user_id = $1' INTO v_comment_count USING user_uuid;
  END IF;
  
  -- Get followers/following count
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follows' AND table_schema = 'public') THEN
    EXECUTE 'SELECT COUNT(*) FROM follows WHERE following_id = $1' INTO v_follower_count USING user_uuid;
    EXECUTE 'SELECT COUNT(*) FROM follows WHERE follower_id = $1' INTO v_following_count USING user_uuid;
  END IF;
  
  -- Get group membership count using dynamic SQL
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_members' AND table_schema = 'public') THEN
    EXECUTE 'SELECT COUNT(*) FROM group_members WHERE user_id = $1' INTO v_group_count USING user_uuid;
  END IF;
  
  -- Get academic impact (citations received)
  SELECT COALESCE(SUM(c.id::text::int % 10), 0) INTO v_academic_impact
  FROM citations c
  JOIN posts p ON p.id = c.target_post_id
  WHERE p.author_id = user_uuid;
  
  -- Build result
  v_result := jsonb_build_object(
    'post_count', v_post_count,
    'comment_count', v_comment_count,
    'follower_count', v_follower_count,
    'following_count', v_following_count,
    'group_count', v_group_count,
    'academic_impact', v_academic_impact,
    'citations_received', (SELECT COUNT(*) FROM citations c JOIN posts p ON p.id = c.target_post_id WHERE p.author_id = user_uuid)
  );
  
  RETURN v_result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION recalculate_trust_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_eligible_jurors(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO anon, authenticated;

COMMENT ON FUNCTION recalculate_trust_score(UUID) IS 'Recalculate composite trust score for a user based on posts, citations, forks, and endorsements';
COMMENT ON FUNCTION get_eligible_jurors(UUID, INTEGER) IS 'Find eligible jurors for a moderation case, excluding reporter and post author';
COMMENT ON FUNCTION get_user_stats(UUID) IS 'Get comprehensive user statistics with dynamic table checking';
