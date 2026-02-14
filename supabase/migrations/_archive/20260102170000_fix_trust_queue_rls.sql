-- ============================================
-- FIX RLS ENABLED NO POLICY
-- Migration: 20260102170000_fix_trust_queue_rls.sql
-- 
-- Remediation for: rls_enabled_no_policy on trust_recalc_queue
-- Details: This table is internal for background processing, but we add an 
-- admin view policy to satisfy the linter and allow monitoring.
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trust_recalc_queue') THEN
        
        -- drop existing policies to be safe (though none should exist per warning)
        DROP POLICY IF EXISTS "Admins can view trust queue" ON trust_recalc_queue;
        
        CREATE POLICY "Admins can view trust queue" ON trust_recalc_queue
          FOR SELECT TO authenticated
          USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
          
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
