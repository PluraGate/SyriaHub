-- ============================================
-- RESEARCH IMPACT & COLLABORATION ENHANCEMENT
-- Migration: 20251225000000_research_impact_collaboration.sql
-- 
-- This migration introduces:
-- 1. Research Outcomes table - links gaps to real-world publications
-- 2. Gap Contributions table - structured discussions (not chat)
-- 3. Platform health tracking views
-- ============================================

-- ============================================
-- 1. RESEARCH OUTCOMES TABLE
-- ============================================
-- Links resolved research gaps to external publications, datasets, 
-- policy documents, and other real-world outcomes.

CREATE TABLE IF NOT EXISTS research_outcomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Links to internal content
  gap_id UUID REFERENCES research_gaps(id) ON DELETE SET NULL,
  resolving_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  
  -- External publication details
  external_url TEXT,              -- DOI, journal link, repository, etc.
  external_title TEXT,            -- Title of the external publication
  external_authors TEXT,          -- Comma-separated author names
  publication_date DATE,
  
  -- Outcome classification
  outcome_type TEXT DEFAULT 'publication' CHECK (
    outcome_type IN ('publication', 'policy', 'dataset', 'presentation', 'media', 'report')
  ),
  
  -- Brief description of how SyriaHub contributed (hedging language encouraged)
  impact_description TEXT,
  
  -- Verification by moderator/admin
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  
  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS research_outcomes_gap_id_idx ON research_outcomes(gap_id);
CREATE INDEX IF NOT EXISTS research_outcomes_post_id_idx ON research_outcomes(resolving_post_id);
CREATE INDEX IF NOT EXISTS research_outcomes_outcome_type_idx ON research_outcomes(outcome_type);
CREATE INDEX IF NOT EXISTS research_outcomes_verified_idx ON research_outcomes(verified_at) WHERE verified_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS research_outcomes_created_at_idx ON research_outcomes(created_at DESC);

-- Enable RLS
ALTER TABLE research_outcomes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view verified outcomes" ON research_outcomes
  FOR SELECT
  USING (verified_at IS NOT NULL OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create outcomes" ON research_outcomes
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their unverified outcomes" ON research_outcomes
  FOR UPDATE
  USING (
    auth.uid() = created_by AND verified_at IS NULL
    OR EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Admins can delete outcomes" ON research_outcomes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_research_outcomes_updated_at
  BEFORE UPDATE ON research_outcomes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE research_outcomes IS 
  'Links research gaps to real-world outcomes (publications, datasets, policy changes). 
   Requires moderator verification before public display.';

-- ============================================
-- 2. GAP CONTRIBUTIONS TABLE
-- ============================================
-- Structured contributions to research gaps (NOT a chat system).
-- Each contribution is a formal, substantive addition:
-- - Reading suggestions (references to explore)
-- - Collaboration offers (formal interest in working together)
-- - Methodological notes (approach suggestions)

CREATE TABLE IF NOT EXISTS gap_contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gap_id UUID REFERENCES research_gaps(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Contribution type determines the structure
  contribution_type TEXT NOT NULL CHECK (
    contribution_type IN ('reading_suggestion', 'collaboration_offer', 'methodological_note', 'data_pointer')
  ),
  
  -- Core content (structured based on type)
  content TEXT NOT NULL,          -- Main text content
  resource_url TEXT,              -- Optional: link to resource (for reading_suggestion, data_pointer)
  resource_title TEXT,            -- Optional: title of linked resource
  
  -- For collaboration offers
  expertise_offered TEXT,         -- What skills/knowledge they bring
  availability_notes TEXT,        -- Time commitment they can offer
  
  -- Status tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'accepted')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS gap_contributions_gap_id_idx ON gap_contributions(gap_id);
CREATE INDEX IF NOT EXISTS gap_contributions_user_id_idx ON gap_contributions(user_id);
CREATE INDEX IF NOT EXISTS gap_contributions_type_idx ON gap_contributions(contribution_type);
CREATE INDEX IF NOT EXISTS gap_contributions_status_idx ON gap_contributions(status);
CREATE INDEX IF NOT EXISTS gap_contributions_created_at_idx ON gap_contributions(created_at DESC);

-- Enable RLS
ALTER TABLE gap_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active contributions" ON gap_contributions
  FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create contributions" ON gap_contributions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contributions" ON gap_contributions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contributions" ON gap_contributions
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('moderator', 'admin')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_gap_contributions_updated_at
  BEFORE UPDATE ON gap_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE gap_contributions IS 
  'Structured contributions to research gaps. NOT a chat system - each contribution 
   should be a substantive, formal addition (reading suggestions, collaboration offers, etc.)';

-- ============================================
-- 3. PLATFORM HEALTH METRICS FUNCTIONS
-- ============================================

-- Function to get content velocity metrics
CREATE OR REPLACE FUNCTION get_content_velocity(p_days INTEGER DEFAULT 7)
RETURNS TABLE (
  posts_per_day NUMERIC,
  gaps_per_week NUMERIC,
  comments_per_day NUMERIC,
  outcomes_per_month NUMERIC,
  avg_gap_resolution_days NUMERIC
) AS $$
DECLARE
  v_start_date TIMESTAMP WITH TIME ZONE;
BEGIN
  v_start_date := NOW() - (p_days || ' days')::INTERVAL;
  
  RETURN QUERY
  SELECT 
    -- Posts per day
    ROUND(COUNT(*) FILTER (WHERE p.created_at >= v_start_date)::NUMERIC / p_days, 2) as posts_per_day,
    -- Gaps per week
    ROUND(
      (SELECT COUNT(*) FROM research_gaps g WHERE g.created_at >= v_start_date)::NUMERIC 
      / (p_days::NUMERIC / 7), 2
    ) as gaps_per_week,
    -- Comments per day
    ROUND(
      (SELECT COUNT(*) FROM comments c WHERE c.created_at >= v_start_date)::NUMERIC 
      / p_days, 2
    ) as comments_per_day,
    -- Outcomes per month
    ROUND(
      (SELECT COUNT(*) FROM research_outcomes o WHERE o.created_at >= v_start_date)::NUMERIC 
      / (p_days::NUMERIC / 30), 2
    ) as outcomes_per_month,
    -- Average gap resolution time (days)
    (
      SELECT ROUND(AVG(EXTRACT(EPOCH FROM (g.addressed_at - g.created_at)) / 86400), 1)
      FROM research_gaps g
      WHERE g.status = 'addressed' AND g.addressed_at IS NOT NULL
    ) as avg_gap_resolution_days
  FROM posts p;
END;
$$ LANGUAGE plpgsql;

-- Function to get gap metrics
CREATE OR REPLACE FUNCTION get_gap_metrics()
RETURNS TABLE (
  total_gaps BIGINT,
  open_gaps BIGINT,
  investigating_gaps BIGINT,
  addressed_gaps BIGINT,
  resolution_rate NUMERIC,
  avg_upvotes NUMERIC,
  claim_success_rate NUMERIC,
  contributions_this_week BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM research_gaps) as total_gaps,
    (SELECT COUNT(*) FROM research_gaps WHERE status = 'identified') as open_gaps,
    (SELECT COUNT(*) FROM research_gaps WHERE status = 'investigating') as investigating_gaps,
    (SELECT COUNT(*) FROM research_gaps WHERE status = 'addressed') as addressed_gaps,
    ROUND(
      (SELECT COUNT(*) FROM research_gaps WHERE status = 'addressed')::NUMERIC * 100 
      / NULLIF((SELECT COUNT(*) FROM research_gaps), 0), 1
    ) as resolution_rate,
    (SELECT ROUND(AVG(upvote_count), 1) FROM research_gaps) as avg_upvotes,
    -- Claim success rate: addressed gaps that were claimed / total claimed
    ROUND(
      (SELECT COUNT(*) FROM research_gaps WHERE status = 'addressed' AND claimed_by IS NOT NULL)::NUMERIC * 100 
      / NULLIF((SELECT COUNT(*) FROM research_gaps WHERE claimed_by IS NOT NULL), 0), 1
    ) as claim_success_rate,
    (SELECT COUNT(*) FROM gap_contributions WHERE created_at >= NOW() - INTERVAL '7 days') as contributions_this_week;
END;
$$ LANGUAGE plpgsql;

-- Function to get moderation metrics
CREATE OR REPLACE FUNCTION get_moderation_metrics()
RETURNS TABLE (
  pending_queue BIGINT,
  reviewed_today BIGINT,
  reviewed_this_week BIGINT,
  pending_appeals BIGINT,
  avg_review_time_hours NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM posts WHERE status = 'pending') as pending_queue,
    (SELECT COUNT(*) FROM posts WHERE moderated_at::DATE = CURRENT_DATE) as reviewed_today,
    (SELECT COUNT(*) FROM posts WHERE moderated_at >= NOW() - INTERVAL '7 days') as reviewed_this_week,
    (SELECT COUNT(*) FROM appeals WHERE status = 'pending') as pending_appeals,
    -- Approximate: time from creation to moderation for recent posts
    (
      SELECT ROUND(AVG(EXTRACT(EPOCH FROM (moderated_at - created_at)) / 3600), 1)
      FROM posts 
      WHERE moderated_at IS NOT NULL 
        AND moderated_at >= NOW() - INTERVAL '30 days'
    ) as avg_review_time_hours;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. NOTIFICATION TYPES FOR COLLABORATION
-- ============================================
-- Add new notification types for gap collaboration features

-- This is idempotent - only affects new notifications
-- Existing notification_type column should already be TEXT

-- ============================================
-- 5. GRANT PERMISSIONS
-- ============================================

GRANT SELECT ON research_outcomes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON research_outcomes TO authenticated;

GRANT SELECT ON gap_contributions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON gap_contributions TO authenticated;

GRANT EXECUTE ON FUNCTION get_content_velocity(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_gap_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_moderation_metrics() TO authenticated;

-- ============================================
-- 6. SAMPLE COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN gap_contributions.contribution_type IS 
  'reading_suggestion: Reference to explore. 
   collaboration_offer: Formal interest in working together. 
   methodological_note: Approach/method suggestion. 
   data_pointer: Link to relevant dataset or source.';

COMMENT ON COLUMN research_outcomes.outcome_type IS 
  'publication: Journal article, thesis, book.
   policy: Policy document, recommendation.
   dataset: Published dataset.
   presentation: Conference talk, workshop.
   media: News article, documentary.
   report: Technical report, white paper.';
