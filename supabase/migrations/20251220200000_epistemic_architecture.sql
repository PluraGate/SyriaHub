-- ============================================
-- EPISTEMIC ARCHITECTURE UPGRADE
-- Migration: 20251220200000_epistemic_architecture.sql
-- 
-- This migration introduces:
-- 1. New content_type: 'trace' for collective memory artefacts
-- 2. Temporal & Spatial coverage fields for posts
-- 3. Citation types for knowledge friction modeling
-- 4. Research Gaps table for the "Absence Model"
-- 5. Impact metrics for shifting from gamification to academic rigor
-- ============================================

-- ============================================
-- 1. EXTEND CONTENT_TYPE TO INCLUDE 'TRACE'
-- ============================================
-- Traces are "Fragments of Memory" - photos, audio, scanned documents 
-- that serve as evidence/artefacts but aren't full articles.

ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_content_type_check;
ALTER TABLE posts ADD CONSTRAINT posts_content_type_check 
  CHECK (content_type IN ('article', 'question', 'answer', 'resource', 'event', 'trace'));

COMMENT ON CONSTRAINT posts_content_type_check ON posts IS 
  'Content types: article, question, answer, resource, event, trace (collective memory artefact)';

-- ============================================
-- 2. TEMPORAL & SPATIAL COVERAGE (Posts Extension)
-- ============================================
-- Allow posts to specify the time period and geographic region 
-- their research covers (e.g., "Water access in Aleppo 2018-2022")

ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS temporal_coverage_start DATE,
  ADD COLUMN IF NOT EXISTS temporal_coverage_end DATE,
  ADD COLUMN IF NOT EXISTS spatial_coverage TEXT;

-- Add constraint: end date must be after start date
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_temporal_coverage_check;
ALTER TABLE posts ADD CONSTRAINT posts_temporal_coverage_check
  CHECK (temporal_coverage_end IS NULL OR temporal_coverage_start IS NULL OR temporal_coverage_end >= temporal_coverage_start);

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS posts_temporal_coverage_start_idx ON posts(temporal_coverage_start);
CREATE INDEX IF NOT EXISTS posts_temporal_coverage_end_idx ON posts(temporal_coverage_end);
CREATE INDEX IF NOT EXISTS posts_spatial_coverage_idx ON posts(spatial_coverage);

COMMENT ON COLUMN posts.temporal_coverage_start IS 'Start date of the time period this research covers';
COMMENT ON COLUMN posts.temporal_coverage_end IS 'End date of the time period this research covers';
COMMENT ON COLUMN posts.spatial_coverage IS 'Geographic region this research covers (e.g., Aleppo, Idlib, Damascus)';

-- ============================================
-- 3. CITATION TYPES (Knowledge Friction Model)
-- ============================================
-- Enable semantic citations: does a post support, dispute, extend, or merely mention another?
-- This creates a "disagreement graph" rather than just a reference list.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'citation_type') THEN
    CREATE TYPE citation_type AS ENUM ('supports', 'disputes', 'extends', 'mentions');
  END IF;
END$$;

ALTER TABLE citations 
  ADD COLUMN IF NOT EXISTS citation_type citation_type DEFAULT 'mentions';

-- Index for filtering by citation type
CREATE INDEX IF NOT EXISTS citations_type_idx ON citations(citation_type);

COMMENT ON COLUMN citations.citation_type IS 
  'Semantic relationship: supports (agrees), disputes (challenges), extends (builds upon), mentions (references)';

-- ============================================
-- 4. RESEARCH GAPS TABLE (The "Absence" Model)
-- ============================================
-- First-class modeling of what we DON'T know.
-- Researchers can identify gaps, others can claim them, and articles can address them.

CREATE TABLE IF NOT EXISTS research_gaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discipline TEXT, -- Can link to tags
  status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'investigating', 'addressed', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Who identified this gap
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Who is working on it (if anyone)
  claimed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,
  
  -- Which post addressed it (if addressed)
  addressed_by_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  addressed_at TIMESTAMP WITH TIME ZONE,
  
  -- Community voting
  upvote_count INTEGER DEFAULT 0,
  
  -- Temporal/spatial context of the gap
  temporal_context_start DATE,
  temporal_context_end DATE,
  spatial_context TEXT,
  
  -- Tags for categorization
  tags TEXT[] DEFAULT '{}'
);

-- Indexes for research_gaps
CREATE INDEX IF NOT EXISTS research_gaps_status_idx ON research_gaps(status);
CREATE INDEX IF NOT EXISTS research_gaps_priority_idx ON research_gaps(priority);
CREATE INDEX IF NOT EXISTS research_gaps_created_by_idx ON research_gaps(created_by);
CREATE INDEX IF NOT EXISTS research_gaps_claimed_by_idx ON research_gaps(claimed_by);
CREATE INDEX IF NOT EXISTS research_gaps_discipline_idx ON research_gaps(discipline);
CREATE INDEX IF NOT EXISTS research_gaps_tags_idx ON research_gaps USING GIN(tags);
CREATE INDEX IF NOT EXISTS research_gaps_upvotes_idx ON research_gaps(upvote_count DESC);

-- Enable RLS
ALTER TABLE research_gaps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for research_gaps
CREATE POLICY "Anyone can view research gaps" ON research_gaps
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create research gaps" ON research_gaps
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own gaps or claimed gaps" ON research_gaps
  FOR UPDATE
  USING (
    auth.uid() = created_by 
    OR auth.uid() = claimed_by
    OR EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Only creators or admins can delete gaps" ON research_gaps
  FOR DELETE
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_research_gaps_updated_at
  BEFORE UPDATE ON research_gaps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. RESEARCH GAP UPVOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS research_gap_upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gap_id UUID REFERENCES research_gaps(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(gap_id, user_id)
);

CREATE INDEX IF NOT EXISTS research_gap_upvotes_gap_id_idx ON research_gap_upvotes(gap_id);
CREATE INDEX IF NOT EXISTS research_gap_upvotes_user_id_idx ON research_gap_upvotes(user_id);

-- Enable RLS
ALTER TABLE research_gap_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view upvotes" ON research_gap_upvotes
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upvote" ON research_gap_upvotes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own upvotes" ON research_gap_upvotes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update upvote count
CREATE OR REPLACE FUNCTION update_research_gap_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE research_gaps SET upvote_count = upvote_count + 1 WHERE id = NEW.gap_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE research_gaps SET upvote_count = GREATEST(0, upvote_count - 1) WHERE id = OLD.gap_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER research_gap_upvote_trigger
  AFTER INSERT OR DELETE ON research_gap_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION update_research_gap_upvote_count();

-- ============================================
-- 6. IMPACT METRICS (Posts Extension)
-- ============================================
-- Shift from gamification to academic impact.
-- These metrics prioritize quality of engagement over quantity.

ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS academic_impact_score NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reuse_count INTEGER DEFAULT 0;

COMMENT ON COLUMN posts.academic_impact_score IS 'Calculated score based on quality citations (extends/supports) and scholarly engagement';
COMMENT ON COLUMN posts.reuse_count IS 'How many times this post has been forked or its data reused';

-- Index for sorting by impact
CREATE INDEX IF NOT EXISTS posts_academic_impact_score_idx ON posts(academic_impact_score DESC);
CREATE INDEX IF NOT EXISTS posts_reuse_count_idx ON posts(reuse_count DESC);

-- Function to recalculate academic impact score
-- Impact = (supports * 1) + (extends * 2) + (disputes * 0.5) + (mentions * 0.25) + (fork_count * 1.5)
CREATE OR REPLACE FUNCTION calculate_academic_impact(p_post_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_supports INTEGER;
  v_extends INTEGER;
  v_disputes INTEGER;
  v_mentions INTEGER;
  v_forks INTEGER;
  v_score NUMERIC;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE citation_type = 'supports'),
    COUNT(*) FILTER (WHERE citation_type = 'extends'),
    COUNT(*) FILTER (WHERE citation_type = 'disputes'),
    COUNT(*) FILTER (WHERE citation_type = 'mentions')
  INTO v_supports, v_extends, v_disputes, v_mentions
  FROM citations 
  WHERE target_post_id = p_post_id;
  
  SELECT COUNT(*) INTO v_forks
  FROM posts 
  WHERE (forked_from->>'id')::UUID = p_post_id;
  
  v_score := (COALESCE(v_supports, 0) * 1.0) + 
             (COALESCE(v_extends, 0) * 2.0) + 
             (COALESCE(v_disputes, 0) * 0.5) + 
             (COALESCE(v_mentions, 0) * 0.25) + 
             (COALESCE(v_forks, 0) * 1.5);
             
  RETURN ROUND(v_score, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. TRACE METADATA STRUCTURE
-- ============================================
-- Define expected metadata fields for 'trace' content type
COMMENT ON TABLE posts IS 
  'For content_type="trace", metadata should include: 
   - artifact_type: photo, audio, document, video, handwritten
   - source_context: provenance description
   - collection_date: when the artifact was collected
   - preservation_status: original, copy, transcription
   - language: language of the source material';

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Get disputed claims for a post
CREATE OR REPLACE FUNCTION get_disputes(p_post_id UUID)
RETURNS TABLE (
  disputing_post_id UUID,
  disputing_post_title TEXT,
  quote_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.source_post_id,
    p.title,
    c.quote_content,
    c.created_at
  FROM citations c
  JOIN posts p ON c.source_post_id = p.id
  WHERE c.target_post_id = p_post_id
    AND c.citation_type = 'disputes';
END;
$$ LANGUAGE plpgsql;

-- Get posts that support a claim
CREATE OR REPLACE FUNCTION get_supporting_evidence(p_post_id UUID)
RETURNS TABLE (
  supporting_post_id UUID,
  supporting_post_title TEXT,
  quote_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.source_post_id,
    p.title,
    c.quote_content,
    c.created_at
  FROM citations c
  JOIN posts p ON c.source_post_id = p.id
  WHERE c.target_post_id = p_post_id
    AND c.citation_type = 'supports';
END;
$$ LANGUAGE plpgsql;

-- Filter posts by temporal and spatial coverage
CREATE OR REPLACE FUNCTION filter_posts_by_coverage(
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_region TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content_type TEXT,
  temporal_coverage_start DATE,
  temporal_coverage_end DATE,
  spatial_coverage TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.content_type,
    p.temporal_coverage_start,
    p.temporal_coverage_end,
    p.spatial_coverage,
    p.created_at
  FROM posts p
  WHERE 
    (p_start_date IS NULL OR p.temporal_coverage_end IS NULL OR p.temporal_coverage_end >= p_start_date)
    AND (p_end_date IS NULL OR p.temporal_coverage_start IS NULL OR p.temporal_coverage_start <= p_end_date)
    AND (p_region IS NULL OR p.spatial_coverage ILIKE '%' || p_region || '%')
    AND p.status = 'published'
  ORDER BY p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. GRANT PERMISSIONS
-- ============================================
GRANT SELECT ON research_gaps TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON research_gaps TO authenticated;
GRANT SELECT ON research_gap_upvotes TO anon, authenticated;
GRANT INSERT, DELETE ON research_gap_upvotes TO authenticated;

GRANT EXECUTE ON FUNCTION get_disputes(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_supporting_evidence(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION filter_posts_by_coverage(DATE, DATE, TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_academic_impact(UUID) TO authenticated;
