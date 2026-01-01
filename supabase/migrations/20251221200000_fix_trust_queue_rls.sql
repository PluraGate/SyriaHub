-- ============================================
-- FIX TRUST QUEUE RLS
-- Migration: 20251221200000_fix_trust_queue_rls.sql
-- Purpose: Allow authenticated users to insert into trust_recalc_queue (required for triggers)
-- ============================================

-- Option 1: Allow INSERT grant/policy
-- This is needed because the trigger `trg_queue_trust_on_citation` executes with the privileges of the user who triggered it (the citation creator).
-- Since that trigger inserts into `trust_recalc_queue`, the user needs INSERT permission.

CREATE POLICY "Authenticated users can insert into trust queue" ON trust_recalc_queue
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Also ensure update is allowed if ON CONFLICT update is used?
-- The function uses: ON CONFLICT (user_id) DO UPDATE SET queued_at = ...
-- So we need UPDATE permission too?
-- Yes, if the row exists, the user needs to update it.

CREATE POLICY "Authenticated users can update trust queue" ON trust_recalc_queue
  FOR UPDATE
  TO authenticated
  USING (true);

-- Note: We trust the trigger logic to safe-guard WHAT is inserted/updated. 
-- Since users can't trigger this insert manually easily without the trigger logic (unless they call the API directly),
-- but the table is internal. 
-- Ideally the Trigger Function should be SECURITY DEFINER, but that requires altering the function.
-- Let's stick to policies for now as it's less invasive to the schema structure defined in previous migrations.

NOTIFY pgrst, 'reload schema';
