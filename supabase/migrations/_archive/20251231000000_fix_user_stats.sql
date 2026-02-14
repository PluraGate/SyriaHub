-- Fix get_user_stats using dynamic SQL to handle missing tables
-- The function now uses EXECUTE with dynamic SQL to defer table reference
-- validation until runtime, after the EXISTS check passes

DROP FUNCTION IF EXISTS get_user_stats(UUID);

CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  post_count BIGINT,
  comment_count BIGINT,
  citation_count BIGINT,
  group_count BIGINT,
  follower_count BIGINT,
  academic_impact NUMERIC
) AS $$
DECLARE
  v_post_count BIGINT := 0;
  v_comment_count BIGINT := 0;
  v_citation_count BIGINT := 0;
  v_group_count BIGINT := 0;
  v_follower_count BIGINT := 0;
  v_academic_impact NUMERIC := 0;
BEGIN
  -- Posts count
  SELECT COUNT(*) INTO v_post_count FROM posts WHERE author_id = user_uuid AND status = 'published';
  
  -- Comments count
  SELECT COUNT(*) INTO v_comment_count FROM comments WHERE user_id = user_uuid;
  
  -- Citations count
  SELECT COUNT(*) INTO v_citation_count 
  FROM citations c
  JOIN posts p ON c.target_post_id = p.id
  WHERE p.author_id = user_uuid;
  
  -- Group count (only if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_members' AND table_schema = 'public') THEN
    EXECUTE 'SELECT COUNT(*) FROM group_members WHERE user_id = $1' INTO v_group_count USING user_uuid;
  END IF;
  
  -- Follower count (only if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'follows' AND table_schema = 'public') THEN
    EXECUTE 'SELECT COUNT(*) FROM follows WHERE following_id = $1' INTO v_follower_count USING user_uuid;
  END IF;
  
  -- Academic impact
  SELECT COALESCE(SUM(p.academic_impact_score), 0) INTO v_academic_impact
  FROM posts p
  WHERE p.author_id = user_uuid AND p.status = 'published';
  
  RETURN QUERY SELECT v_post_count, v_comment_count, v_citation_count, v_group_count, v_follower_count, v_academic_impact;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
