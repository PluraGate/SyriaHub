-- ============================================
-- FIX FUNCTION SEARCH PATHS
-- Migration: 20260108000000_fix_function_search_paths.sql
-- 
-- Sets explicit search_path for functions created after
-- the 20260102160000_fix_security_warnings.sql migration.
-- This prevents search path injection vulnerabilities.
-- 
-- NOTE: This only adds a configuration property to existing
-- functions. It does NOT modify their logic in any way.
-- ============================================

-- 1. Resource Slug Functions (from 20260105000002 and 20260105000003)
ALTER FUNCTION public.generate_resource_slug(TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, UUID)
  SET search_path = public;

ALTER FUNCTION public.backfill_resource_slug(UUID)
  SET search_path = public;

ALTER FUNCTION public.get_resource_by_slug(TEXT)
  SET search_path = public;

ALTER FUNCTION public.get_resource_slug(UUID)
  SET search_path = public;

-- 2. Invite Functions (from 20260104213100)
ALTER FUNCTION public.create_invite_code(UUID, TEXT, TEXT)
  SET search_path = public;

ALTER FUNCTION public.get_user_invite_stats(UUID)
  SET search_path = public;

-- 3. Jury Functions (from 20260104004000)
ALTER FUNCTION public.update_jury_vote_counts()
  SET search_path = public;

-- 4. Token Generation (if exists - check for multiple signatures)
DO $$
BEGIN
  -- Try to alter the function - if it doesn't exist, just skip
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'generate_public_token'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.generate_public_token SET search_path = public';
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Function might have different signature or not exist
  RAISE NOTICE 'Could not alter generate_public_token: %', SQLERRM;
END $$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
