-- ============================================
-- EPISTEMIC IMPACT FORMULA
-- Migration: 20260103201000_epistemic_impact_formula.sql
-- 
-- Purpose: Replace the naive "citations × 10" formula with a 
-- semantically meaningful academic impact calculation that aligns
-- with the platform's epistemic architecture.
--
-- The new formula considers:
-- 1. content_relationships semantic types (supports, contradicts, derived_from)
-- 2. Citation count as fallback
-- 3. Forks (work being reused = high impact)
--
-- Weights (aligned with epistemic value):
--   - supports (corroboration): 1.0
--   - derived_from (building upon): 2.0  -- Highest: your work enables new work
--   - contradicts (engaging discourse): 0.5  -- Still valuable: your work is being discussed
--   - same_site (geographic relevance): 0.25
--   - other relations: 0.25
--   - forks: 1.5 per fork
--   - raw citations (no relationship): 0.5 per citation
-- ============================================

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
  -- (i.e., other content references this user's work)
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
  
  -- Count forks of this user's posts
  SELECT COUNT(*) INTO v_forks_received
  FROM posts 
  WHERE forked_from IS NOT NULL
    AND (forked_from->>'id')::UUID IN (
      SELECT id FROM posts WHERE author_id = user_uuid
    );
  
  -- Calculate Epistemic Reach using weighted formula
  -- Formula: 
  --   (supports × 1.0) + 
  --   (derived_from × 2.0) + 
  --   (contradicts × 0.5) + 
  --   (other_relationships × 0.25) + 
  --   (forks × 1.5) +
  --   (raw_citations × 0.5)  -- Fallback for citations without semantic relationship
  --
  -- Note: We use raw citations as a baseline, but relationships add more weight
  
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

-- Grant permissions
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
