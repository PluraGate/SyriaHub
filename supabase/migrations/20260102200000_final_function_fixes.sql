-- Final fix for recalculate_trust_score and get_user_stats
-- Correct column names:
-- - trust_score_components uses citation_quality_score (not content_quality_score)
-- - comments uses user_id (not author_id)

-- =================================================================
-- 1. Fix recalculate_trust_score: use correct column names from trust_score_components table
-- =================================================================
DROP FUNCTION IF EXISTS recalculate_trust_score(UUID);

CREATE OR REPLACE FUNCTION recalculate_trust_score(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_citation_quality DECIMAL := 0;
  v_peer_review DECIMAL := 0;
  v_reuse DECIMAL := 0;
  v_cross_discipline DECIMAL := 0;
  v_self_citation DECIMAL := 0;
  v_echo_chamber DECIMAL := 0;
  v_composite DECIMAL;
BEGIN
  -- Citation quality: count citations received
  SELECT COUNT(*)::DECIMAL INTO v_citation_quality
  FROM citations c
  JOIN posts p ON p.id = c.target_post_id
  WHERE p.author_id = p_user_id;
  
  -- Peer review helpfulness (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'peer_reviews' AND table_schema = 'public') THEN
    EXECUTE 'SELECT COALESCE(AVG(overall_score), 0) FROM peer_reviews WHERE reviewer_id = $1 AND status = ''completed'''
    INTO v_peer_review USING p_user_id;
  END IF;
  
  -- Research reuse (forks by others, using forked_from_id)
  SELECT COUNT(*)::DECIMAL INTO v_reuse
  FROM posts p
  WHERE p.forked_from_id IN (SELECT id FROM posts WHERE author_id = p_user_id)
    AND p.author_id != p_user_id;
  
  -- Self-citation penalty
  SELECT COUNT(*)::DECIMAL INTO v_self_citation
  FROM citations c
  JOIN posts source ON c.source_post_id = source.id
  JOIN posts target ON c.target_post_id = target.id
  WHERE source.author_id = p_user_id AND target.author_id = p_user_id;
  
  -- Composite calculation (weights aligned with trust_governance.sql)
  v_composite := 
    (LEAST(v_citation_quality, 100) * 2.0) +
    (v_peer_review * 2.5) +
    (LEAST(v_reuse, 10) * 1.5) +
    (v_cross_discipline * 1.0) -
    (LEAST(v_self_citation, 5) * 3.0) -
    (v_echo_chamber * 2.0);
  
  -- Store result using CORRECT column names from trust_score_components
  INSERT INTO trust_score_components (
    user_id, 
    citation_quality_score,           -- Correct column name
    peer_review_helpfulness,
    research_reuse_score,
    cross_discipline_engagement,
    self_citation_penalty, 
    echo_chamber_penalty,
    composite_trust_score, 
    last_recalculated_at
  ) VALUES (
    p_user_id, 
    v_citation_quality, 
    v_peer_review,
    v_reuse, 
    v_cross_discipline,
    v_self_citation, 
    v_echo_chamber,
    v_composite, 
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    citation_quality_score = EXCLUDED.citation_quality_score,
    peer_review_helpfulness = EXCLUDED.peer_review_helpfulness,
    research_reuse_score = EXCLUDED.research_reuse_score,
    cross_discipline_engagement = EXCLUDED.cross_discipline_engagement,
    self_citation_penalty = EXCLUDED.self_citation_penalty,
    echo_chamber_penalty = EXCLUDED.echo_chamber_penalty,
    composite_trust_score = EXCLUDED.composite_trust_score,
    last_recalculated_at = NOW();
END;
$$;

-- =================================================================
-- 2. Fix get_user_stats: comments uses user_id not author_id
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
  v_citations_received BIGINT := 0;
  v_academic_impact NUMERIC := 0;
BEGIN
  -- Get post count
  SELECT COUNT(*) INTO v_post_count FROM posts WHERE author_id = user_uuid;
  
  -- Get comment count (comments table uses 'user_id')
  SELECT COUNT(*) INTO v_comment_count FROM comments WHERE user_id = user_uuid;
  
  -- Get followers/following count
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follows' AND table_schema = 'public') THEN
    SELECT COUNT(*) INTO v_follower_count FROM follows WHERE following_id = user_uuid;
    SELECT COUNT(*) INTO v_following_count FROM follows WHERE follower_id = user_uuid;
  END IF;
  
  -- Get group membership count
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_members' AND table_schema = 'public') THEN
    EXECUTE 'SELECT COUNT(*) FROM group_members WHERE user_id = $1' INTO v_group_count USING user_uuid;
  END IF;
  
  -- Get citations received
  SELECT COUNT(*) INTO v_citations_received
  FROM citations c
  JOIN posts p ON p.id = c.target_post_id
  WHERE p.author_id = user_uuid;
  
  -- Academic impact is based on citations received
  v_academic_impact := v_citations_received * 10;
  
  -- Build result
  v_result := jsonb_build_object(
    'post_count', v_post_count,
    'comment_count', v_comment_count,
    'follower_count', v_follower_count,
    'following_count', v_following_count,
    'group_count', v_group_count,
    'academic_impact', v_academic_impact,
    'citations_received', v_citations_received
  );
  
  RETURN v_result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION recalculate_trust_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO anon, authenticated;

COMMENT ON FUNCTION recalculate_trust_score(UUID) IS 'Recalculate composite trust score using correct column names from trust_score_components';
COMMENT ON FUNCTION get_user_stats(UUID) IS 'Get comprehensive user statistics';
