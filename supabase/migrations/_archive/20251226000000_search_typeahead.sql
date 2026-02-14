-- Search Typeahead Enhancement
-- Migration: 20251226000000_search_typeahead.sql
-- Purpose: Add inline typeahead autocomplete with popular search term tracking

-- ============================================
-- POPULAR SEARCH TERMS TABLE
-- Tracks frequently searched terms for typeahead suggestions
-- ============================================

CREATE TABLE IF NOT EXISTS popular_search_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL UNIQUE,
  search_count INT DEFAULT 1,
  last_searched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast prefix matching
CREATE INDEX IF NOT EXISTS idx_popular_search_terms_term 
ON popular_search_terms USING GIN (term gin_trgm_ops);

-- Index for sorting by popularity
CREATE INDEX IF NOT EXISTS idx_popular_search_terms_count 
ON popular_search_terms (search_count DESC);

-- ============================================
-- COMMON WORDS SEED DATA
-- Pre-populate with Syria-related terms for immediate typeahead
-- ============================================

INSERT INTO popular_search_terms (term, search_count) VALUES
  ('reconstruction', 100),
  ('heritage', 90),
  ('Aleppo', 85),
  ('Damascus', 85),
  ('architecture', 80),
  ('urban planning', 75),
  ('infrastructure', 70),
  ('cultural heritage', 65),
  ('housing', 60),
  ('displacement', 55),
  ('conflict', 50),
  ('humanitarian', 50),
  ('preservation', 45),
  ('restoration', 45),
  ('archaeological', 40),
  ('historical sites', 40),
  ('building damage', 35),
  ('assessment', 35),
  ('satellite imagery', 30),
  ('remote sensing', 30),
  ('GIS mapping', 25),
  ('survey', 25),
  ('documentation', 25),
  ('memory', 20),
  ('oral history', 20),
  ('community', 20),
  ('governance', 15),
  ('policy', 15),
  ('land rights', 15),
  ('property', 15)
ON CONFLICT (term) DO NOTHING;


-- ============================================
-- GET TYPEAHEAD COMPLETION FUNCTION
-- Returns the best completion for a given prefix
-- ============================================

CREATE OR REPLACE FUNCTION get_typeahead_completion(
  p_prefix TEXT
)
RETURNS TABLE(
  completion TEXT,
  full_term TEXT,
  source TEXT
) AS $$
DECLARE
  v_normalized_prefix TEXT;
  v_last_word TEXT;
  v_prefix_before_last TEXT;
BEGIN
  -- Normalize prefix
  v_normalized_prefix := lower(trim(p_prefix));
  
  IF length(v_normalized_prefix) < 2 THEN
    RETURN;
  END IF;
  
  -- Extract last word being typed
  v_last_word := (regexp_matches(v_normalized_prefix, '(\S+)$'))[1];
  v_prefix_before_last := regexp_replace(v_normalized_prefix, '\S+$', '');
  
  -- First, try to match popular search terms
  RETURN QUERY
  SELECT 
    substring(pst.term from length(v_normalized_prefix) + 1) as completion,
    pst.term as full_term,
    'popular'::TEXT as source
  FROM popular_search_terms pst
  WHERE lower(pst.term) LIKE v_normalized_prefix || '%'
  ORDER BY pst.search_count DESC
  LIMIT 1;
  
  -- If we got a result, return
  IF FOUND THEN
    RETURN;
  END IF;
  
  -- Fallback: Try matching just the last word against popular terms
  IF length(v_last_word) >= 2 THEN
    RETURN QUERY
    SELECT 
      substring(pst.term from length(v_last_word) + 1) as completion,
      v_prefix_before_last || pst.term as full_term,
      'popular_word'::TEXT as source
    FROM popular_search_terms pst
    WHERE lower(pst.term) LIKE v_last_word || '%'
    ORDER BY pst.search_count DESC
    LIMIT 1;
    
    IF FOUND THEN
      RETURN;
    END IF;
  END IF;
  
  -- Fallback: Match post titles starting with the prefix
  RETURN QUERY
  SELECT 
    substring(lower(p.title) from length(v_normalized_prefix) + 1) as completion,
    lower(p.title) as full_term,
    'title'::TEXT as source
  FROM posts p
  WHERE p.status = 'published'
    AND lower(p.title) LIKE v_normalized_prefix || '%'
  ORDER BY p.view_count DESC NULLS LAST
  LIMIT 1;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- TRACK SEARCH TERM FUNCTION
-- Call this when a search is performed to update popularity
-- ============================================

CREATE OR REPLACE FUNCTION track_search_term(
  p_term TEXT
)
RETURNS void AS $$
DECLARE
  v_normalized_term TEXT;
BEGIN
  -- Normalize: lowercase, trim, remove extra spaces
  v_normalized_term := lower(trim(regexp_replace(p_term, '\s+', ' ', 'g')));
  
  -- Skip very short or very long terms
  IF length(v_normalized_term) < 3 OR length(v_normalized_term) > 100 THEN
    RETURN;
  END IF;
  
  -- Insert or update the term count
  INSERT INTO popular_search_terms (term, search_count, last_searched_at)
  VALUES (v_normalized_term, 1, NOW())
  ON CONFLICT (term) DO UPDATE
  SET 
    search_count = popular_search_terms.search_count + 1,
    last_searched_at = NOW();
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE popular_search_terms ENABLE ROW LEVEL SECURITY;

-- Everyone can read popular terms
CREATE POLICY "Anyone can read popular search terms"
  ON popular_search_terms FOR SELECT
  USING (true);

-- Only the system can modify (via functions)
-- No direct insert/update/delete policies for regular users


-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
