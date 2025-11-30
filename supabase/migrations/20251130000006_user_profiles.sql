-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS research_interests TEXT[] DEFAULT '{}';

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  post_count BIGINT,
  comment_count BIGINT,
  citation_count BIGINT,
  group_count BIGINT
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
    (SELECT COUNT(*) FROM group_members WHERE user_id = user_uuid) as group_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
