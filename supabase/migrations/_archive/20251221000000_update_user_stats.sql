-- Update get_user_stats to include academic_impact aggregate
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  post_count BIGINT,
  comment_count BIGINT,
  citation_count BIGINT,
  group_count BIGINT,
  follower_count BIGINT,
  academic_impact NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM posts WHERE author_id = user_uuid AND status = 'published') as post_count,
    (SELECT COUNT(*) FROM comments WHERE user_id = user_uuid) as comment_count,
    (
      SELECT COUNT(*) 
      FROM citations c
      JOIN posts p ON c.target_post_id = p.id
      WHERE p.author_id = user_uuid
    ) as citation_count,
    (SELECT COUNT(*) FROM group_members WHERE user_id = user_uuid) as group_count,
    (SELECT COUNT(*) FROM follows WHERE following_id = user_uuid) as follower_count,
    (
      SELECT COALESCE(SUM(p.academic_impact_score), 0)
      FROM posts p
      WHERE p.author_id = user_uuid AND p.status = 'published'
    ) as academic_impact;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
