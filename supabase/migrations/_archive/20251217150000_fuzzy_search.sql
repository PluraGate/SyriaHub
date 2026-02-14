-- Fuzzy Search Enhancement
-- Migration: 20251217150000_fuzzy_search.sql
-- Purpose: Add fuzzy/semantic search capabilities using pg_trgm

-- ============================================
-- ENSURE pg_trgm IS ENABLED
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- CREATE GIN INDEXES FOR TRIGRAM SEARCH
-- ============================================

-- Index on posts for fuzzy title search
CREATE INDEX IF NOT EXISTS idx_posts_title_trgm 
ON posts USING GIN (title gin_trgm_ops);

-- Index on posts for fuzzy content search (first 1000 chars for performance)
CREATE INDEX IF NOT EXISTS idx_posts_content_trgm 
ON posts USING GIN (left(content, 1000) gin_trgm_ops);

-- Index on users for fuzzy name search
CREATE INDEX IF NOT EXISTS idx_users_name_trgm 
ON users USING GIN (name gin_trgm_ops);

-- Index on groups for fuzzy name search
CREATE INDEX IF NOT EXISTS idx_groups_name_trgm 
ON groups USING GIN (name gin_trgm_ops);

-- ============================================
-- FUZZY SEARCH FUNCTION
-- Combines trigram similarity with ILIKE fallback
-- ============================================

CREATE OR REPLACE FUNCTION fuzzy_search_content(
  p_query TEXT,
  p_filter_type TEXT DEFAULT NULL,
  p_filter_tag TEXT DEFAULT NULL,
  p_filter_date TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  url TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
DECLARE
  v_date_limit TIMESTAMPTZ;
  v_normalized_query TEXT;
BEGIN
  -- Normalize query: remove hyphens and special chars for better matching
  v_normalized_query := regexp_replace(p_query, '[^a-zA-Z0-9\u0600-\u06FF\s]', ' ', 'g');
  v_normalized_query := regexp_replace(v_normalized_query, '\s+', ' ', 'g');
  v_normalized_query := trim(v_normalized_query);

  -- Calculate date limit based on filter
  IF p_filter_date = 'today' THEN
    v_date_limit := NOW() - INTERVAL '1 day';
  ELSIF p_filter_date = 'week' THEN
    v_date_limit := NOW() - INTERVAL '1 week';
  ELSIF p_filter_date = 'month' THEN
    v_date_limit := NOW() - INTERVAL '1 month';
  ELSIF p_filter_date = 'year' THEN
    v_date_limit := NOW() - INTERVAL '1 year';
  ELSE
    v_date_limit := NULL;
  END IF;

  RETURN QUERY
  -- Search Posts with fuzzy matching
  SELECT
    p.id,
    'post'::TEXT as type,
    p.title,
    substring(p.content from 1 for 200) as description,
    '/post/' || p.id::TEXT as url,
    p.created_at,
    (
      -- Trigram similarity on title (weighted higher)
      COALESCE(similarity(p.title, v_normalized_query), 0) * 2.0 +
      -- Trigram similarity on content
      COALESCE(similarity(left(p.content, 1000), v_normalized_query), 0) * 0.5 +
      -- Bonus for ILIKE match
      CASE WHEN p.title ILIKE '%' || v_normalized_query || '%' THEN 1.0 ELSE 0.0 END +
      CASE WHEN p.content ILIKE '%' || v_normalized_query || '%' THEN 0.5 ELSE 0.0 END
    )::REAL as rank
  FROM posts p
  WHERE
    p.status = 'published' AND
    (p_filter_type IS NULL OR p_filter_type = '' OR p_filter_type = 'post') AND
    (p_filter_tag IS NULL OR p_filter_tag = '' OR p_filter_tag = ANY(p.tags)) AND
    (v_date_limit IS NULL OR p.created_at >= v_date_limit) AND
    (
      -- Match if trigram similarity is above threshold
      similarity(p.title, v_normalized_query) > 0.1 OR
      similarity(left(p.content, 1000), v_normalized_query) > 0.1 OR
      -- Or if ILIKE matches
      p.title ILIKE '%' || v_normalized_query || '%' OR
      p.content ILIKE '%' || v_normalized_query || '%' OR
      -- Or match individual words
      EXISTS (
        SELECT 1 FROM unnest(string_to_array(v_normalized_query, ' ')) AS word
        WHERE p.title ILIKE '%' || word || '%' OR p.content ILIKE '%' || word || '%'
      )
    )

  UNION ALL

  -- Search Groups with fuzzy matching
  SELECT
    g.id,
    'group'::TEXT as type,
    g.name as title,
    g.description,
    '/groups/' || g.id::TEXT as url,
    g.created_at,
    (
      COALESCE(similarity(g.name, v_normalized_query), 0) * 2.0 +
      COALESCE(similarity(COALESCE(g.description, ''), v_normalized_query), 0) * 0.5 +
      CASE WHEN g.name ILIKE '%' || v_normalized_query || '%' THEN 1.0 ELSE 0.0 END
    )::REAL as rank
  FROM groups g
  WHERE
    g.visibility = 'public' AND
    (p_filter_type IS NULL OR p_filter_type = '' OR p_filter_type = 'group') AND
    (v_date_limit IS NULL OR g.created_at >= v_date_limit) AND
    (
      similarity(g.name, v_normalized_query) > 0.1 OR
      similarity(COALESCE(g.description, ''), v_normalized_query) > 0.1 OR
      g.name ILIKE '%' || v_normalized_query || '%' OR
      g.description ILIKE '%' || v_normalized_query || '%'
    )

  UNION ALL

  -- Search Users with fuzzy matching
  SELECT
    u.id,
    'user'::TEXT as type,
    u.name as title,
    COALESCE(u.bio, u.affiliation, '') as description,
    '/profile/' || u.id::TEXT as url,
    u.created_at,
    (
      COALESCE(similarity(u.name, v_normalized_query), 0) * 2.0 +
      COALESCE(similarity(COALESCE(u.bio, ''), v_normalized_query), 0) * 0.5 +
      CASE WHEN u.name ILIKE '%' || v_normalized_query || '%' THEN 1.0 ELSE 0.0 END
    )::REAL as rank
  FROM users u
  WHERE
    (p_filter_type IS NULL OR p_filter_type = '' OR p_filter_type = 'user') AND
    (v_date_limit IS NULL OR u.created_at >= v_date_limit) AND
    (
      similarity(u.name, v_normalized_query) > 0.1 OR
      similarity(COALESCE(u.bio, ''), v_normalized_query) > 0.1 OR
      u.name ILIKE '%' || v_normalized_query || '%' OR
      u.bio ILIKE '%' || v_normalized_query || '%'
    )

  UNION ALL

  -- Search Events (stored in posts with content_type='event')
  SELECT
    ep.id,
    'event'::TEXT as type,
    ep.title,
    substring(COALESCE(ep.content, '') from 1 for 200) as description,
    '/events/' || ep.id::TEXT as url,
    ep.created_at,
    (
      COALESCE(similarity(ep.title, v_normalized_query), 0) * 2.0 +
      COALESCE(similarity(COALESCE(ep.content, ''), v_normalized_query), 0) * 0.5 +
      CASE WHEN ep.title ILIKE '%' || v_normalized_query || '%' THEN 1.0 ELSE 0.0 END
    )::REAL as rank
  FROM posts ep
  WHERE
    ep.status = 'published' AND
    ep.content_type = 'event' AND
    (p_filter_type IS NULL OR p_filter_type = '' OR p_filter_type = 'event') AND
    (v_date_limit IS NULL OR ep.created_at >= v_date_limit) AND
    (
      similarity(ep.title, v_normalized_query) > 0.1 OR
      similarity(COALESCE(ep.content, ''), v_normalized_query) > 0.1 OR
      ep.title ILIKE '%' || v_normalized_query || '%' OR
      ep.content ILIKE '%' || v_normalized_query || '%'
    )

  ORDER BY rank DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- SEARCH SUGGESTIONS FUNCTION
-- Fast suggestions for autocomplete
-- ============================================

CREATE OR REPLACE FUNCTION get_search_suggestions(
  p_query TEXT,
  p_limit INT DEFAULT 8
)
RETURNS TABLE(
  id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  url TEXT
) AS $$
DECLARE
  v_normalized_query TEXT;
BEGIN
  -- Normalize query
  v_normalized_query := regexp_replace(p_query, '[^a-zA-Z0-9\u0600-\u06FF\s]', ' ', 'g');
  v_normalized_query := trim(v_normalized_query);

  IF length(v_normalized_query) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH suggestions AS (
    -- Posts (most likely what users search for)
    SELECT
      p.id,
      'post'::TEXT as type,
      p.title,
      substring(p.content from 1 for 80) as description,
      '/post/' || p.id::TEXT as url,
      (similarity(p.title, v_normalized_query) * 2 + 
       CASE WHEN p.title ILIKE v_normalized_query || '%' THEN 1.0 ELSE 0.0 END) as score
    FROM posts p
    WHERE p.status = 'published'
    AND (
      similarity(p.title, v_normalized_query) > 0.15 OR
      p.title ILIKE v_normalized_query || '%' OR
      p.title ILIKE '%' || v_normalized_query || '%'
    )
    
    UNION ALL
    
    -- Users
    SELECT
      u.id,
      'user'::TEXT as type,
      u.name as title,
      COALESCE(u.affiliation, u.bio, '')::TEXT as description,
      '/profile/' || u.id::TEXT as url,
      (similarity(u.name, v_normalized_query) * 2 + 
       CASE WHEN u.name ILIKE v_normalized_query || '%' THEN 1.0 ELSE 0.0 END) as score
    FROM users u
    WHERE 
      similarity(u.name, v_normalized_query) > 0.15 OR
      u.name ILIKE v_normalized_query || '%' OR
      u.name ILIKE '%' || v_normalized_query || '%'
    
    UNION ALL
    
    -- Groups
    SELECT
      g.id,
      'group'::TEXT as type,
      g.name as title,
      substring(COALESCE(g.description, '') from 1 for 80) as description,
      '/groups/' || g.id::TEXT as url,
      (similarity(g.name, v_normalized_query) * 2 + 
       CASE WHEN g.name ILIKE v_normalized_query || '%' THEN 1.0 ELSE 0.0 END) as score
    FROM groups g
    WHERE g.visibility = 'public'
    AND (
      similarity(g.name, v_normalized_query) > 0.15 OR
      g.name ILIKE v_normalized_query || '%' OR
      g.name ILIKE '%' || v_normalized_query || '%'
    )
    
    UNION ALL
    
    -- Events (stored in posts with content_type='event')
    SELECT
      p.id,
      'event'::TEXT as type,
      p.title,
      substring(COALESCE(p.content, '') from 1 for 80) as description,
      '/events/' || p.id::TEXT as url,
      (similarity(p.title, v_normalized_query) * 2 + 
       CASE WHEN p.title ILIKE v_normalized_query || '%' THEN 1.0 ELSE 0.0 END) as score
    FROM posts p
    WHERE p.status = 'published' AND p.content_type = 'event'
    AND (
      similarity(p.title, v_normalized_query) > 0.15 OR
      p.title ILIKE v_normalized_query || '%' OR
      p.title ILIKE '%' || v_normalized_query || '%'
    )
  )
  SELECT s.id, s.type, s.title, s.description, s.url
  FROM suggestions s
  ORDER BY s.score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
