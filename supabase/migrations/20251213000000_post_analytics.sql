-- ============================================
-- POST VIEWS TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS post_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT, -- Anonymous users tracked by session
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  duration_seconds INTEGER DEFAULT 0, -- Time spent reading
  scroll_depth FLOAT DEFAULT 0, -- 0 to 1, how far they scrolled
  referrer TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS post_views_post_id_idx ON post_views(post_id);
CREATE INDEX IF NOT EXISTS post_views_user_id_idx ON post_views(user_id);
CREATE INDEX IF NOT EXISTS post_views_created_at_idx ON post_views(created_at);
CREATE INDEX IF NOT EXISTS post_views_post_created_idx ON post_views(post_id, created_at);

-- Enable RLS
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (for tracking)
CREATE POLICY "Allow inserting views" ON post_views
  FOR INSERT WITH CHECK (true);

-- Users can view their own post analytics
CREATE POLICY "Authors can view their post analytics" ON post_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_views.post_id 
      AND posts.author_id = auth.uid()
    )
  );

-- ============================================
-- ANALYTICS AGGREGATION FUNCTIONS
-- ============================================

-- Get post view count
CREATE OR REPLACE FUNCTION get_post_view_count(p_post_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM post_views WHERE post_id = p_post_id);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get unique viewers count
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

-- Get average read time
CREATE OR REPLACE FUNCTION get_avg_read_time(p_post_id UUID)
RETURNS FLOAT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT AVG(duration_seconds) FROM post_views WHERE post_id = p_post_id AND duration_seconds > 0),
    0
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get post analytics summary
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

-- Get views over time (for charts)
CREATE OR REPLACE FUNCTION get_views_over_time(p_post_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  views BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as views
  FROM post_views
  WHERE post_id = p_post_id
    AND created_at > NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_post_view_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_unique_viewers TO authenticated;
GRANT EXECUTE ON FUNCTION get_avg_read_time TO authenticated;
GRANT EXECUTE ON FUNCTION get_post_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_views_over_time TO authenticated;
