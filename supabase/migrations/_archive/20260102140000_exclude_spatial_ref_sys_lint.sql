-- ============================================
-- EXCLUDE SPATIAL_REF_SYS FROM LINTER
-- Migration: 20260102140000_exclude_spatial_ref_sys_lint.sql
--
-- spatial_ref_sys is a PostGIS system table that we cannot
-- enable RLS on (we're not the owner).
--
-- Unfortunately, we cannot add lint exclusions at the SQL level.
-- The Supabase linter exclusion must be done via:
-- 1. Dashboard Settings -> Security Advisor -> Add to exclusion list
-- 2. Or by adding to supabase/config.toml if supported
--
-- This migration documents the situation and is a no-op.
-- ============================================

-- NO-OP: Document why spatial_ref_sys cannot have RLS enabled
-- The spatial_ref_sys table is owned by the PostGIS extension
-- and we cannot ALTER it to enable RLS.
-- 
-- To suppress this linter warning, add the cache_key to exclusions:
-- cache_key: rls_disabled_in_public_public_spatial_ref_sys
--
-- This can be done in the Supabase Dashboard:
-- Go to "Security Advisor" (in Database settings) 
-- and click "Ignore" on the spatial_ref_sys warning.

SELECT 1; -- Placeholder to make migration valid
