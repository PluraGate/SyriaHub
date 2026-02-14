-- ============================================
-- STANDARDIZE RLS PERFORMANCE & INDEXES
-- Migration: 20260102150000_standardize_rls_performance.sql
-- 
-- 1. Standardize auth.uid() -> (select auth.uid())
-- 2. Standardize auth.role() -> (select auth.role())
-- 3. Add missing indexes on RLS-heavy columns
-- 
-- Uses dynamic SQL to safely handle missing tables.
-- ============================================

-- ============================================
-- 1. NOTIFICATIONS
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

    EXECUTE 'DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications';
    EXECUTE 'CREATE POLICY "Users can view their own notifications" ON notifications
      FOR SELECT
      USING ((select auth.uid()) = user_id)';

    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications';
    EXECUTE 'CREATE POLICY "Users can update their own notifications" ON notifications
      FOR UPDATE
      USING ((select auth.uid()) = user_id)';
  END IF;
END $$;

-- ============================================
-- 2. GROUPS & MEMBERS
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'groups') THEN
    CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);

    EXECUTE 'DROP POLICY IF EXISTS "Group creators manage metadata" ON groups';
    EXECUTE 'CREATE POLICY "Group creators manage metadata" ON groups
      FOR ALL
      USING ((select auth.uid()) = created_by)
      WITH CHECK ((select auth.uid()) = created_by)';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'group_members') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Membership visible to members" ON group_members';
    EXECUTE 'CREATE POLICY "Membership visible to members" ON group_members
      FOR SELECT
      USING (
        (select auth.uid()) = user_id
        OR EXISTS (
          SELECT 1 FROM groups g
          WHERE g.id = group_members.group_id AND g.created_by = (select auth.uid())
        )
      )';

    EXECUTE 'DROP POLICY IF EXISTS "Members can manage their entry" ON group_members';
    EXECUTE 'CREATE POLICY "Members can manage their entry" ON group_members
      FOR INSERT
      WITH CHECK ((select auth.uid()) = user_id)';

    EXECUTE 'DROP POLICY IF EXISTS "Members update their entry" ON group_members';
    EXECUTE 'CREATE POLICY "Members update their entry" ON group_members
      FOR UPDATE
      USING ((select auth.uid()) = user_id)';

    EXECUTE 'DROP POLICY IF EXISTS "Members delete their entry" ON group_members';
    EXECUTE 'CREATE POLICY "Members delete their entry" ON group_members
      FOR DELETE
      USING (
        (select auth.uid()) = user_id
        OR EXISTS (
          SELECT 1 FROM groups g
          WHERE g.id = group_members.group_id AND g.created_by = (select auth.uid())
        )
      )';
  END IF;
END $$;

-- ============================================
-- 3. RESEARCH GAP SYSTEMS
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'research_gaps') THEN
    CREATE INDEX IF NOT EXISTS idx_research_gaps_addressed_by ON research_gaps(addressed_by_post_id);

    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create research gaps" ON research_gaps';
    EXECUTE 'CREATE POLICY "Authenticated users can create research gaps" ON research_gaps
      FOR INSERT
      WITH CHECK ((select auth.uid()) = created_by)';

    EXECUTE 'DROP POLICY IF EXISTS "Users can update their own gaps or claimed gaps" ON research_gaps';
    EXECUTE 'CREATE POLICY "Users can update their own gaps or claimed gaps" ON research_gaps
      FOR UPDATE
      USING (
        (select auth.uid()) = created_by 
        OR (select auth.uid()) = claimed_by
        OR EXISTS (
          SELECT 1 FROM users WHERE users.id = (select auth.uid()) AND users.role IN (''moderator'', ''admin'')
        )
      )';

    EXECUTE 'DROP POLICY IF EXISTS "Only creators or admins can delete gaps" ON research_gaps';
    EXECUTE 'CREATE POLICY "Only creators or admins can delete gaps" ON research_gaps
      FOR DELETE
      USING (
        (select auth.uid()) = created_by
        OR EXISTS (
          SELECT 1 FROM users WHERE users.id = (select auth.uid()) AND users.role = ''admin''
        )
      )';
  END IF;
END $$;

-- ============================================
-- 4. SURVEYS & POLLS
-- ============================================
DO $$
BEGIN
  -- Surveys
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'surveys') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Active surveys are viewable by everyone" ON surveys';
    EXECUTE 'CREATE POLICY "Active surveys are viewable by everyone" ON surveys
      FOR SELECT
      USING (status = ''active'' OR author_id = (select auth.uid()))';

    EXECUTE 'DROP POLICY IF EXISTS "Users can create surveys" ON surveys';
    EXECUTE 'CREATE POLICY "Users can create surveys" ON surveys
      FOR INSERT
      WITH CHECK ((select auth.uid()) = author_id)';

    EXECUTE 'DROP POLICY IF EXISTS "Authors can update their surveys" ON surveys';
    EXECUTE 'CREATE POLICY "Authors can update their surveys" ON surveys
      FOR UPDATE
      USING ((select auth.uid()) = author_id)';

    EXECUTE 'DROP POLICY IF EXISTS "Authors can delete their surveys" ON surveys';
    EXECUTE 'CREATE POLICY "Authors can delete their surveys" ON surveys
      FOR DELETE
      USING ((select auth.uid()) = author_id)';
  END IF;

  -- Polls
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'polls') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Active polls are viewable" ON polls';
    EXECUTE 'CREATE POLICY "Active polls are viewable" ON polls
      FOR SELECT
      USING (is_active = true OR author_id = (select auth.uid()))';

    EXECUTE 'DROP POLICY IF EXISTS "Users can create polls" ON polls';
    EXECUTE 'CREATE POLICY "Users can create polls" ON polls
      FOR INSERT
      WITH CHECK ((select auth.uid()) = author_id)';

    EXECUTE 'DROP POLICY IF EXISTS "Authors can manage polls" ON polls';
    EXECUTE 'CREATE POLICY "Authors can manage polls" ON polls
      FOR UPDATE
      USING ((select auth.uid()) = author_id)';

    EXECUTE 'DROP POLICY IF EXISTS "Authors can delete polls" ON polls';
    EXECUTE 'CREATE POLICY "Authors can delete polls" ON polls
      FOR DELETE
      USING ((select auth.uid()) = author_id)';
  END IF;
END $$;

-- ============================================
-- 5. AI USAGE
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_usage') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own usage" ON ai_usage';
    EXECUTE 'CREATE POLICY "Users can view own usage" ON ai_usage
      FOR SELECT
      USING (user_id = (select auth.uid()))';

    EXECUTE 'DROP POLICY IF EXISTS "System can track usage" ON ai_usage';
    EXECUTE 'CREATE POLICY "System can track usage" ON ai_usage
      FOR ALL
      USING (user_id = (select auth.uid()))';
  END IF;
END $$;

-- ============================================
-- 6. RESEARCH CORRESPONDENCE
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'research_correspondence') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Senders can view own sent correspondence" ON research_correspondence';
    EXECUTE 'CREATE POLICY "Senders can view own sent correspondence" ON research_correspondence
      FOR SELECT TO authenticated
      USING (sender_id = (select auth.uid()))';

    EXECUTE 'DROP POLICY IF EXISTS "Recipients can view delivered correspondence" ON research_correspondence';
    EXECUTE 'CREATE POLICY "Recipients can view delivered correspondence" ON research_correspondence
      FOR SELECT TO authenticated
      USING (recipient_id = (select auth.uid()) AND delivered_at IS NOT NULL)';

    EXECUTE 'DROP POLICY IF EXISTS "Users can create correspondence" ON research_correspondence';
    EXECUTE 'CREATE POLICY "Users can create correspondence" ON research_correspondence
      FOR INSERT TO authenticated
      WITH CHECK (sender_id = (select auth.uid()))';

    EXECUTE 'DROP POLICY IF EXISTS "Admins full access to correspondence" ON research_correspondence';
    EXECUTE 'CREATE POLICY "Admins full access to correspondence" ON research_correspondence
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND role = ''admin''))';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'correspondence_rate_limits') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own rate limits" ON correspondence_rate_limits';
    EXECUTE 'CREATE POLICY "Users can view own rate limits" ON correspondence_rate_limits
      FOR SELECT TO authenticated
      USING (user_id = (select auth.uid()))';

    EXECUTE 'DROP POLICY IF EXISTS "System can manage rate limits" ON correspondence_rate_limits';
    EXECUTE 'CREATE POLICY "System can manage rate limits" ON correspondence_rate_limits
      FOR ALL TO authenticated
      USING (user_id = (select auth.uid()))';
  END IF;
END $$;

-- ============================================
-- 7. ROLE AUDIT
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'role_change_audit') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view role audit logs" ON role_change_audit';
    EXECUTE 'CREATE POLICY "Admins can view role audit logs" ON role_change_audit
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (select auth.uid())
          AND users.role = ''admin''
        )
      )';

    EXECUTE 'DROP POLICY IF EXISTS "System can insert audit logs" ON role_change_audit';
    EXECUTE 'CREATE POLICY "System can insert audit logs" ON role_change_audit
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (select auth.uid())
          AND users.role = ''admin''
        )
      )';
  END IF;
END $$;

-- ============================================
-- 8. PLAGIARISM CHECKS
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'plagiarism_checks') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Plagiarism checks viewable by moderators" ON plagiarism_checks';
    EXECUTE 'CREATE POLICY "Plagiarism checks viewable by moderators" ON plagiarism_checks
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = (select auth.uid()) AND u.role IN (''moderator'', ''admin'')
        )
      )';

    EXECUTE 'DROP POLICY IF EXISTS "Moderators manage plagiarism checks" ON plagiarism_checks';
    EXECUTE 'CREATE POLICY "Moderators manage plagiarism checks" ON plagiarism_checks
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = (select auth.uid()) AND u.role IN (''moderator'', ''admin'')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = (select auth.uid()) AND u.role IN (''moderator'', ''admin'')
        )
      )';

    EXECUTE 'DROP POLICY IF EXISTS "Authors can run plagiarism checks on their own posts" ON plagiarism_checks';
    EXECUTE 'CREATE POLICY "Authors can run plagiarism checks on their own posts" ON plagiarism_checks
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM post_versions pv
          JOIN posts p ON pv.post_id = p.id
          WHERE pv.id = plagiarism_checks.post_version_id
          AND p.author_id = (select auth.uid())
        )
      )';

    EXECUTE 'DROP POLICY IF EXISTS "Authors can view plagiarism checks on their own posts" ON plagiarism_checks';
    EXECUTE 'CREATE POLICY "Authors can view plagiarism checks on their own posts" ON plagiarism_checks
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM post_versions pv
          JOIN posts p ON pv.post_id = p.id
          WHERE pv.id = plagiarism_checks.post_version_id
          AND p.author_id = (select auth.uid())
        )
      )';
  END IF;
END $$;

-- ============================================
-- 9. PROJECTS & MISC INDEXES
-- ============================================
-- Projects and project_members indexes are already covered by their initial migration.
-- Removed redundant/incorrect index creation commands.

NOTIFY pgrst, 'reload schema';
