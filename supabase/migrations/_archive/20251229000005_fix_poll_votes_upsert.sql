-- Fix Poll Votes Upsert Migration
-- Created: 2024-12-29
-- Purpose: Add UPDATE policy for poll_votes to enable upsert operations

-- =====================================================
-- Add UPDATE policy for poll_votes table
-- The existing INSERT policy allows new votes, but upsert
-- operations require UPDATE permission to work correctly
-- =====================================================

-- Drop existing policy if it exists (idempotent)
DROP POLICY IF EXISTS "Users can update their votes" ON poll_votes;

-- Add UPDATE policy for poll_votes to allow upsert operations
-- USING: Row-level check - user can only update their own votes
-- WITH CHECK: New value check - user can only set their own user_id
CREATE POLICY "Users can update their votes"
    ON poll_votes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
