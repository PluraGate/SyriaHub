-- Search Analytics for SyriaHub
-- Migration: 20251217150000_search_analytics.sql
-- Purpose: Track search queries and user behavior for insights

-- ============================================
-- SEARCH ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Query information
  query TEXT NOT NULL,
  query_normalized TEXT NOT NULL,  -- lowercase, trimmed for aggregation
  
  -- Filters used
  filter_type TEXT,
  filter_tag TEXT,
  filter_date TEXT,
  
  -- Results
  results_count INT DEFAULT 0,
  
  -- User interaction
  clicked_result_id TEXT,
  clicked_result_type TEXT,
  
  -- Performance
  search_duration_ms INT,
  
  -- Context
  source TEXT DEFAULT 'web' CHECK (source IN ('web', 'mobile', 'api')),
  session_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES FOR ANALYTICS QUERIES
-- ============================================

-- For finding popular searches
CREATE INDEX idx_search_analytics_query ON search_analytics(query_normalized);

-- For time-based analytics
CREATE INDEX idx_search_analytics_time ON search_analytics(created_at);

-- For user-specific analytics
CREATE INDEX idx_search_analytics_user ON search_analytics(user_id);

-- For filtering by results count (find zero-result searches)
CREATE INDEX idx_search_analytics_results ON search_analytics(results_count);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE search_analytics ENABLE ROW LEVEL SECURITY;

-- Only admins/moderators can read analytics
CREATE POLICY "Admin read search_analytics" ON search_analytics
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Anyone can insert (for logging searches)
CREATE POLICY "Anyone can log searches" ON search_analytics
  FOR INSERT WITH CHECK (true);

-- ============================================
-- FUNCTIONS FOR AGGREGATED ANALYTICS
-- ============================================

-- Get top search terms
CREATE OR REPLACE FUNCTION get_top_searches(
  p_days INT DEFAULT 7,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  query_normalized TEXT,
  search_count BIGINT,
  avg_results NUMERIC,
  click_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.query_normalized,
    COUNT(*)::BIGINT as search_count,
    ROUND(AVG(sa.results_count)::NUMERIC, 1) as avg_results,
    ROUND(
      (COUNT(sa.clicked_result_id)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100,
      1
    ) as click_rate
  FROM search_analytics sa
  WHERE sa.created_at > NOW() - (p_days || ' days')::INTERVAL
  GROUP BY sa.query_normalized
  ORDER BY search_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get zero-result searches (content gaps)
CREATE OR REPLACE FUNCTION get_zero_result_searches(
  p_days INT DEFAULT 7,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  query_normalized TEXT,
  search_count BIGINT,
  last_searched TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.query_normalized,
    COUNT(*)::BIGINT as search_count,
    MAX(sa.created_at) as last_searched
  FROM search_analytics sa
  WHERE sa.created_at > NOW() - (p_days || ' days')::INTERVAL
    AND sa.results_count = 0
  GROUP BY sa.query_normalized
  ORDER BY search_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get search trends by day
CREATE OR REPLACE FUNCTION get_search_trends(
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  search_date DATE,
  search_count BIGINT,
  unique_queries BIGINT,
  avg_results NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(sa.created_at) as search_date,
    COUNT(*)::BIGINT as search_count,
    COUNT(DISTINCT sa.query_normalized)::BIGINT as unique_queries,
    ROUND(AVG(sa.results_count)::NUMERIC, 1) as avg_results
  FROM search_analytics sa
  WHERE sa.created_at > NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(sa.created_at)
  ORDER BY search_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
