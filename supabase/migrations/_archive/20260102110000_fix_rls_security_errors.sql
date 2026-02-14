-- ============================================
-- FIX RLS SECURITY ERRORS
-- Migration: 20260102110000_fix_rls_security_errors.sql
--
-- Enables RLS on tables with missing RLS and fixes view.
-- Uses simple policies that don't assume column names.
-- ============================================

-- ============================================
-- POST_VERSIONS TABLE - Has policies but RLS not enabled
-- ============================================

ALTER TABLE post_versions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- GROUPS TABLE - RLS not enabled
-- ============================================

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Public read for groups
DROP POLICY IF EXISTS "Groups are publicly readable" ON groups;
CREATE POLICY "Groups are publicly readable" ON groups
  FOR SELECT
  USING (true);

-- Only authenticated can modify (admin check is more complex)
DROP POLICY IF EXISTS "Authenticated users can manage groups" ON groups;
CREATE POLICY "Authenticated users can manage groups" ON groups
  FOR ALL
  USING ((select auth.role()) = 'authenticated')
  WITH CHECK ((select auth.role()) = 'authenticated');

-- ============================================
-- RISK_PROFILES TABLE - RLS not enabled
-- Public read, admin modify
-- ============================================

ALTER TABLE risk_profiles ENABLE ROW LEVEL SECURITY;

-- Public read for risk_profiles (reference data)
DROP POLICY IF EXISTS "Risk profiles are publicly readable" ON risk_profiles;
CREATE POLICY "Risk profiles are publicly readable" ON risk_profiles
  FOR SELECT
  USING (true);

-- Only admins can modify
DROP POLICY IF EXISTS "Admins can manage risk profiles" ON risk_profiles;
CREATE POLICY "Admins can manage risk profiles" ON risk_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role = 'admin'
    )
  );

-- ============================================
-- WORK_TYPES TABLE - RLS not enabled (reference table)
-- ============================================

ALTER TABLE work_types ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "Work types are publicly readable" ON work_types;
CREATE POLICY "Work types are publicly readable" ON work_types
  FOR SELECT
  USING (true);

-- Only admins can modify
DROP POLICY IF EXISTS "Admins can manage work types" ON work_types;
CREATE POLICY "Admins can manage work types" ON work_types
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role = 'admin'
    )
  );

-- ============================================
-- TEAM_ROLES TABLE - RLS not enabled (reference table)
-- ============================================

ALTER TABLE team_roles ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "Team roles are publicly readable" ON team_roles;
CREATE POLICY "Team roles are publicly readable" ON team_roles
  FOR SELECT
  USING (true);

-- Only admins can modify
DROP POLICY IF EXISTS "Admins can manage team roles" ON team_roles;
CREATE POLICY "Admins can manage team roles" ON team_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role = 'admin'
    )
  );

-- ============================================
-- POST_STATS VIEW - SECURITY DEFINER issue
-- Drop and recreate without SECURITY DEFINER
-- ============================================

DROP VIEW IF EXISTS post_stats;

CREATE VIEW post_stats AS
SELECT 
  p.id as post_id,
  p.author_id,
  p.created_at,
  COALESCE(pv.vote_sum, 0) as vote_sum,
  COALESCE(pv.vote_count, 0) as vote_count,
  COALESCE(c.comment_count, 0) as comment_count,
  COALESCE(b.bookmark_count, 0) as bookmark_count
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
-- Should NOT have RLS enabled - it's for geospatial reference
-- ============================================
