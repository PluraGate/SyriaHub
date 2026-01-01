-- ============================================
-- DATABASE RESET SCRIPT FOR SYRIAHUB
-- ============================================
-- This script clears all user data from the database
-- while preserving the schema structure.
-- 
-- WARNING: This will DELETE all data permanently!
-- Use with caution and only in development/staging.
-- ============================================

-- Disable triggers temporarily for faster deletion
SET session_replication_role = replica;

-- ============================================
-- CLEAR ALL TABLES (in dependency order)
-- ============================================

-- First, clear tables with foreign key dependencies
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE post_sessions CASCADE;
TRUNCATE TABLE read_positions CASCADE;
TRUNCATE TABLE suggestions CASCADE;
TRUNCATE TABLE feedback_tickets CASCADE;
TRUNCATE TABLE moderation_appeals CASCADE;
TRUNCATE TABLE moderation_actions CASCADE;
TRUNCATE TABLE knowledge_gaps CASCADE;
TRUNCATE TABLE precedent_links CASCADE;
TRUNCATE TABLE precedents CASCADE;
TRUNCATE TABLE trust_appeals CASCADE;
TRUNCATE TABLE trust_decisions CASCADE;
TRUNCATE TABLE trust_scores CASCADE;

-- Analytics and tracking
TRUNCATE TABLE analytics_daily CASCADE;
TRUNCATE TABLE search_analytics CASCADE;
TRUNCATE TABLE page_views CASCADE;

-- Content interactions
TRUNCATE TABLE bookmarks CASCADE;
TRUNCATE TABLE votes CASCADE;
TRUNCATE TABLE answers CASCADE;
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE reports CASCADE;

-- Citations and references
TRUNCATE TABLE citations CASCADE;

-- Versioning
TRUNCATE TABLE plagiarism_checks CASCADE;
TRUNCATE TABLE post_versions CASCADE;

-- Groups and memberships
TRUNCATE TABLE group_invitations CASCADE;
TRUNCATE TABLE group_members CASCADE;

-- Resources and events
TRUNCATE TABLE resources CASCADE;
TRUNCATE TABLE events CASCADE;

-- Posts (main content)
TRUNCATE TABLE posts CASCADE;

-- Groups
TRUNCATE TABLE groups CASCADE;

-- User-related (preserves auth.users)
TRUNCATE TABLE user_badges CASCADE;

-- Clear users table (will be recreated on next login)
TRUNCATE TABLE users CASCADE;

-- Tags (preserve structure but clear user-created ones if desired)
-- Uncomment the next line if you want to clear custom tags too:
-- TRUNCATE TABLE tags CASCADE;

-- Roles are kept (they're system-level)
-- TRUNCATE TABLE roles CASCADE;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- ============================================
-- RESET SEQUENCES (optional, for fresh IDs)
-- ============================================
-- Not needed for UUID-based tables, but included
-- for any serial/sequence-based columns if added later

-- ============================================
-- VERIFICATION
-- ============================================
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count FROM posts;
    RAISE NOTICE 'Posts remaining: %', table_count;
    
    SELECT COUNT(*) INTO table_count FROM users;
    RAISE NOTICE 'Users remaining: %', table_count;
    
    SELECT COUNT(*) INTO table_count FROM comments;
    RAISE NOTICE 'Comments remaining: %', table_count;
    
    RAISE NOTICE '✓ Database reset complete!';
END $$;
