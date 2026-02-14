-- Update search function to support filters
CREATE OR REPLACE FUNCTION search_content(
  query TEXT,
  filter_type TEXT DEFAULT NULL,
  filter_tag TEXT DEFAULT NULL,
  filter_date TEXT DEFAULT NULL
)
RETURNS SETOF search_result AS $$
DECLARE
  date_limit TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate date limit based on filter
  IF filter_date = 'today' THEN
    date_limit := NOW() - INTERVAL '1 day';
  ELSIF filter_date = 'week' THEN
    date_limit := NOW() - INTERVAL '1 week';
  ELSIF filter_date = 'month' THEN
    date_limit := NOW() - INTERVAL '1 month';
  ELSIF filter_date = 'year' THEN
    date_limit := NOW() - INTERVAL '1 year';
  ELSE
    date_limit := NULL;
  END IF;

  RETURN QUERY
  -- Search Posts
  SELECT
    p.id,
    'post'::TEXT as type,
    p.title,
    substring(p.content from 1 for 200) as description,
    '/post/' || p.id as url,
    p.created_at,
    ts_rank(
      setweight(to_tsvector('english', p.title), 'A') ||
      setweight(to_tsvector('english', p.content), 'B'),
      websearch_to_tsquery('english', query)
    ) as rank
  FROM posts p
  WHERE
    p.status = 'published' AND
    (filter_type IS NULL OR filter_type = 'post') AND
    (filter_tag IS NULL OR filter_tag = ANY(p.tags)) AND
    (date_limit IS NULL OR p.created_at >= date_limit) AND
    (
      to_tsvector('english', p.title) ||
      to_tsvector('english', p.content)
    ) @@ websearch_to_tsquery('english', query)

  UNION ALL

  -- Search Groups
  SELECT
    g.id,
    'group'::TEXT as type,
    g.name as title,
    g.description,
    '/groups/' || g.id as url,
    g.created_at,
    ts_rank(
      setweight(to_tsvector('english', g.name), 'A') ||
      setweight(to_tsvector('english', COALESCE(g.description, '')), 'B'),
      websearch_to_tsquery('english', query)
    ) as rank
  FROM groups g
  WHERE
    g.visibility = 'public' AND
    (filter_type IS NULL OR filter_type = 'group') AND
    (filter_tag IS NULL) AND -- Groups don't have tags yet
    (date_limit IS NULL OR g.created_at >= date_limit) AND
    (
      to_tsvector('english', g.name) ||
      to_tsvector('english', COALESCE(g.description, ''))
    ) @@ websearch_to_tsquery('english', query)

  UNION ALL

  -- Search Users
  SELECT
    u.id,
    'user'::TEXT as type,
    u.name as title,
    COALESCE(u.bio, u.affiliation, '') as description,
    '/profile/' || u.id as url,
    u.created_at,
    ts_rank(
      setweight(to_tsvector('english', u.name), 'A') ||
      setweight(to_tsvector('english', COALESCE(u.bio, '')), 'B'),
      websearch_to_tsquery('english', query)
    ) as rank
  FROM users u
  WHERE
    (filter_type IS NULL OR filter_type = 'user') AND
    (filter_tag IS NULL) AND -- Users don't have tags
    (date_limit IS NULL OR u.created_at >= date_limit) AND
    (
      to_tsvector('english', u.name) ||
      to_tsvector('english', COALESCE(u.bio, ''))
    ) @@ websearch_to_tsquery('english', query)

  ORDER BY rank DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
