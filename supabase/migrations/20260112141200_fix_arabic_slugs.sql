-- Fix Arabic Slug Generation
-- Updates generate_post_slug to use DATE-HASH only for non-Latin titles
-- Also adds trigger to auto-generate slugs on post creation

-- Updated generate_post_slug function with Arabic support
-- For titles containing Latin characters: title-date-hash
-- For titles with Arabic/non-Latin characters: date-hash only
CREATE OR REPLACE FUNCTION generate_post_slug(p_post_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_post RECORD;
  v_slug TEXT;
  v_hash TEXT;
  v_date TEXT;
  v_title TEXT;
  v_has_latin BOOLEAN;
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
  
  -- Check if title contains Latin letters (a-z, A-Z)
  v_has_latin := v_post.title ~ '[a-zA-Z]';
  
  IF v_has_latin THEN
    -- Extract only Latin characters for slug
    v_title := lower(regexp_replace(v_post.title, '[^a-zA-Z0-9]+', '-', 'g'));
    v_title := substring(v_title from 1 for 50);
    v_title := trim(both '-' from v_title);
    
    -- If we got a meaningful title, use it
    IF length(v_title) > 2 THEN
      v_slug := v_title || '-' || v_date || '-' || v_hash;
    ELSE
      -- Fallback to date-hash only
      v_slug := v_date || '-' || v_hash;
    END IF;
  ELSE
    -- Arabic/non-Latin titles: use date-hash only
    v_slug := v_date || '-' || v_hash;
  END IF;
  
  -- Update the post with the generated slug
  UPDATE posts SET slug = v_slug, short_title = v_title WHERE id = p_post_id;
  
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_post_slug(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_post_slug(UUID) TO anon;

-- Trigger to auto-generate slug on post insert
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate slug for new posts
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    PERFORM generate_post_slug(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Apply trigger (drop if exists first)
DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON posts;
CREATE TRIGGER trigger_auto_generate_slug
  AFTER INSERT ON posts
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();
