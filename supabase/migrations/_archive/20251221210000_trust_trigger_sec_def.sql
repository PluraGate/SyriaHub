-- ============================================
-- MAKE TRUST QUEUE TRIGGER SECURITY DEFINER
-- Migration: 20251221210000_trust_trigger_sec_def.sql
-- Purpose: Allow the trust recalc trigger to bypass RLS when inserting into the queue
-- ============================================

-- 1. Redefine the function as SECURITY DEFINER
-- This allows it to run with the privileges of the creator (postgres/admin),
-- bypassing RLS on the trust_recalc_queue table.
CREATE OR REPLACE FUNCTION enqueue_trust_recalc()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_reason trust_recalc_reason;
BEGIN
  -- Determine user and reason based on source table
  IF TG_TABLE_NAME = 'citations' THEN
    SELECT author_id INTO v_user_id FROM posts WHERE id = NEW.target_post_id;
    v_reason := 'citation_received';
  ELSIF TG_TABLE_NAME = 'peer_reviews' THEN
    SELECT author_id INTO v_user_id FROM posts WHERE id = NEW.post_id;
    v_reason := 'peer_review_rated';
  ELSIF TG_TABLE_NAME = 'posts' AND NEW.forked_from IS NOT NULL THEN
    v_user_id := (NEW.forked_from->>'author_id')::UUID;
    v_reason := 'content_forked';
  END IF;
  
  -- NULL guard: skip if no valid user
  IF v_user_id IS NULL THEN 
    RETURN NEW; 
  END IF;
  
  -- Dedupe insert (user_id is PK)
  -- This insert will now bypass RLS because of SECURITY DEFINER
  INSERT INTO trust_recalc_queue (user_id, reason)
  VALUES (v_user_id, v_reason)
  ON CONFLICT (user_id) DO UPDATE SET 
    queued_at = GREATEST(trust_recalc_queue.queued_at, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. (Optional) Remove the explicit policies added in the previous (likely failing) attempt
-- to keep the schema clean, as SECURITY DEFINER is the preferred way for triggers.
DROP POLICY IF EXISTS "Authenticated users can insert into trust queue" ON trust_recalc_queue;
DROP POLICY IF EXISTS "Authenticated users can update trust queue" ON trust_recalc_queue;

NOTIFY pgrst, 'reload schema';
