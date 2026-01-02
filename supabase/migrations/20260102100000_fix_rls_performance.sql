-- ============================================
-- RLS PERFORMANCE OPTIMIZATION - CORE TABLES
-- Migration: 20260102100000_fix_rls_performance.sql
-- 
-- This migration fixes RLS policies by wrapping auth.uid() 
-- and auth.role() calls in subqueries to prevent per-row 
-- re-evaluation.
--
-- Pattern: auth.uid() -> (select auth.uid())
-- Pattern: auth.role() -> (select auth.role())
--
-- Only includes tables that definitely exist.
-- ============================================

-- ============================================
-- USERS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

-- ============================================
-- TAGS TABLE
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can create tags" ON tags;
CREATE POLICY "Authenticated users can create tags" ON tags
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Moderators and admins can manage tags" ON tags;
CREATE POLICY "Moderators and admins can manage tags" ON tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role IN ('moderator', 'admin')
    )
  );

-- ============================================
-- POSTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can insert posts" ON posts;
CREATE POLICY "Authenticated users can insert posts" ON posts
  FOR INSERT
  WITH CHECK ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE
  USING ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE
  USING ((select auth.uid()) = author_id);

-- ============================================
-- COMMENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- BOOKMARKS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
CREATE POLICY "Users can view their own bookmarks" ON bookmarks
  FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create bookmarks" ON bookmarks;
CREATE POLICY "Users can create bookmarks" ON bookmarks
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;
CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- FOLLOWS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can follow others" ON follows;
CREATE POLICY "Users can follow others" ON follows
  FOR INSERT
  WITH CHECK ((select auth.uid()) = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON follows;
CREATE POLICY "Users can unfollow" ON follows
  FOR DELETE
  USING ((select auth.uid()) = follower_id);

-- ============================================
-- POST_VOTES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users upsert their votes" ON post_votes;
CREATE POLICY "Users upsert their votes" ON post_votes
  FOR INSERT
  WITH CHECK ((select auth.uid()) = voter_id);

DROP POLICY IF EXISTS "Users update their own votes" ON post_votes;
CREATE POLICY "Users update their own votes" ON post_votes
  FOR UPDATE
  USING ((select auth.uid()) = voter_id);

DROP POLICY IF EXISTS "Users delete their own votes" ON post_votes;
CREATE POLICY "Users delete their own votes" ON post_votes
  FOR DELETE
  USING ((select auth.uid()) = voter_id);

-- ============================================
-- EVENT_RSVPS TABLE
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can rsvp" ON event_rsvps;
CREATE POLICY "Authenticated users can rsvp" ON event_rsvps
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own rsvp" ON event_rsvps;
CREATE POLICY "Users can update their own rsvp" ON event_rsvps
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own rsvp" ON event_rsvps;
CREATE POLICY "Users can delete their own rsvp" ON event_rsvps
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- REPORTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT
  USING ((select auth.uid()) = reporter_id);

DROP POLICY IF EXISTS "Moderators and admins can view all reports" ON reports;
CREATE POLICY "Moderators and admins can view all reports" ON reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role IN ('moderator', 'admin')
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create reports" ON reports;
CREATE POLICY "Authenticated users can create reports" ON reports
  FOR INSERT
  WITH CHECK ((select auth.uid()) = reporter_id);

-- ============================================
-- CITATIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can create citations" ON citations;
CREATE POLICY "Authenticated users can create citations" ON citations
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');

-- ============================================
-- MODERATION_APPEALS TABLE  
-- ============================================

DROP POLICY IF EXISTS "Users can view own appeals" ON moderation_appeals;
CREATE POLICY "Users can view own appeals" ON moderation_appeals
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create appeals for own posts" ON moderation_appeals;
CREATE POLICY "Users can create appeals for own posts" ON moderation_appeals
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Moderators can view all appeals" ON moderation_appeals;
CREATE POLICY "Moderators can view all appeals" ON moderation_appeals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = (select auth.uid()) 
      AND users.role IN ('moderator', 'admin')
    )
  );

-- ============================================
-- SURVEYS TABLE
-- ============================================

DROP POLICY IF EXISTS "Active surveys are viewable by everyone" ON surveys;
CREATE POLICY "Active surveys are viewable by everyone" ON surveys
  FOR SELECT
  USING (status = 'active' OR author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create surveys" ON surveys;
CREATE POLICY "Users can create surveys" ON surveys
  FOR INSERT
  WITH CHECK ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Authors can update their surveys" ON surveys;
CREATE POLICY "Authors can update their surveys" ON surveys
  FOR UPDATE
  USING ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Authors can delete their surveys" ON surveys;
CREATE POLICY "Authors can delete their surveys" ON surveys
  FOR DELETE
  USING ((select auth.uid()) = author_id);

-- ============================================
-- SURVEY_RESPONSES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can submit responses" ON survey_responses;
CREATE POLICY "Users can submit responses" ON survey_responses
  FOR INSERT
  WITH CHECK ((select auth.uid()) = respondent_id OR respondent_id IS NULL);

DROP POLICY IF EXISTS "Authors can view responses" ON survey_responses;
CREATE POLICY "Authors can view responses" ON survey_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = survey_responses.survey_id 
      AND surveys.author_id = (select auth.uid())
    ) OR respondent_id = (select auth.uid())
  );

-- ============================================
-- POLLS TABLE
-- ============================================

DROP POLICY IF EXISTS "Active polls are viewable" ON polls;
CREATE POLICY "Active polls are viewable" ON polls
  FOR SELECT
  USING (is_active = true OR author_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create polls" ON polls;
CREATE POLICY "Users can create polls" ON polls
  FOR INSERT
  WITH CHECK ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Authors can manage polls" ON polls;
CREATE POLICY "Authors can manage polls" ON polls
  FOR UPDATE
  USING ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Authors can delete polls" ON polls;
CREATE POLICY "Authors can delete polls" ON polls
  FOR DELETE
  USING ((select auth.uid()) = author_id);

-- ============================================
-- POLL_VOTES TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can see their votes" ON poll_votes;
CREATE POLICY "Users can see their votes" ON poll_votes
  FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can vote" ON poll_votes;
CREATE POLICY "Users can vote" ON poll_votes
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================
-- RESEARCH_GAPS TABLE
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can create research gaps" ON research_gaps;
CREATE POLICY "Authenticated users can create research gaps" ON research_gaps
  FOR INSERT
  WITH CHECK ((select auth.uid()) = created_by);

DROP POLICY IF EXISTS "Users can update their own gaps or claimed gaps" ON research_gaps;
CREATE POLICY "Users can update their own gaps or claimed gaps" ON research_gaps
  FOR UPDATE
  USING (
    (select auth.uid()) = created_by 
    OR (select auth.uid()) = claimed_by
    OR EXISTS (
      SELECT 1 FROM users WHERE users.id = (select auth.uid()) AND users.role IN ('moderator', 'admin')
    )
  );

-- ============================================
-- RESEARCH_GAP_UPVOTES TABLE
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can upvote" ON research_gap_upvotes;
CREATE POLICY "Authenticated users can upvote" ON research_gap_upvotes
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can remove their own upvotes" ON research_gap_upvotes;
CREATE POLICY "Users can remove their own upvotes" ON research_gap_upvotes
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- ENDORSEMENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can create endorsements" ON endorsements;
CREATE POLICY "Authenticated users can create endorsements" ON endorsements
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Users can remove their own endorsements" ON endorsements;
CREATE POLICY "Users can remove their own endorsements" ON endorsements
  FOR DELETE
  USING ((select auth.uid()) = endorser_id);

-- ============================================
-- SUGGESTIONS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can create suggestions" ON suggestions;
CREATE POLICY "Users can create suggestions" ON suggestions
  FOR INSERT
  WITH CHECK ((select auth.role()) = 'authenticated');

-- ============================================
-- COMPLETE
-- ============================================
-- Core RLS policies optimized with (select auth.*()) pattern.
