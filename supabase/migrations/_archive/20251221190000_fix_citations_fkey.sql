-- ============================================
-- FIX CITATIONS FOREIGN KEY NAMES
-- Migration: 20251221190000_fix_citations_fkey.sql
-- Purpose: Explicitly name foreign key constraints on citations table to match Supabase query requirements
-- ============================================

DO $$
BEGIN
    -- 1. Handle target_post_id FK
    -- Drop existing constraint if it exists (under likely names)
    ALTER TABLE citations DROP CONSTRAINT IF EXISTS citations_target_post_id_fkey;
    -- Also drop default named constraint if it differs
    BEGIN
        ALTER TABLE citations DROP CONSTRAINT IF EXISTS citations_target_post_id_fkey1;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- Add the constraint with the EXPLICIT name required by the frontend query:
    -- .select('..., target_post:posts!citations_target_post_id_fkey(...)')
    ALTER TABLE citations 
      ADD CONSTRAINT citations_target_post_id_fkey 
      FOREIGN KEY (target_post_id) 
      REFERENCES posts(id) 
      ON DELETE CASCADE;

    -- 2. Handle source_post_id FK (for consistency/completeness)
    ALTER TABLE citations DROP CONSTRAINT IF EXISTS citations_source_post_id_fkey;
    
    ALTER TABLE citations 
      ADD CONSTRAINT citations_source_post_id_fkey 
      FOREIGN KEY (source_post_id) 
      REFERENCES posts(id) 
      ON DELETE CASCADE;

    -- 3. Handle created_by FK (from recent migration)
    ALTER TABLE citations DROP CONSTRAINT IF EXISTS citations_created_by_fkey;
    
    ALTER TABLE citations 
      ADD CONSTRAINT citations_created_by_fkey 
      FOREIGN KEY (created_by) 
      REFERENCES users(id) 
      ON DELETE SET NULL;

END $$;

NOTIFY pgrst, 'reload schema';
