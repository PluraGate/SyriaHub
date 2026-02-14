-- ============================================
-- FIX COUNTER AUDIT CONSISTENCY
-- Migration: 20260104001000_fix_counter_audit_consistency.sql
-- 
-- This migration fixes the mismatch between get_user_stats and audit_counter_mismatches
-- by standardizing on the same key names and calculation logic
-- ============================================

-- Update get_user_stats to return 'citations_received' (matching audit expectations)
-- and ensure post_count logic matches the audit function exactly
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
  v_citations_received BIGINT := 0;
  v_epistemic_reach NUMERIC := 0;
  
  -- Relationship-based impact components
  v_supports_received BIGINT := 0;
  v_derived_from_received BIGINT := 0;
  v_contradicts_received BIGINT := 0;
  v_other_relationships BIGINT := 0;
  v_forks_received BIGINT := 0;
BEGIN
  -- Get post count: all published posts EXCEPT events
  -- This matches audit_counter_mismatches logic exactly
  SELECT COUNT(*) INTO v_post_count 
  FROM posts 
  WHERE author_id = user_uuid 
    AND status = 'published'
    AND (content_type IS NULL OR content_type != 'event');
  
  -- Get event count (only published events)
  SELECT COUNT(*) INTO v_event_count
  FROM posts
  WHERE author_id = user_uuid
    AND status = 'published'
    AND content_type = 'event';
  
  -- Get comment count
  SELECT COUNT(*) INTO v_comment_count FROM comments WHERE user_id = user_uuid;
  
  -- Get followers count (with safety check)
  BEGIN
    SELECT COUNT(*) INTO v_follower_count FROM follows WHERE following_id = user_uuid;
  EXCEPTION WHEN undefined_table THEN
    v_follower_count := 0;
  END;
  
  -- Get following count
  BEGIN
    SELECT COUNT(*) INTO v_following_count FROM follows WHERE follower_id = user_uuid;
  EXCEPTION WHEN undefined_table THEN
    v_following_count := 0;
  END;
  
  -- Get group membership count
  BEGIN
    SELECT COUNT(*) INTO v_group_count FROM group_members WHERE user_id = user_uuid;
  EXCEPTION WHEN undefined_table THEN
    v_group_count := 0;
  END;
  
  -- Get citations received
  SELECT COUNT(*) INTO v_citations_received
  FROM citations c
  JOIN posts p ON p.id = c.target_post_id
  WHERE p.author_id = user_uuid;
  
  -- ================================================
  -- EPISTEMIC REACH CALCULATION
  -- ================================================
  
  -- Count relationships by type (with safety check for table existence)
  BEGIN
    SELECT 
      COALESCE(SUM(CASE WHEN cr.relationship::TEXT = 'supports' THEN 1 ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN cr.relationship::TEXT = 'derived_from' THEN 1 ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN cr.relationship::TEXT = 'contradicts' THEN 1 ELSE 0 END), 0),
      COALESCE(SUM(CASE WHEN cr.relationship::TEXT NOT IN ('supports', 'derived_from', 'contradicts') THEN 1 ELSE 0 END), 0)
    INTO v_supports_received, v_derived_from_received, v_contradicts_received, v_other_relationships
    FROM content_relationships cr
    JOIN posts p ON p.id = cr.target_id AND cr.target_type = 'post'
    WHERE p.author_id = user_uuid;
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_supports_received := 0;
    v_derived_from_received := 0;
    v_contradicts_received := 0;
    v_other_relationships := 0;
  END;
  
  -- Count forks of this user's posts
  BEGIN
    SELECT COUNT(*) INTO v_forks_received
    FROM posts 
    WHERE forked_from IS NOT NULL
      AND (forked_from->>'id')::UUID IN (
        SELECT id FROM posts WHERE author_id = user_uuid
      );
  EXCEPTION WHEN OTHERS THEN
    v_forks_received := 0;
  END;
  
  -- Calculate Epistemic Reach using weighted formula
  v_epistemic_reach := 
    (v_supports_received * 1.0) + 
    (v_derived_from_received * 2.0) + 
    (v_contradicts_received * 0.5) + 
    (v_other_relationships * 0.25) +
    (v_forks_received * 1.5) +
    (v_citations_received * 0.5);
  
  -- Round to 1 decimal place
  v_epistemic_reach := ROUND(v_epistemic_reach, 1);
  
  -- Build result with both old and new key names for backward compatibility
  v_result := jsonb_build_object(
    'post_count', v_post_count,
    'event_count', v_event_count,
    'comment_count', v_comment_count,
    'follower_count', v_follower_count,
    'following_count', v_following_count,
    'group_count', v_group_count,
    'citations_received', v_citations_received,
    'citation_count', v_citations_received,  -- Backward compatibility
    'epistemic_reach', v_epistemic_reach,
    'academic_impact', v_citations_received * 10  -- Match audit expectation: citations * 10
  );
  
  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO anon, authenticated;
COMMENT ON FUNCTION get_user_stats(UUID) IS 'Returns user statistics with keys matching audit_counter_mismatches expectations';
