-- ============================================
-- RESTORE EPISTEMIC REACH & FIX AUDIT (CORRECTED)
-- Migration: 20260104003000_fix_forked_from_column.sql
-- 
-- Fixes the forked_from -> forked_from_id column name issue
-- ============================================

-- First, restore get_user_stats to the correct Epistemic Reach formula
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_post_count BIGINT := 0;
  v_event_count BIGINT := 0;
  v_comment_count BIGINT := 0;
  v_follower_count BIGINT := 0;
  v_following_count BIGINT := 0;
  v_group_count BIGINT := 0;
  v_citation_count BIGINT := 0;
  v_epistemic_reach NUMERIC := 0;
  v_group_table TEXT := 'group_members';
  
  -- Relationship-based impact components
  v_supports_received BIGINT := 0;
  v_derived_from_received BIGINT := 0;
  v_contradicts_received BIGINT := 0;
  v_other_relationships BIGINT := 0;
  v_forks_received BIGINT := 0;
BEGIN
  -- Get post count (only published research posts: article, question, answer, or null)
  -- This must match the UI filtering logic in UserActivityFeed.tsx
  SELECT COUNT(*) INTO v_post_count 
  FROM posts 
  WHERE author_id = user_uuid 
    AND status = 'published'
    AND (content_type IS NULL OR content_type IN ('article', 'question', 'answer'));
  
  -- Get event count (only published events)
  SELECT COUNT(*) INTO v_event_count
  FROM posts
  WHERE author_id = user_uuid
    AND status = 'published'
    AND content_type = 'event';
  
  -- Get comment count (comments table uses 'user_id')
  SELECT COUNT(*) INTO v_comment_count FROM comments WHERE user_id = user_uuid;
  
  -- Get followers/following count
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follows' AND table_schema = 'public') THEN
    SELECT COUNT(*) INTO v_follower_count FROM follows WHERE following_id = user_uuid;
    SELECT COUNT(*) INTO v_following_count FROM follows WHERE follower_id = user_uuid;
  END IF;
  
  -- Get group membership count
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_members' AND table_schema = 'public') THEN
    EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(v_group_table) || ' WHERE user_id = $1' INTO v_group_count USING user_uuid;
  END IF;
  
  -- Get raw citations received (how many times this user's posts have been cited)
  SELECT COUNT(*) INTO v_citation_count
  FROM citations c
  JOIN posts p ON p.id = c.target_post_id
  WHERE p.author_id = user_uuid;
  
  -- ================================================
  -- EPISTEMIC REACH CALCULATION
  -- Uses content_relationships for semantic meaning
  -- ================================================
  
  -- Count relationships by type where user's content is the TARGET
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_relationships' AND table_schema = 'public') THEN
    SELECT 
      COALESCE(SUM(CASE WHEN cr.relationship = 'supports' THEN 1 ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN cr.relationship = 'derived_from' THEN 1 ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN cr.relationship = 'contradicts' THEN 1 ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN cr.relationship NOT IN ('supports', 'derived_from', 'contradicts') THEN 1 ELSE 0 END), 0)
    INTO v_supports_received, v_derived_from_received, v_contradicts_received, v_other_relationships
    FROM content_relationships cr
    JOIN posts p ON p.id = cr.target_id AND cr.target_type = 'post'
    WHERE p.author_id = user_uuid;
  END IF;
  
  -- Count forks of this user's posts (use forked_from_id column, not forked_from)
  SELECT COUNT(*) INTO v_forks_received
  FROM posts p
  WHERE p.forked_from_id IN (SELECT id FROM posts WHERE author_id = user_uuid);
  
  -- Calculate Epistemic Reach using weighted formula
  v_epistemic_reach := 
    (v_supports_received * 1.0) + 
    (v_derived_from_received * 2.0) + 
    (v_contradicts_received * 0.5) + 
    (v_other_relationships * 0.25) +
    (v_forks_received * 1.5) +
    (v_citation_count * 0.5);
  
  -- Round to 1 decimal place for display
  v_epistemic_reach := ROUND(v_epistemic_reach, 1);
  
  -- Build result
  v_result := jsonb_build_object(
    'post_count', v_post_count,
    'event_count', v_event_count,
    'comment_count', v_comment_count,
    'follower_count', v_follower_count,
    'following_count', v_following_count,
    'group_count', v_group_count,
    'citation_count', v_citation_count,
    'epistemic_reach', v_epistemic_reach,
    -- Keep academic_impact as alias for backwards compatibility
    'academic_impact', v_epistemic_reach
  );
  
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO anon, authenticated;

COMMENT ON FUNCTION get_user_stats(UUID) IS 
'Get comprehensive user statistics including Epistemic Reach.

Epistemic Reach measures scholarly engagement quality, not just quantity:
  - supports × 1.0 (corroborating evidence)
  - derived_from × 2.0 (enabling new research)
  - contradicts × 0.5 (engaging discourse)
  - other relationships × 0.25
  - forks × 1.5 (practical reuse)
  - raw citations × 0.5 (baseline acknowledgment)';


-- ============================================
-- Now update audit_counter_mismatches to match the correct logic
-- ============================================

CREATE OR REPLACE FUNCTION audit_counter_mismatches()
RETURNS TABLE (
  counter_type TEXT,
  entity_id UUID,
  counter_name TEXT,
  expected_value NUMERIC,
  actual_value NUMERIC,
  details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_follows BOOLEAN := to_regclass('public.follows') IS NOT NULL;
  v_has_group_members BOOLEAN := to_regclass('public.group_members') IS NOT NULL;
  v_has_content_relationships BOOLEAN := to_regclass('public.content_relationships') IS NOT NULL;
  v_user RECORD;
  v_stats JSONB;
  v_post_count BIGINT := 0;
  v_event_count BIGINT := 0;
  v_comment_count BIGINT := 0;
  v_follower_count BIGINT := 0;
  v_following_count BIGINT := 0;
  v_group_count BIGINT := 0;
  v_citation_count BIGINT := 0;
  v_epistemic_reach NUMERIC := 0;
  
  -- For epistemic reach calculation
  v_supports_received BIGINT := 0;
  v_derived_from_received BIGINT := 0;
  v_contradicts_received BIGINT := 0;
  v_other_relationships BIGINT := 0;
  v_forks_received BIGINT := 0;
BEGIN
  -- Posts: vote_count should equal SUM(post_votes.value)
  RETURN QUERY
  SELECT
    'post_vote_count'::text,
    p.id,
    'vote_count'::text,
    COALESCE(SUM(pv.value), 0)::numeric,
    COALESCE(p.vote_count, 0)::numeric,
    jsonb_build_object('post_id', p.id)
  FROM posts p
  LEFT JOIN post_votes pv ON pv.post_id = p.id
  GROUP BY p.id, p.vote_count
  HAVING COALESCE(SUM(pv.value), 0) <> COALESCE(p.vote_count, 0);

  -- Polls: total_votes should equal COUNT(poll_votes)
  RETURN QUERY
  SELECT
    'poll_total_votes'::text,
    p.id,
    'total_votes'::text,
    COUNT(v.*)::numeric,
    COALESCE(p.total_votes, 0)::numeric,
    jsonb_build_object('poll_id', p.id)
  FROM polls p
  LEFT JOIN poll_votes v ON v.poll_id = p.id
  GROUP BY p.id, p.total_votes
  HAVING COUNT(v.*) <> COALESCE(p.total_votes, 0);

  -- Polls: each option vote_count should match votes referencing that option id
  RETURN QUERY
  SELECT
    'poll_option_votes'::text,
    p.id,
    'option_vote_count'::text,
    expected.expected_count::numeric,
    actual.actual_count::numeric,
    jsonb_build_object('poll_id', p.id, 'option_id', opt->>'id')
  FROM polls p
  CROSS JOIN LATERAL jsonb_array_elements(p.options) opt
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::int AS expected_count
    FROM poll_votes v
    WHERE v.poll_id = p.id
      AND opt->>'id' = ANY(v.option_ids)
  ) expected ON true
  LEFT JOIN LATERAL (
    SELECT COALESCE((opt->>'vote_count')::int, 0) AS actual_count
  ) actual ON true
  WHERE expected.expected_count <> actual.actual_count;

  -- Research gaps: upvote_count should equal COUNT(research_gap_upvotes)
  RETURN QUERY
  SELECT
    'research_gap_upvotes'::text,
    g.id,
    'upvote_count'::text,
    COUNT(u.*)::numeric,
    COALESCE(g.upvote_count, 0)::numeric,
    jsonb_build_object('gap_id', g.id)
  FROM research_gaps g
  LEFT JOIN research_gap_upvotes u ON u.gap_id = g.id
  GROUP BY g.id, g.upvote_count
  HAVING COUNT(u.*) <> COALESCE(g.upvote_count, 0);

  -- User stats: compare get_user_stats() output against base-table aggregates
  -- USING THE CORRECT LOGIC: post_count excludes events AND traces (only article, question, answer)
  FOR v_user IN SELECT id FROM users LOOP
    -- Post count: only research posts (article, question, answer, or null)
    SELECT COUNT(*) INTO v_post_count
    FROM posts
    WHERE author_id = v_user.id
      AND status = 'published'
      AND (content_type IS NULL OR content_type IN ('article', 'question', 'answer'));

    -- Event count: only events
    SELECT COUNT(*) INTO v_event_count
    FROM posts
    WHERE author_id = v_user.id
      AND status = 'published'
      AND content_type = 'event';

    SELECT COUNT(*) INTO v_comment_count FROM comments WHERE user_id = v_user.id;

    IF v_has_follows THEN
      SELECT COUNT(*) INTO v_follower_count FROM follows WHERE following_id = v_user.id;
      SELECT COUNT(*) INTO v_following_count FROM follows WHERE follower_id = v_user.id;
    ELSE
      v_follower_count := 0;
      v_following_count := 0;
    END IF;

    IF v_has_group_members THEN
      SELECT COUNT(*) INTO v_group_count FROM group_members WHERE user_id = v_user.id;
    ELSE
      v_group_count := 0;
    END IF;

    -- Citation count
    SELECT COUNT(*) INTO v_citation_count
    FROM citations c
    JOIN posts p ON p.id = c.target_post_id
    WHERE p.author_id = v_user.id;

    -- Calculate Epistemic Reach (same formula as get_user_stats)
    v_supports_received := 0;
    v_derived_from_received := 0;
    v_contradicts_received := 0;
    v_other_relationships := 0;
    v_forks_received := 0;
    
    IF v_has_content_relationships THEN
      SELECT 
        COALESCE(SUM(CASE WHEN cr.relationship = 'supports' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN cr.relationship = 'derived_from' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN cr.relationship = 'contradicts' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN cr.relationship NOT IN ('supports', 'derived_from', 'contradicts') THEN 1 ELSE 0 END), 0)
      INTO v_supports_received, v_derived_from_received, v_contradicts_received, v_other_relationships
      FROM content_relationships cr
      JOIN posts p ON p.id = cr.target_id AND cr.target_type = 'post'
      WHERE p.author_id = v_user.id;
    END IF;
    
    -- Count forks using forked_from_id column (not forked_from)
    SELECT COUNT(*) INTO v_forks_received
    FROM posts p
    WHERE p.forked_from_id IN (SELECT id FROM posts WHERE author_id = v_user.id);
    
    v_epistemic_reach := ROUND(
      (v_supports_received * 1.0) + 
      (v_derived_from_received * 2.0) + 
      (v_contradicts_received * 0.5) + 
      (v_other_relationships * 0.25) +
      (v_forks_received * 1.5) +
      (v_citation_count * 0.5),
      1
    );

    v_stats := get_user_stats(v_user.id);

    IF v_post_count <> COALESCE((v_stats->>'post_count')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'post_count',
        v_post_count::numeric, COALESCE((v_stats->>'post_count')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;

    IF v_event_count <> COALESCE((v_stats->>'event_count')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'event_count',
        v_event_count::numeric, COALESCE((v_stats->>'event_count')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;

    IF v_comment_count <> COALESCE((v_stats->>'comment_count')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'comment_count',
        v_comment_count::numeric, COALESCE((v_stats->>'comment_count')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;

    IF v_follower_count <> COALESCE((v_stats->>'follower_count')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'follower_count',
        v_follower_count::numeric, COALESCE((v_stats->>'follower_count')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;

    IF v_following_count <> COALESCE((v_stats->>'following_count')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'following_count',
        v_following_count::numeric, COALESCE((v_stats->>'following_count')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;

    IF v_group_count <> COALESCE((v_stats->>'group_count')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'group_count',
        v_group_count::numeric, COALESCE((v_stats->>'group_count')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;

    -- Check citation_count
    IF v_citation_count <> COALESCE((v_stats->>'citation_count')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'citation_count',
        v_citation_count::numeric, COALESCE((v_stats->>'citation_count')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;

    -- Check epistemic_reach
    IF v_epistemic_reach <> COALESCE((v_stats->>'epistemic_reach')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'epistemic_reach',
        v_epistemic_reach::numeric, COALESCE((v_stats->>'epistemic_reach')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;

    -- Also check academic_impact (should equal epistemic_reach)
    IF v_epistemic_reach <> COALESCE((v_stats->>'academic_impact')::numeric, 0) THEN
      RETURN QUERY SELECT 'user_stats', v_user.id, 'academic_impact',
        v_epistemic_reach::numeric, COALESCE((v_stats->>'academic_impact')::numeric, 0),
        jsonb_build_object('user_id', v_user.id);
    END IF;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION audit_counter_mismatches() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION audit_counter_mismatches() TO service_role;
COMMENT ON FUNCTION audit_counter_mismatches() IS 'Returns rows for any mismatched derived counters. Uses Epistemic Reach formula for academic_impact and forked_from_id column.';
