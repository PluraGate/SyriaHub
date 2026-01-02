-- ============================================
-- FIX SPATIAL_REF_SYS ACCESS
-- Migration: 20260102130000_fix_spatial_ref_sys.sql
--
-- spatial_ref_sys is a PostGIS system table that we cannot
-- enable RLS on (we're not the owner). Instead, we revoke
-- access from anon and authenticated roles to remove it
-- from PostgREST exposure.
-- ============================================

-- Revoke access from anon and authenticated roles
-- This removes the table from PostgREST/Supabase API exposure
REVOKE ALL ON spatial_ref_sys FROM anon, authenticated;

-- Grant select back to postgres (in case needed internally)
GRANT SELECT ON spatial_ref_sys TO postgres;
