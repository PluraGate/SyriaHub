-- Fix deletion cascade policies for post authors
-- This migration adds DELETE policies to allow post authors to delete related records
-- which enables cascade deletion of posts (including events) to work properly with RLS

-- Allow post authors to delete comments on their posts (for Cascade Delete)
DROP POLICY IF EXISTS "Post authors can delete comments on their posts" ON comments;
CREATE POLICY "Post authors can delete comments on their posts" ON comments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND posts.author_id = auth.uid()
    )
  );

-- Allow post authors to delete RSVPs on their events (for Cascade Delete)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_rsvps' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Post authors can delete rsvps of their events" ON event_rsvps;
    CREATE POLICY "Post authors can delete rsvps of their events" ON event_rsvps
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM posts
          WHERE posts.id = event_rsvps.event_id
          AND posts.author_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow post authors to delete citations TARGETING their posts (for Cascade Delete)
DROP POLICY IF EXISTS "Post authors can delete citations to their posts" ON citations;
CREATE POLICY "Post authors can delete citations to their posts" ON citations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = citations.target_post_id
      AND posts.author_id = auth.uid()
    )
  );

-- Also allow deletion of citations FROM their posts (source)
DROP POLICY IF EXISTS "Post authors can delete citations from their posts cascade" ON citations;
CREATE POLICY "Post authors can delete citations from their posts cascade" ON citations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = citations.source_post_id
      AND posts.author_id = auth.uid()
    )
  );

-- Allow post authors to delete post_versions of their posts (for Cascade Delete)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_versions' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Post authors can delete versions of their posts" ON post_versions;
    CREATE POLICY "Post authors can delete versions of their posts" ON post_versions
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM posts
          WHERE posts.id = post_versions.post_id
          AND posts.author_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow post authors to delete reports on their posts (for Cascade Delete)
DROP POLICY IF EXISTS "Post authors can delete reports on their posts" ON reports;
CREATE POLICY "Post authors can delete reports on their posts" ON reports
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = reports.post_id
      AND posts.author_id = auth.uid()
    )
  );

-- Allow post authors to delete plagiarism checks of their posts (for Cascade Delete)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'plagiarism_checks' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Post authors can delete plagiarism checks of their posts" ON plagiarism_checks;
    CREATE POLICY "Post authors can delete plagiarism checks of their posts" ON plagiarism_checks
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM post_versions
          JOIN posts ON posts.id = post_versions.post_id
          WHERE post_versions.id = plagiarism_checks.post_version_id
          AND posts.author_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow post authors to delete suggestions on their posts (for Cascade Delete)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'suggestions' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Post authors can delete suggestions on their posts" ON suggestions;
    CREATE POLICY "Post authors can delete suggestions on their posts" ON suggestions
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM posts
          WHERE posts.id = suggestions.post_id
          AND posts.author_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow post authors to delete moderation_appeals on their posts (for Cascade Delete)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'moderation_appeals' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Post authors can delete appeals on their posts" ON moderation_appeals;
    CREATE POLICY "Post authors can delete appeals on their posts" ON moderation_appeals
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM posts
          WHERE posts.id = moderation_appeals.post_id
          AND posts.author_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow post authors to delete reactions on their posts (for Cascade Delete)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_reactions' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Post authors can delete reactions on their posts" ON post_reactions;
    CREATE POLICY "Post authors can delete reactions on their posts" ON post_reactions
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM posts
          WHERE posts.id = post_reactions.post_id
          AND posts.author_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow post authors to delete bookmarks on their posts (for Cascade Delete)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookmarks' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Post authors can delete bookmarks on their posts" ON bookmarks;
    CREATE POLICY "Post authors can delete bookmarks on their posts" ON bookmarks
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM posts
          WHERE posts.id = bookmarks.post_id
          AND posts.author_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow post authors to delete notifications related to their posts (for Cascade Delete)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Post authors can delete notifications on their posts" ON notifications;
    CREATE POLICY "Post authors can delete notifications on their posts" ON notifications
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM posts
          WHERE posts.id = notifications.post_id
          AND posts.author_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow post authors to delete reading patterns for their posts (for Cascade Delete)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reading_patterns' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Post authors can delete reading patterns on their posts" ON reading_patterns;
    CREATE POLICY "Post authors can delete reading patterns on their posts" ON reading_patterns
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM posts
          WHERE posts.id = reading_patterns.post_id
          AND posts.author_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow post authors to delete analytics for their posts (for Cascade Delete)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_analytics' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Post authors can delete analytics on their posts" ON post_analytics;
    CREATE POLICY "Post authors can delete analytics on their posts" ON post_analytics
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM posts
          WHERE posts.id = post_analytics.post_id
          AND posts.author_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow post authors to delete review requests for their posts (for Cascade Delete)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'review_requests' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Post authors can delete review requests on their posts" ON review_requests;
    CREATE POLICY "Post authors can delete review requests on their posts" ON review_requests
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM posts
          WHERE posts.id = review_requests.post_id
          AND posts.author_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow post authors to delete peer reviews for their posts (for Cascade Delete)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'peer_reviews' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Post authors can delete peer reviews on their posts" ON peer_reviews;
    CREATE POLICY "Post authors can delete peer reviews on their posts" ON peer_reviews
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM posts
          WHERE posts.id = peer_reviews.post_id
          AND posts.author_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Allow post authors to delete resource citations for their posts (for Cascade Delete)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'resource_citations' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Post authors can delete resource citations on their posts" ON resource_citations;
    CREATE POLICY "Post authors can delete resource citations on their posts" ON resource_citations
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM posts
          WHERE posts.id = resource_citations.post_id
          AND posts.author_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
