-- ============================================
-- DATABASE RESET SCRIPT (CLEAN SLATE)
-- ============================================
-- This script clears all user-generated data from the database
-- while preserving the structure and essential system data.
-- 
-- Recommended Usage:
-- 1. Local: 'supabase db reset' is preferred.
-- 2. Remote/Live: Run this script in the Supabase SQL Editor.
-- ============================================

DO $$ 
DECLARE 
    r RECORD;
    v_table_count INTEGER := 0;
BEGIN
    -- Disable triggers and foreign key checks for the session
    SET session_replication_role = replica;
    
    -- Loop through all tables in the public schema
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            -- List of tables to PRESERVE (structure/lookup data)
            'spatial_ref_sys',       -- PostGIS internal
            'roles',                 -- System roles
            'ai_usage_limits',       -- Fixed limits
            'schema_registries',     -- Dynamic schema structure
            'schema_items',          -- Dynamic schema items
            'schema_fields',         -- Dynamic schema fields
            'schema_field_versions'  -- Dynamic schema versions
        )
    ) 
    LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
        v_table_count := v_table_count + 1;
    END LOOP;
    
    -- Re-enable triggers
    SET session_replication_role = DEFAULT;
    
    RAISE NOTICE '✓ Cleaned % tables.', v_table_count;
    RAISE NOTICE '✓ Database reset to clean slate complete!';
END $$;

-- ============================================
-- OPTIONAL: SEED ESSENTIAL DATA
-- ============================================
-- If you need to re-seed specific data after truncate, 
-- you can call specific functions or run inserts here.

