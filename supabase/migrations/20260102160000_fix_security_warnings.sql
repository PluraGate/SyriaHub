-- ============================================
-- FIX SECURITY WARNINGS
-- Migration: 20260102160000_fix_security_warnings.sql
-- 
-- 1. Move extensions to 'extensions' schema (remediation for extension_in_public)
-- 2. Set search_path for all public functions (remediation for function_search_path_mutable)
-- ============================================

-- 1. Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage to standard roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- 2. Move extensions to 'extensions' schema
-- We use a DO block to avoid errors if extensions are missing
DO $$
BEGIN
    -- PostGIS: Cannot be moved with ALTER EXTENSION SET SCHEMA. 
    -- We leave it in public to avoid destructive operations (dropping/recreating would lose data).
    
    -- Vector (pgvector)
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER EXTENSION vector SET SCHEMA extensions;
    END IF;

    -- pg_trgm
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER EXTENSION pg_trgm SET SCHEMA extensions;
    END IF;
END $$;

-- 3. Fix Function Search Paths
-- Iterates over all functions in 'public' schema and sets safe search_path
DO $$
DECLARE
    func_record record;
BEGIN
    FOR func_record IN
        SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prokind IN ('f', 'p') -- functions and procedures
        AND p.proname NOT LIKE 'git_%' -- avoid touching internal/system-like ones if any
        AND p.proname NOT LIKE 'pg_%'
        AND NOT EXISTS (
            SELECT 1 FROM pg_depend d 
            WHERE d.objid = p.oid 
            AND d.deptype = 'e'
        )
    LOOP
        EXECUTE format('ALTER FUNCTION %I.%I(%s) SET search_path = public, extensions, temp',
            func_record.nspname, func_record.proname, func_record.args);
    END LOOP;
END $$;

-- NOTE:
-- Migrations run in transactions, so we cannot run "ALTER DATABASE ... SET search_path".
-- You should manually run the following in the Supabase SQL Editor if ad-hoc queries need 'extensions' in path:
-- ALTER DATABASE postgres SET search_path TO public, extensions;

NOTIFY pgrst, 'reload schema';
