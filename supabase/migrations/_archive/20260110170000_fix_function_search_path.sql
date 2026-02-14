-- Fix Function Search Path Security Warnings
-- Migration: 20260110150000_fix_function_search_path.sql
-- Purpose: Add explicit search_path to SECURITY DEFINER functions to prevent search path injection

-- ============================================
-- FIX: generate_post_slug
-- ============================================
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
  FROM public.posts WHERE id = p_post_id;
  
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
  UPDATE public.posts SET slug = v_slug, short_title = v_title WHERE id = p_post_id;
  
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- ============================================
-- FIX: get_post_slug
-- ============================================
CREATE OR REPLACE FUNCTION get_post_slug(p_post_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
BEGIN
  -- Try to get existing slug
  SELECT slug INTO v_slug FROM public.posts WHERE id = p_post_id;
  
  -- If no slug, generate one
  IF v_slug IS NULL OR v_slug = '' THEN
    v_slug := generate_post_slug(p_post_id);
  END IF;
  
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- ============================================
-- FIX: get_platform_stats
-- ============================================
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSONB AS $$
DECLARE
    contributors_count INTEGER;
    publications_count INTEGER;
    topics_count INTEGER;
BEGIN
    -- Count users who have published at least one post (contributors)
    SELECT COUNT(*) INTO contributors_count FROM public.users;

    -- Count published posts (excluding rejected)
    SELECT COUNT(*) INTO publications_count 
    FROM public.posts 
    WHERE status = 'published' 
    AND (approval_status IS NULL OR approval_status != 'rejected');

    -- Count all tags
    SELECT COUNT(*) INTO topics_count FROM public.tags;

    RETURN jsonb_build_object(
        'contributors', contributors_count,
        'publications', publications_count,
        'contexts', topics_count
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
