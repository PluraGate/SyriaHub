-- Fix get_diverse_recommendations to exclude resources from recommendations
-- Resources should only appear in the Resource Library, not in general post recommendations

DROP FUNCTION IF EXISTS get_diverse_recommendations(UUID, INTEGER);

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
  WHERE p.status = 'published'
    AND (p.visibility IS NULL OR p.visibility = 'public')
    AND (p_user_id IS NULL OR p.author_id != p_user_id)
    -- Exclude resources - they have their own section
    AND (p.content_type IS NULL OR p.content_type != 'resource')
  ORDER BY RANDOM()
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION get_diverse_recommendations(UUID, INTEGER) TO anon, authenticated;

COMMENT ON FUNCTION get_diverse_recommendations(UUID, INTEGER) IS 'Get diverse content recommendations, excluding resources which have their own section';
