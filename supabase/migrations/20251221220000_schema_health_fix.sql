-- ============================================
-- SCHEMA HEALTH CHECK & CONSOLIDATED FIX
-- Migration: 20251221220000_schema_health_fix.sql
-- Purpose: Ensure all required columns exist and triggers have correct permissions
-- ============================================

DO $$
BEGIN
    -- 1. Ensure quote_content exists (Fix for Error: 42703)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='citations' AND column_name='quote_content'
    ) THEN
        ALTER TABLE citations ADD COLUMN quote_content TEXT;
    END IF;

    -- 2. Ensure External Citation columns exist (Safety check)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='citations' AND column_name='external_url') THEN
        ALTER TABLE citations ADD COLUMN external_url TEXT;
        ALTER TABLE citations ADD COLUMN external_doi TEXT;
        ALTER TABLE citations ADD COLUMN external_title TEXT;
        ALTER TABLE citations ADD COLUMN external_author TEXT;
        ALTER TABLE citations ADD COLUMN external_year INT;
        ALTER TABLE citations ADD COLUMN external_source TEXT;
    END IF;

    -- 3. Ensure Foreign Key constraints are correctly named (Fix for Ambiguous/Missing FK)
    -- Target Post FK
    ALTER TABLE citations DROP CONSTRAINT IF EXISTS citations_target_post_id_fkey;
    ALTER TABLE citations ADD CONSTRAINT citations_target_post_id_fkey 
        FOREIGN KEY (target_post_id) REFERENCES posts(id) ON DELETE CASCADE;
    
    -- Source Post FK
    ALTER TABLE citations DROP CONSTRAINT IF EXISTS citations_source_post_id_fkey;
    ALTER TABLE citations ADD CONSTRAINT citations_source_post_id_fkey 
        FOREIGN KEY (source_post_id) REFERENCES posts(id) ON DELETE CASCADE;

    -- Author Users FK (on posts table - needed for the join author:users!posts_author_id_fkey)
    ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
    ALTER TABLE posts ADD CONSTRAINT posts_author_id_fkey 
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

END $$;

-- 4. Redefine Trust Recalc Trigger as SECURITY DEFINER (Fix for RLS Error: 42501)
CREATE OR REPLACE FUNCTION enqueue_trust_recalc()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_reason trust_recalc_reason;
BEGIN
  IF TG_TABLE_NAME = 'citations' THEN
    SELECT author_id INTO v_user_id FROM posts WHERE id = NEW.target_post_id;
    v_reason := 'citation_received';
  ELSIF TG_TABLE_NAME = 'peer_reviews' THEN
    SELECT author_id INTO v_user_id FROM posts WHERE id = NEW.post_id;
    v_reason := 'peer_review_rated';
  ELSIF TG_TABLE_NAME = 'posts' AND NEW.forked_from IS NOT NULL THEN
    -- Handle forked_from being a JSONB object or UUID
    BEGIN
        v_user_id := (NEW.forked_from->>'author_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;
    v_reason := 'content_forked';
  END IF;
  
  IF v_user_id IS NULL THEN RETURN NEW; END IF;
  
  INSERT INTO trust_recalc_queue (user_id, reason)
  VALUES (v_user_id, v_reason)
  ON CONFLICT (user_id) DO UPDATE SET 
    queued_at = GREATEST(trust_recalc_queue.queued_at, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Cleanup redundant policies (SECURITY DEFINER is sufficient)
DROP POLICY IF EXISTS "Authenticated users can insert into trust queue" ON trust_recalc_queue;
DROP POLICY IF EXISTS "Authenticated users can update trust queue" ON trust_recalc_queue;

NOTIFY pgrst, 'reload schema';
