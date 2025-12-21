-- ============================================
-- RESEARCH GAP ENHANCEMENTS
-- Migration: 20251221140000_research_gap_enhancements.sql
-- 
-- This migration extends the research_gaps feature with:
-- 1. Gap types (topical, data, methodological, population, outdated)
-- 2. Strategic priority flagging
-- 3. Collaboration features (express interest, suggest readings)
-- 4. AI suggestion tracking
-- ============================================

-- ============================================
-- 1. GAP TYPE ENUM
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'research_gap_type') THEN
    CREATE TYPE research_gap_type AS ENUM (
      'topical',        -- Traditional absence of topic coverage
      'data',           -- Missing datasets or data quality issues
      'methodological', -- Disputes about research methods
      'population',     -- Under-represented populations in research
      'outdated'        -- Existing research is stale/needs update
    );
  END IF;
END$$;

-- ============================================
-- 2. EXTEND RESEARCH_GAPS TABLE
-- ============================================
ALTER TABLE research_gaps 
  ADD COLUMN IF NOT EXISTS gap_type research_gap_type DEFAULT 'topical',
  ADD COLUMN IF NOT EXISTS is_strategic BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS linked_failed_queries JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS interest_count INTEGER DEFAULT 0;

-- Source constraint
ALTER TABLE research_gaps DROP CONSTRAINT IF EXISTS research_gaps_source_check;
ALTER TABLE research_gaps ADD CONSTRAINT research_gaps_source_check 
  CHECK (source IN ('manual', 'ai_suggested', 'failed_query'));

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS research_gaps_gap_type_idx ON research_gaps(gap_type);
CREATE INDEX IF NOT EXISTS research_gaps_is_strategic_idx ON research_gaps(is_strategic) WHERE is_strategic = true;
CREATE INDEX IF NOT EXISTS research_gaps_source_idx ON research_gaps(source);

COMMENT ON COLUMN research_gaps.gap_type IS 'Type of gap: topical, data, methodological, population, or outdated';
COMMENT ON COLUMN research_gaps.is_strategic IS 'Flagged as a strategic priority by the community';
COMMENT ON COLUMN research_gaps.source IS 'How this gap was identified: manual, ai_suggested, or failed_query';
COMMENT ON COLUMN research_gaps.linked_failed_queries IS 'Array of search queries that yielded no results related to this gap';
COMMENT ON COLUMN research_gaps.interest_count IS 'Number of researchers who expressed interest in collaborating';

-- ============================================
-- 3. COLLABORATION: EXPRESS INTEREST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS research_gap_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gap_id UUID NOT NULL REFERENCES research_gaps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note TEXT,  -- Optional: "I have satellite imagery for this region"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(gap_id, user_id)
);

CREATE INDEX IF NOT EXISTS research_gap_interests_gap_id_idx ON research_gap_interests(gap_id);
CREATE INDEX IF NOT EXISTS research_gap_interests_user_id_idx ON research_gap_interests(user_id);

-- Enable RLS
ALTER TABLE research_gap_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view interests" ON research_gap_interests
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can express interest" ON research_gap_interests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own interest" ON research_gap_interests
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update interest_count
CREATE OR REPLACE FUNCTION update_research_gap_interest_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE research_gaps SET interest_count = interest_count + 1 WHERE id = NEW.gap_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE research_gaps SET interest_count = GREATEST(0, interest_count - 1) WHERE id = OLD.gap_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS research_gap_interest_trigger ON research_gap_interests;
CREATE TRIGGER research_gap_interest_trigger
  AFTER INSERT OR DELETE ON research_gap_interests
  FOR EACH ROW
  EXECUTE FUNCTION update_research_gap_interest_count();

-- ============================================
-- 4. SUGGESTED READINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS research_gap_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gap_id UUID NOT NULL REFERENCES research_gaps(id) ON DELETE CASCADE,
  suggested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  url TEXT,  -- External URL
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,  -- Internal post link
  note TEXT,  -- Why this is relevant
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS research_gap_suggestions_gap_id_idx ON research_gap_suggestions(gap_id);
CREATE INDEX IF NOT EXISTS research_gap_suggestions_suggested_by_idx ON research_gap_suggestions(suggested_by);
CREATE INDEX IF NOT EXISTS research_gap_suggestions_post_id_idx ON research_gap_suggestions(post_id);

-- Enable RLS
ALTER TABLE research_gap_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view suggestions" ON research_gap_suggestions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can suggest readings" ON research_gap_suggestions
  FOR INSERT WITH CHECK (auth.uid() = suggested_by);

CREATE POLICY "Users can delete their own suggestions" ON research_gap_suggestions
  FOR DELETE USING (auth.uid() = suggested_by);

-- ============================================
-- 5. GRANT PERMISSIONS
-- ============================================
GRANT SELECT ON research_gap_interests TO anon, authenticated;
GRANT INSERT, DELETE ON research_gap_interests TO authenticated;
GRANT SELECT ON research_gap_suggestions TO anon, authenticated;
GRANT INSERT, DELETE ON research_gap_suggestions TO authenticated;
