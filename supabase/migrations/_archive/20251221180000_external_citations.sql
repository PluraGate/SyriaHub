-- ============================================
-- EXTERNAL CITATIONS SUPPORT
-- Migration: 20251221180000_external_citations.sql
-- Purpose: Add support for external citations (DOI, URL) and improve auditability
-- ============================================

-- ============================================
-- PART 1: DROP BROKEN ENUM (if exists) AND USE TEXT WITH CHECK CONSTRAINT
-- Note: Using TEXT + CHECK instead of ENUM due to database state issues
-- ============================================

-- First, drop the type column if it exists with the broken ENUM
DO $$ BEGIN
  ALTER TABLE citations DROP COLUMN IF EXISTS type;
EXCEPTION
  WHEN undefined_column THEN null;
END $$;

-- Drop the problematic ENUM type if it exists
DROP TYPE IF EXISTS citation_type CASCADE;

-- ============================================
-- PART 2: ADD NEW COLUMNS TO CITATIONS
-- ============================================

-- Add citation type column as TEXT with default for backwards compatibility
ALTER TABLE citations ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'internal';

-- Add constraint to validate type values
ALTER TABLE citations DROP CONSTRAINT IF EXISTS citation_type_check;
ALTER TABLE citations ADD CONSTRAINT citation_type_check CHECK (type IN ('internal', 'external'));

-- Add created_by for auditability (independent of source post ownership)
ALTER TABLE citations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- External citation fields
ALTER TABLE citations ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE citations ADD COLUMN IF NOT EXISTS external_doi TEXT;
ALTER TABLE citations ADD COLUMN IF NOT EXISTS external_title TEXT;
ALTER TABLE citations ADD COLUMN IF NOT EXISTS external_author TEXT;
ALTER TABLE citations ADD COLUMN IF NOT EXISTS external_year INT;
ALTER TABLE citations ADD COLUMN IF NOT EXISTS external_source TEXT; -- e.g., "Nature", "World Bank Report"

-- ============================================
-- PART 3: MAKE TARGET_POST_ID NULLABLE
-- ============================================

-- External citations don't have a target post within SyriaHub
ALTER TABLE citations ALTER COLUMN target_post_id DROP NOT NULL;

-- ============================================
-- PART 4: CONSTRAINTS
-- ============================================

-- Remove the old constraint that requires different posts (internal only)
ALTER TABLE citations DROP CONSTRAINT IF EXISTS different_posts;

-- Drop old completeness check if exists
ALTER TABLE citations DROP CONSTRAINT IF EXISTS citation_completeness_check;

-- Add comprehensive citation type constraint
-- Internal: must have target_post_id, source != target
-- External: must have DOI or URL, no target_post_id needed
ALTER TABLE citations ADD CONSTRAINT citation_completeness_check CHECK (
  CASE 
    WHEN type = 'internal' THEN 
      target_post_id IS NOT NULL AND source_post_id != target_post_id
    WHEN type = 'external' THEN 
      (external_doi IS NOT NULL AND external_doi != '') OR 
      (external_url IS NOT NULL AND external_url != '')
    ELSE false
  END
);

-- ============================================
-- PART 5: DOI NORMALIZATION FUNCTION
-- ============================================

-- Normalize DOI: lowercase, trim, remove common prefixes
CREATE OR REPLACE FUNCTION normalize_doi(raw_doi TEXT)
RETURNS TEXT AS $$
DECLARE
  normalized TEXT;
BEGIN
  IF raw_doi IS NULL OR raw_doi = '' THEN
    RETURN NULL;
  END IF;
  
  -- Trim whitespace
  normalized := TRIM(raw_doi);
  
  -- Remove common URL prefixes
  normalized := REGEXP_REPLACE(normalized, '^https?://(dx\.)?doi\.org/', '', 'i');
  normalized := REGEXP_REPLACE(normalized, '^doi:', '', 'i');
  
  -- Lowercase for consistency
  normalized := LOWER(normalized);
  
  RETURN normalized;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- PART 6: TRIGGER FOR DOI NORMALIZATION
-- ============================================

CREATE OR REPLACE FUNCTION normalize_citation_doi()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.external_doi IS NOT NULL THEN
    NEW.external_doi := normalize_doi(NEW.external_doi);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalize_citation_doi ON citations;
CREATE TRIGGER trg_normalize_citation_doi
  BEFORE INSERT OR UPDATE ON citations
  FOR EACH ROW EXECUTE FUNCTION normalize_citation_doi();

-- ============================================
-- PART 7: INDEXES
-- ============================================

-- Index for References section (outgoing citations from a post)
CREATE INDEX IF NOT EXISTS citations_source_post_id_idx ON citations(source_post_id);

-- Index for external DOI lookups (dedupe, search)
CREATE INDEX IF NOT EXISTS citations_external_doi_idx ON citations(external_doi) 
  WHERE external_doi IS NOT NULL;

-- Index for citation type filtering
CREATE INDEX IF NOT EXISTS citations_type_idx ON citations(type);

-- ============================================
-- PART 8: UPDATE RLS POLICIES
-- ============================================

-- Drop old insert policy to recreate with created_by
DROP POLICY IF EXISTS "Authenticated users can create citations" ON citations;

-- New insert policy that sets created_by
CREATE POLICY "Authenticated users can create citations" ON citations
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Note: created_by should be set by the API, not trusted from client
-- The API will use auth.uid() to populate this field

-- ============================================
-- PART 9: BACKFILL CREATED_BY FOR EXISTING CITATIONS
-- ============================================

-- Set created_by from source post author for existing internal citations
UPDATE citations c
SET created_by = p.author_id
FROM posts p
WHERE c.source_post_id = p.id
  AND c.created_by IS NULL;

-- ============================================
-- DONE
-- ============================================

COMMENT ON COLUMN citations.type IS 'Citation type: internal (SyriaHub post) or external (DOI/URL)';
COMMENT ON COLUMN citations.created_by IS 'User who created the citation (independent of source post ownership)';
COMMENT ON COLUMN citations.external_doi IS 'Normalized DOI (lowercase, no URL prefix)';
COMMENT ON COLUMN citations.external_url IS 'External URL for non-DOI sources';
COMMENT ON COLUMN citations.external_source IS 'Source name, e.g., "Nature", "World Bank"';

NOTIFY pgrst, 'reload schema';
