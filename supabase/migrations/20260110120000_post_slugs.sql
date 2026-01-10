-- Post Slugs Migration
-- Adds slug support to posts for SEO-friendly URLs
-- Pattern: [short-title]-[YYYYMMDD]-[hash6]

-- Step 1: Add columns (no unique constraint yet to allow safe backfill)
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS short_title TEXT,
ADD COLUMN IF NOT EXISTS slug TEXT;

COMMENT ON COLUMN public.posts.short_title IS 'Sanitized short title for slug generation';
COMMENT ON COLUMN public.posts.slug IS 'SEO-friendly URL slug: [title]-[date]-[hash]';

-- Step 2: Create index for slug lookups (not unique yet)
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug) WHERE slug IS NOT NULL;

-- Step 3: Function to generate post slug (server-side fallback)
CREATE OR REPLACE FUNCTION generate_post_slug(p_post_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_post RECORD;
  v_slug TEXT;
  v_hash TEXT;
  v_date TEXT;
  v_title TEXT;
BEGIN
  -- Fetch post
  SELECT title, content_type, created_at, slug INTO v_post 
  FROM posts WHERE id = p_post_id;
  
  IF NOT FOUND THEN RETURN NULL; END IF;
  
  -- If slug already exists, return it (immutable)
  IF v_post.slug IS NOT NULL AND v_post.slug != '' THEN
    RETURN v_post.slug;
  END IF;
  
  -- Generate hash from UUID (last 6 chars)
  v_hash := substring(replace(p_post_id::text, '-', '') from 27 for 6);
  
  -- Format date as YYYYMMDD
  v_date := to_char(v_post.created_at, 'YYYYMMDD');
  
  -- Clean title: lowercase, replace non-alphanumeric with dashes, limit length
  v_title := lower(regexp_replace(v_post.title, '[^a-zA-Z0-9\u0600-\u06FF]+', '-', 'g'));
  v_title := substring(v_title from 1 for 50);
  v_title := trim(both '-' from v_title);
  
  -- Build final slug
  v_slug := v_title || '-' || v_date || '-' || v_hash;
  
  -- Update the post with the generated slug
  UPDATE posts SET slug = v_slug, short_title = v_title WHERE id = p_post_id;
  
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: RPC to get or generate post slug (for lazy backfill)
CREATE OR REPLACE FUNCTION get_post_slug(p_post_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
BEGIN
  -- Try to get existing slug
  SELECT slug INTO v_slug FROM posts WHERE id = p_post_id;
  
  -- If no slug, generate one
  IF v_slug IS NULL OR v_slug = '' THEN
    v_slug := generate_post_slug(p_post_id);
  END IF;
  
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_post_slug(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_post_slug(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_post_slug(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_post_slug(UUID) TO anon;
