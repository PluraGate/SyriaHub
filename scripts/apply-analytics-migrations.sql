-- ============================================================================
-- SYREALIZE DATABASE MIGRATIONS - Sprint 4
-- Run this in your Supabase SQL Editor to apply analytics features
-- ============================================================================

-- ============================================
-- 1. POST VIEWS TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS post_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  scroll_depth FLOAT DEFAULT 0,
  referrer TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS post_views_post_id_idx ON post_views(post_id);
CREATE INDEX IF NOT EXISTS post_views_user_id_idx ON post_views(user_id);
CREATE INDEX IF NOT EXISTS post_views_created_at_idx ON post_views(created_at);
CREATE INDEX IF NOT EXISTS post_views_post_created_idx ON post_views(post_id, created_at);

ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow inserting views" ON post_views;
CREATE POLICY "Allow inserting views" ON post_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authors can view their post analytics" ON post_views;
CREATE POLICY "Authors can view their post analytics" ON post_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_views.post_id 
      AND posts.author_id = auth.uid()
    )
  );

-- ============================================
-- 2. POST ANALYTICS FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION get_post_view_count(p_post_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM post_views WHERE post_id = p_post_id);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_unique_viewers(p_post_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT COALESCE(user_id::TEXT, session_id)) 
    FROM post_views 
    WHERE post_id = p_post_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_avg_read_time(p_post_id UUID)
RETURNS FLOAT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT AVG(duration_seconds) FROM post_views WHERE post_id = p_post_id AND duration_seconds > 0),
    0
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_post_analytics(p_post_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_views', (SELECT COUNT(*) FROM post_views WHERE post_id = p_post_id),
    'unique_viewers', (SELECT COUNT(DISTINCT COALESCE(user_id::TEXT, session_id)) FROM post_views WHERE post_id = p_post_id),
    'avg_read_time', COALESCE((SELECT AVG(duration_seconds) FROM post_views WHERE post_id = p_post_id AND duration_seconds > 0), 0),
    'avg_scroll_depth', COALESCE((SELECT AVG(scroll_depth) FROM post_views WHERE post_id = p_post_id AND scroll_depth > 0), 0),
    'views_today', (SELECT COUNT(*) FROM post_views WHERE post_id = p_post_id AND created_at > NOW() - INTERVAL '1 day'),
    'views_this_week', (SELECT COUNT(*) FROM post_views WHERE post_id = p_post_id AND created_at > NOW() - INTERVAL '7 days'),
    'views_this_month', (SELECT COUNT(*) FROM post_views WHERE post_id = p_post_id AND created_at > NOW() - INTERVAL '30 days')
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_views_over_time(p_post_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (date DATE, views BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT DATE(created_at) as date, COUNT(*) as views
  FROM post_views
  WHERE post_id = p_post_id AND created_at > NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- 3. USER READING HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS reading_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  first_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  view_count INTEGER DEFAULT 1,
  total_duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS reading_history_user_idx ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS reading_history_post_idx ON reading_history(post_id);
CREATE INDEX IF NOT EXISTS reading_history_last_viewed_idx ON reading_history(last_viewed_at DESC);

ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own reading history" ON reading_history;
CREATE POLICY "Users view own reading history" ON reading_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert reading history" ON reading_history;
CREATE POLICY "Users can insert reading history" ON reading_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reading history" ON reading_history;
CREATE POLICY "Users can update own reading history" ON reading_history
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 4. READING PATTERNS FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION upsert_reading_history(
  p_user_id UUID, p_post_id UUID, p_duration INTEGER DEFAULT 0, p_completed BOOLEAN DEFAULT false
) RETURNS void AS $$
BEGIN
  INSERT INTO reading_history (user_id, post_id, total_duration_seconds, completed)
  VALUES (p_user_id, p_post_id, p_duration, p_completed)
  ON CONFLICT (user_id, post_id) DO UPDATE SET
    last_viewed_at = NOW(),
    view_count = reading_history.view_count + 1,
    total_duration_seconds = reading_history.total_duration_seconds + EXCLUDED.total_duration_seconds,
    completed = reading_history.completed OR EXCLUDED.completed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_reading_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'total_posts_read', (SELECT COUNT(*) FROM reading_history WHERE user_id = p_user_id),
    'posts_completed', (SELECT COUNT(*) FROM reading_history WHERE user_id = p_user_id AND completed = true),
    'total_reading_time', COALESCE((SELECT SUM(total_duration_seconds) FROM reading_history WHERE user_id = p_user_id), 0),
    'posts_read_this_week', (SELECT COUNT(*) FROM reading_history WHERE user_id = p_user_id AND last_viewed_at > NOW() - INTERVAL '7 days'),
    'posts_read_this_month', (SELECT COUNT(*) FROM reading_history WHERE user_id = p_user_id AND last_viewed_at > NOW() - INTERVAL '30 days'),
    'avg_read_time', COALESCE((SELECT AVG(total_duration_seconds / NULLIF(view_count, 0)) FROM reading_history WHERE user_id = p_user_id), 0)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_favorite_topics(p_user_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (tag TEXT, read_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT unnest(p.tags) as tag, COUNT(*) as read_count
  FROM reading_history rh
  JOIN posts p ON p.id = rh.post_id
  WHERE rh.user_id = p_user_id AND p.tags IS NOT NULL AND array_length(p.tags, 1) > 0
  GROUP BY unnest(p.tags)
  ORDER BY read_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_reading_activity(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (date DATE, posts_read BIGINT, minutes_read BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT DATE(last_viewed_at) as date, COUNT(*) as posts_read, COALESCE(SUM(total_duration_seconds) / 60, 0) as minutes_read
  FROM reading_history
  WHERE user_id = p_user_id AND last_viewed_at > NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(last_viewed_at)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- 5. GRANT PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION get_post_view_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_unique_viewers TO authenticated;
GRANT EXECUTE ON FUNCTION get_avg_read_time TO authenticated;
GRANT EXECUTE ON FUNCTION get_post_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_views_over_time TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_reading_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_reading_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_favorite_topics TO authenticated;
GRANT EXECUTE ON FUNCTION get_reading_activity TO authenticated;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
SELECT 'Analytics migrations applied successfully!' as status;
