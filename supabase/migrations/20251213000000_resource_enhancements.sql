-- ============================================
-- RESOURCE LIBRARY ENHANCEMENTS
-- ============================================
-- Adds resource types, discipline filtering, and post linking

-- ============================================
-- 1. RESOURCE TYPES
-- ============================================
-- Resource types are stored in the metadata JSONB column
-- Valid types: dataset, paper, tool, media, template

-- Create a helper function to validate resource type
CREATE OR REPLACE FUNCTION is_valid_resource_type(p_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN p_type IS NULL OR p_type IN ('dataset', 'paper', 'tool', 'media', 'template');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 2. RESOURCE-POST LINKS TABLE
-- ============================================
-- Links resources to related posts (bi-directional relationship)

CREATE TABLE IF NOT EXISTS resource_post_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(resource_id, post_id),
  -- Ensure resource_id points to a resource and post_id points to non-resource
  CHECK (resource_id != post_id)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS resource_post_links_resource_id_idx ON resource_post_links(resource_id);
CREATE INDEX IF NOT EXISTS resource_post_links_post_id_idx ON resource_post_links(post_id);

-- Enable RLS
ALTER TABLE resource_post_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view resource links" ON resource_post_links
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create resource links" ON resource_post_links
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Resource owners can delete links" ON resource_post_links
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = resource_post_links.resource_id 
      AND posts.author_id = auth.uid()
    )
  );

-- ============================================
-- 3. FILTERED RESOURCES FUNCTION
-- ============================================
-- Returns resources with filtering by type, discipline, license, and search

CREATE OR REPLACE FUNCTION get_filtered_resources(
  filter_type TEXT DEFAULT NULL,
  filter_discipline TEXT DEFAULT NULL,
  filter_license TEXT DEFAULT NULL,
  search_query TEXT DEFAULT NULL,
  sort_by TEXT DEFAULT 'date',
  page_limit INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  author_id UUID,
  author_name TEXT,
  author_email TEXT,
  linked_posts_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.content,
    p.tags,
    p.metadata,
    p.created_at,
    p.author_id,
    u.name AS author_name,
    u.email AS author_email,
    COALESCE(lc.link_count, 0) AS linked_posts_count
  FROM posts p
  LEFT JOIN users u ON p.author_id = u.id
  LEFT JOIN (
    SELECT resource_id, COUNT(*) AS link_count
    FROM resource_post_links
    GROUP BY resource_id
  ) lc ON p.id = lc.resource_id
  WHERE 
    p.content_type = 'resource'
    AND p.status = 'published'
    -- Filter by resource type (stored in metadata->resource_type)
    AND (filter_type IS NULL OR p.metadata->>'resource_type' = filter_type)
    -- Filter by discipline (check if any tag matches the discipline)
    AND (filter_discipline IS NULL OR EXISTS (
      SELECT 1 FROM unnest(p.tags) AS tag
      JOIN tags t ON t.label = tag
      WHERE t.discipline = filter_discipline
    ))
    -- Filter by license (stored in metadata->license)
    AND (filter_license IS NULL OR p.metadata->>'license' = filter_license)
    -- Search in title and content
    AND (search_query IS NULL OR search_query = '' OR (
      to_tsvector('english', p.title) || 
      to_tsvector('english', p.content)
    ) @@ websearch_to_tsquery('english', search_query))
  ORDER BY
    CASE WHEN sort_by = 'date' THEN p.created_at END DESC,
    CASE WHEN sort_by = 'downloads' THEN (p.metadata->>'downloads')::INTEGER END DESC NULLS LAST,
    CASE WHEN sort_by = 'title' THEN p.title END ASC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. COUNT FILTERED RESOURCES FUNCTION
-- ============================================
-- Returns total count for pagination

CREATE OR REPLACE FUNCTION count_filtered_resources(
  filter_type TEXT DEFAULT NULL,
  filter_discipline TEXT DEFAULT NULL,
  filter_license TEXT DEFAULT NULL,
  search_query TEXT DEFAULT NULL
)
RETURNS BIGINT AS $$
DECLARE
  total_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM posts p
  WHERE 
    p.content_type = 'resource'
    AND p.status = 'published'
    AND (filter_type IS NULL OR p.metadata->>'resource_type' = filter_type)
    AND (filter_discipline IS NULL OR EXISTS (
      SELECT 1 FROM unnest(p.tags) AS tag
      JOIN tags t ON t.label = tag
      WHERE t.discipline = filter_discipline
    ))
    AND (filter_license IS NULL OR p.metadata->>'license' = filter_license)
    AND (search_query IS NULL OR search_query = '' OR (
      to_tsvector('english', p.title) || 
      to_tsvector('english', p.content)
    ) @@ websearch_to_tsquery('english', search_query));
  
  RETURN total_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. GET AVAILABLE DISCIPLINES FUNCTION
-- ============================================
-- Returns disciplines that have resources

CREATE OR REPLACE FUNCTION get_resource_disciplines()
RETURNS TABLE (
  discipline TEXT,
  resource_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.discipline,
    COUNT(DISTINCT p.id) AS resource_count
  FROM posts p
  CROSS JOIN unnest(p.tags) AS tag
  JOIN tags t ON t.label = tag
  WHERE 
    p.content_type = 'resource'
    AND p.status = 'published'
    AND t.discipline IS NOT NULL
  GROUP BY t.discipline
  ORDER BY resource_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. GET RESOURCES LINKED TO A POST
-- ============================================

CREATE OR REPLACE FUNCTION get_post_resources(p_post_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.metadata,
    p.created_at
  FROM posts p
  JOIN resource_post_links rpl ON p.id = rpl.resource_id
  WHERE rpl.post_id = p_post_id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. GET POSTS USING A RESOURCE
-- ============================================

CREATE OR REPLACE FUNCTION get_resource_posts(p_resource_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  author_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.content_type,
    p.created_at,
    u.name AS author_name
  FROM posts p
  JOIN resource_post_links rpl ON p.id = rpl.post_id
  LEFT JOIN users u ON p.author_id = u.id
  WHERE rpl.resource_id = p_resource_id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
