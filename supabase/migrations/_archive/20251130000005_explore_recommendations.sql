-- Function to get trending posts (for now, just recent posts, later can be based on views/likes)
CREATE OR REPLACE FUNCTION get_trending_posts()
RETURNS SETOF posts AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM posts
  WHERE status = 'published'
  ORDER BY created_at DESC
  LIMIT 6;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recommended groups (random for now to show variety)
CREATE OR REPLACE FUNCTION get_recommended_groups()
RETURNS SETOF groups AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM groups
  WHERE visibility = 'public'
  ORDER BY random()
  LIMIT 6;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
