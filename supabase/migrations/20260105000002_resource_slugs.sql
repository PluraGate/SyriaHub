-- ============================================
-- RESOURCE SLUG SYSTEM
-- ============================================
-- Adds canonical slugs and short titles for resources
-- Slugs are immutable after publish, human-readable, and URL-safe

-- ============================================
-- 1. ADD SLUG AND SHORT_TITLE COLUMNS
-- ============================================

-- short_title: User-editable identifier (before publish only)
-- Used for search, debugging, analytics, and slug generation
ALTER TABLE posts ADD COLUMN IF NOT EXISTS short_title TEXT;

-- slug: Canonical URL identifier (immutable after publish)
-- Format: [type]-[discipline]-[short-title]-[YYYYMMDD]-[hash6]
ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug (allowing NULL for non-resource posts)
CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_unique_idx 
  ON posts(slug) 
  WHERE slug IS NOT NULL;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug) WHERE slug IS NOT NULL;

-- Create index for short_title search
CREATE INDEX IF NOT EXISTS posts_short_title_idx ON posts(short_title) WHERE short_title IS NOT NULL;

-- ============================================
-- 2. SLUG GENERATION FUNCTION
-- ============================================
-- Server-side slug generation for lazy backfill
-- Mirrors the TypeScript implementation

CREATE OR REPLACE FUNCTION generate_resource_slug(
  p_resource_type TEXT,
  p_discipline TEXT,
  p_short_title TEXT,
  p_created_at TIMESTAMP WITH TIME ZONE,
  p_uuid UUID
)
RETURNS TEXT AS $$
DECLARE
  v_type TEXT;
  v_disc TEXT;
  v_title TEXT;
  v_date TEXT;
  v_hash TEXT;
BEGIN
  -- Validate and default resource type
  IF p_resource_type IN ('dataset', 'paper', 'tool', 'media', 'template') THEN
    v_type := p_resource_type;
  ELSE
    v_type := 'resource';
  END IF;
  
  -- Sanitize discipline (basic mapping)
  v_disc := LOWER(COALESCE(p_discipline, 'general'));
  v_disc := CASE v_disc
    WHEN 'cultural heritage' THEN 'heritage'
    WHEN 'cultural-heritage' THEN 'heritage'
    WHEN 'legal' THEN 'law'
    WHEN 'legal studies' THEN 'law'
    WHEN 'human rights' THEN 'rights'
    WHEN 'human-rights' THEN 'rights'
    WHEN 'urban planning' THEN 'urban'
    WHEN 'urban-planning' THEN 'urban'
    ELSE REGEXP_REPLACE(LOWER(v_disc), '[^a-z0-9-]', '', 'g')
  END;
  IF v_disc = '' THEN v_disc := 'general'; END IF;
  
  -- Sanitize short title
  v_title := LOWER(COALESCE(p_short_title, 'untitled'));
  v_title := REGEXP_REPLACE(v_title, '[^a-z0-9\s-]', '', 'g');
  v_title := REGEXP_REPLACE(v_title, '\s+', '-', 'g');
  v_title := REGEXP_REPLACE(v_title, '-+', '-', 'g');
  v_title := TRIM(BOTH '-' FROM v_title);
  v_title := LEFT(v_title, 50);
  IF v_title = '' THEN v_title := 'untitled'; END IF;
  
  -- Format date as YYYYMMDD
  v_date := TO_CHAR(p_created_at, 'YYYYMMDD');
  
  -- Extract last 6 chars of UUID (without dashes)
  v_hash := RIGHT(REPLACE(p_uuid::TEXT, '-', ''), 6);
  
  RETURN v_type || '-' || v_disc || '-' || v_title || '-' || v_date || '-' || v_hash;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 3. LAZY BACKFILL FUNCTION
-- ============================================
-- Called when a resource is accessed without a slug
-- Generates and persists the slug once

CREATE OR REPLACE FUNCTION backfill_resource_slug(p_post_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_post RECORD;
  v_slug TEXT;
  v_discipline TEXT;
  v_short_title TEXT;
BEGIN
  -- Get post data
  SELECT id, title, content_type, metadata, created_at, slug, short_title
  INTO v_post
  FROM posts
  WHERE id = p_post_id AND content_type = 'resource';
  
  -- If not a resource or already has slug, return existing
  IF v_post IS NULL THEN
    RETURN NULL;
  END IF;
  
  IF v_post.slug IS NOT NULL THEN
    RETURN v_post.slug;
  END IF;
  
  -- Extract discipline from first tag (if available)
  SELECT t.discipline INTO v_discipline
  FROM posts p
  CROSS JOIN LATERAL unnest(p.tags) AS tag
  JOIN tags t ON t.label = tag
  WHERE p.id = p_post_id AND t.discipline IS NOT NULL
  LIMIT 1;
  
  -- Use existing short_title or generate from title
  v_short_title := COALESCE(v_post.short_title, v_post.title);
  
  -- Generate slug
  v_slug := generate_resource_slug(
    v_post.metadata->>'resource_type',
    v_discipline,
    v_short_title,
    v_post.created_at,
    v_post.id
  );
  
  -- Persist slug and short_title (if not set)
  UPDATE posts
  SET 
    slug = v_slug,
    short_title = COALESCE(short_title, REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(LOWER(v_post.title), '[^a-z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    ))
  WHERE id = p_post_id AND slug IS NULL;
  
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. LOOKUP FUNCTIONS
-- ============================================

-- Get resource by slug
CREATE OR REPLACE FUNCTION get_resource_by_slug(p_slug TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  short_title TEXT,
  slug TEXT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  author_id UUID,
  author_name TEXT,
  author_email TEXT,
  author_avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.content,
    p.short_title,
    p.slug,
    p.tags,
    p.metadata,
    p.created_at,
    p.author_id,
    u.name AS author_name,
    u.email AS author_email,
    u.avatar_url AS author_avatar_url
  FROM posts p
  LEFT JOIN users u ON p.author_id = u.id
  WHERE p.slug = p_slug
    AND p.content_type = 'resource'
    AND p.status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get slug for a resource UUID (with lazy backfill)
CREATE OR REPLACE FUNCTION get_resource_slug(p_post_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
BEGIN
  -- Try to get existing slug
  SELECT slug INTO v_slug FROM posts WHERE id = p_post_id;
  
  -- If no slug, try to backfill
  IF v_slug IS NULL THEN
    v_slug := backfill_resource_slug(p_post_id);
  END IF;
  
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. COMMENTS
-- ============================================

COMMENT ON COLUMN posts.short_title IS 'User-editable short identifier for resources. Used in slug generation and search.';
COMMENT ON COLUMN posts.slug IS 'Canonical URL-safe identifier for resources. Format: [type]-[discipline]-[short-title]-[YYYYMMDD]-[hash6]. Immutable after publish.';
COMMENT ON FUNCTION generate_resource_slug IS 'Generates a canonical slug for a resource post.';
COMMENT ON FUNCTION backfill_resource_slug IS 'Lazily generates and persists a slug for existing resources.';
COMMENT ON FUNCTION get_resource_by_slug IS 'Retrieves a resource by its canonical slug.';
COMMENT ON FUNCTION get_resource_slug IS 'Gets slug for a resource, backfilling if necessary.';
