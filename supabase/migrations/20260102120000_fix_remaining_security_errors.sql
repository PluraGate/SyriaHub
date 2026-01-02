-- ============================================
-- FIX REMAINING RLS SECURITY ERRORS
-- Migration: 20260102120000_fix_remaining_security_errors.sql
-- ============================================

-- ============================================
-- POST_STATS VIEW - Still has SECURITY DEFINER
-- Force drop and recreate with explicit SECURITY INVOKER
-- ============================================

DROP VIEW IF EXISTS post_stats CASCADE;

CREATE OR REPLACE VIEW post_stats 
WITH (security_invoker = true) AS
SELECT 
  p.id as post_id,
  p.author_id,
  p.created_at,
  COALESCE(pv.vote_sum, 0)::bigint as vote_sum,
  COALESCE(pv.vote_count, 0)::bigint as vote_count,
  COALESCE(c.comment_count, 0)::bigint as comment_count,
  COALESCE(b.bookmark_count, 0)::bigint as bookmark_count
FROM posts p
LEFT JOIN (
  SELECT post_id, SUM(value) as vote_sum, COUNT(*) as vote_count
  FROM post_votes
  GROUP BY post_id
) pv ON pv.post_id = p.id
LEFT JOIN (
  SELECT post_id, COUNT(*) as comment_count
  FROM comments
  GROUP BY post_id
) c ON c.post_id = p.id
LEFT JOIN (
  SELECT post_id, COUNT(*) as bookmark_count
  FROM bookmarks
  GROUP BY post_id
) b ON b.post_id = p.id;

-- ============================================
-- NOTE: spatial_ref_sys is a PostGIS system table
-- We cannot enable RLS on it (must be owner)
-- This is a known limitation - the linter warning can be ignored
-- or you can exclude it from the public schema exposure
-- ============================================
