-- Enable pg_trgm for fuzzy search capabilities (optional, but good to have)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create a type for search results to ensure consistency
CREATE TYPE search_result AS (
  id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  rank REAL
);

-- Create the search function
CREATE OR REPLACE FUNCTION search_content(query TEXT)
RETURNS SETOF search_result AS $$
BEGIN
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
    (
      to_tsvector('english', u.name) ||
      to_tsvector('english', COALESCE(u.bio, ''))
    ) @@ websearch_to_tsquery('english', query)

  ORDER BY rank DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
