-- Rate limit tracking for AI analysis
-- Stores timestamps of AI analysis calls for persistent rate limiting across serverless instances

CREATE TABLE IF NOT EXISTS ai_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL DEFAULT 'recommendation_analysis',
  executed_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient time-based queries
CREATE INDEX IF NOT EXISTS idx_ai_rate_limits_executed_at ON ai_rate_limits(executed_at);

-- RLS policies
ALTER TABLE ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (from backend)
CREATE POLICY "Service role can manage rate limits"
  ON ai_rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Cleanup function to remove old entries (older than 2 hours)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM ai_rate_limits
  WHERE executed_at < now() - interval '2 hours';
END;
$$;
