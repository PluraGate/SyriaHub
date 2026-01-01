-- ============================================
-- FIX ALL SCHEMA RELATIONSHIPS
-- ============================================
-- Run this in Supabase SQL Editor to fix PostgREST schema cache issues
-- and ensure all foreign key relationships are properly named.

-- Step 1: Reload schema cache first
NOTIFY pgrst, 'reload schema';

-- ============================================
-- VERIFY FOREIGN KEY CONSTRAINTS
-- ============================================
-- This query shows all FK constraints that reference the users table
SELECT 
    tc.constraint_name,
    tc.table_name AS from_table,
    kcu.column_name AS from_column,
    ccu.table_name AS to_table,
    ccu.column_name AS to_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'users'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- EXPECTED FK NAMES USED IN CODE
-- ============================================
-- The following FK names are referenced in the codebase:
-- 
-- posts_author_id_fkey          -> posts.author_id -> users.id
-- comments_user_id_fkey         -> comments.user_id -> users.id
-- reports_reporter_id_fkey      -> reports.reporter_id -> users.id
-- reports_reviewed_by_fkey      -> reports.reviewed_by -> users.id
-- moderation_appeals_user_id_fkey    -> moderation_appeals.user_id -> users.id
-- moderation_appeals_resolved_by_fkey -> moderation_appeals.resolved_by -> users.id

-- ============================================
-- FIX: Rename FKs if they don't match expected names
-- ============================================
-- PostgreSQL auto-generates FK names as: {table}_{column}_fkey
-- If your FKs have different names, uncomment and run these:

-- Posts author_id
-- ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
-- ALTER TABLE posts ADD CONSTRAINT posts_author_id_fkey 
--     FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

-- Comments user_id  
-- ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
-- ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey 
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Reports reporter_id
-- ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_reporter_id_fkey;
-- ALTER TABLE reports ADD CONSTRAINT reports_reporter_id_fkey 
--     FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE;

-- Reports reviewed_by
-- ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_reviewed_by_fkey;
-- ALTER TABLE reports ADD CONSTRAINT reports_reviewed_by_fkey 
--     FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Moderation appeals user_id
-- ALTER TABLE moderation_appeals DROP CONSTRAINT IF EXISTS moderation_appeals_user_id_fkey;
-- ALTER TABLE moderation_appeals ADD CONSTRAINT moderation_appeals_user_id_fkey 
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Moderation appeals resolved_by
-- ALTER TABLE moderation_appeals DROP CONSTRAINT IF EXISTS moderation_appeals_resolved_by_fkey;
-- ALTER TABLE moderation_appeals ADD CONSTRAINT moderation_appeals_resolved_by_fkey 
--     FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- FINAL: Reload schema cache after any changes
-- ============================================
NOTIFY pgrst, 'reload schema';

-- ============================================
-- QUICK VALIDATION
-- ============================================
-- Check that critical FKs exist with expected names
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name IN (
        'posts_author_id_fkey',
        'comments_user_id_fkey',
        'reports_reporter_id_fkey',
        'moderation_appeals_user_id_fkey'
    );
