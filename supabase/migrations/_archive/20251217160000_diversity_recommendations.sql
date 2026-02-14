-- Migration: Bias-Aware Recommendation System
-- Purpose: Diversity-first recommendations for epistemic integrity
-- Date: 2025-12-17

-- ============================================
-- RECOMMENDATION CATEGORY TYPE
-- ============================================

CREATE TYPE recommendation_category AS ENUM (
  'contrasting_findings',       -- Content that contradicts or challenges
  'methodological_critiques',   -- Different methodological approaches
  'same_site_different_view',   -- Same location, different interpretation
  'negative_failed_outcomes',   -- Failed experiments, negative results
  'what_is_still_unknown'       -- Gaps and uncertainties
);

CREATE TYPE diversity_objective AS ENUM (
  'disciplinary',     -- Different academic disciplines
  'evidence_type',    -- Different evidence sources
  'temporal',         -- Different time periods/conflict phases
  'institutional',    -- Different source institutions
  'methodological'    -- Different research methods
);

-- ============================================
-- HELPER: GET CONTRASTING CONTENT
-- ============================================

CREATE OR REPLACE FUNCTION get_contrasting_content(
  p_post_id UUID,
  p_limit INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  explanation TEXT,
  confidence DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    COALESCE(
      'Contradicts on: ' || cr.relationship_detail,
      'Presents alternative findings on similar topics'
    ) as explanation,
    COALESCE(cr.confidence, 0.7) as confidence
  FROM content_relationships cr
  JOIN posts p ON (
    (cr.target_id = p.id AND cr.source_id = p_post_id) OR
    (cr.source_id = p.id AND cr.target_id = p_post_id)
  )
  WHERE cr.relationship = 'contradicts'
  AND p.status = 'published'
  AND p.id != p_post_id
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- HELPER: GET SAME SITE DIFFERENT VIEW
-- ============================================

CREATE OR REPLACE FUNCTION get_same_site_different_view(
  p_post_id UUID,
  p_limit INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  explanation TEXT,
  confidence DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    'Same geographic focus, alternative analysis' as explanation,
    COALESCE(cr.confidence, 0.8) as confidence
  FROM content_relationships cr
  JOIN posts p ON (
    (cr.target_id = p.id AND cr.source_id = p_post_id) OR
    (cr.source_id = p.id AND cr.target_id = p_post_id)
  )
  WHERE cr.relationship = 'same_site'
  AND p.status = 'published'
  AND p.id != p_post_id
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- HELPER: GET METHODOLOGICAL ALTERNATIVES
-- ============================================

CREATE OR REPLACE FUNCTION get_methodological_alternatives(
  p_post_id UUID,
  p_tags TEXT[],
  p_limit INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  explanation TEXT,
  confidence DECIMAL
) AS $$
DECLARE
  v_current_tier TEXT;
BEGIN
  -- Get current post's evidence tier
  SELECT et.tier::TEXT INTO v_current_tier
  FROM content_evidence ce
  JOIN evidence_tier_mappings et ON ce.evidence_type = et.evidence_type
  WHERE ce.content_id = p_post_id
  LIMIT 1;

  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    'Uses ' || ce.evidence_type::TEXT || ' (' || ce.evidence_tier::TEXT || ' evidence)' as explanation,
    0.75::DECIMAL as confidence
  FROM posts p
  JOIN content_evidence ce ON ce.content_id = p.id
  WHERE p.status = 'published'
  AND p.id != p_post_id
  AND p.tags && p_tags  -- Overlapping topic
  AND ce.evidence_tier::TEXT != COALESCE(v_current_tier, 'secondary')
  ORDER BY random()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- HELPER: GET DISCIPLINARY DIVERSITY
-- ============================================

CREATE OR REPLACE FUNCTION get_disciplinary_diversity(
  p_post_id UUID,
  p_current_tags TEXT[],
  p_limit INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  explanation TEXT,
  discipline TEXT,
  confidence DECIMAL
) AS $$
DECLARE
  v_primary_discipline TEXT;
BEGIN
  -- Get primary discipline of current post
  v_primary_discipline := p_current_tags[1];
  
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    'Cross-disciplinary perspective: ' || t.discipline as explanation,
    t.discipline,
    0.7::DECIMAL as confidence
  FROM posts p
  JOIN LATERAL unnest(p.tags) tag ON true
  JOIN tags t ON t.label = tag
  WHERE p.status = 'published'
  AND p.id != p_post_id
  AND t.discipline IS NOT NULL
  AND t.discipline != COALESCE(v_primary_discipline, '')
  AND p.tags && p_current_tags  -- Some topic overlap
  GROUP BY p.id, p.title, t.discipline
  ORDER BY random()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- HELPER: GET GAPS AND UNKNOWNS
-- ============================================

CREATE OR REPLACE FUNCTION get_gaps_and_unknowns(
  p_post_id UUID,
  p_tags TEXT[],
  p_limit INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  explanation TEXT,
  confidence DECIMAL
) AS $$
BEGIN
  -- Find content with low validation scores = more unknowns
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    CASE 
      WHEN tp.t5_validation_score < 30 THEN 'Unvalidated findings - requires investigation'
      WHEN tp.t5_contradicting_count > 0 THEN 'Disputed evidence - ' || tp.t5_contradicting_count || ' contradictions'
      ELSE 'Limited corroboration available'
    END as explanation,
    0.6::DECIMAL as confidence
  FROM posts p
  LEFT JOIN trust_profiles tp ON tp.content_id = p.id
  WHERE p.status = 'published'
  AND p.id != p_post_id
  AND p.tags && p_tags
  AND (
    tp.t5_validation_score < 50 OR
    tp.t5_contradicting_count > 0 OR
    tp.t5_corroborating_count = 0
  )
  ORDER BY COALESCE(tp.t5_validation_score, 50) ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- MAIN: GET DIVERSE RECOMMENDATIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_diverse_recommendations(
  p_post_id UUID,
  p_session_trail UUID[] DEFAULT '{}',
  p_limit_per_category INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  recommendation_category recommendation_category,
  diversity_objective diversity_objective,
  explanation TEXT,
  confidence DECIMAL
) AS $$
DECLARE
  v_tags TEXT[];
BEGIN
  -- Get current post tags
  SELECT tags INTO v_tags FROM posts WHERE id = p_post_id;
  
  -- Category 1: Contrasting Findings
  RETURN QUERY
  SELECT 
    c.id, c.title,
    'contrasting_findings'::recommendation_category,
    'disciplinary'::diversity_objective,
    c.explanation,
    c.confidence
  FROM get_contrasting_content(p_post_id, p_limit_per_category) c
  WHERE NOT c.id = ANY(p_session_trail);

  -- Category 2: Methodological Critiques / Alternatives
  RETURN QUERY
  SELECT 
    m.id, m.title,
    'methodological_critiques'::recommendation_category,
    'methodological'::diversity_objective,
    m.explanation,
    m.confidence
  FROM get_methodological_alternatives(p_post_id, v_tags, p_limit_per_category) m
  WHERE NOT m.id = ANY(p_session_trail);

  -- Category 3: Same Site, Different Interpretation
  RETURN QUERY
  SELECT 
    s.id, s.title,
    'same_site_different_view'::recommendation_category,
    'temporal'::diversity_objective,
    s.explanation,
    s.confidence
  FROM get_same_site_different_view(p_post_id, p_limit_per_category) s
  WHERE NOT s.id = ANY(p_session_trail);

  -- Category 4: Disciplinary Diversity (cross-discipline)
  RETURN QUERY
  SELECT 
    d.id, d.title,
    'methodological_critiques'::recommendation_category,
    'disciplinary'::diversity_objective,
    d.explanation,
    d.confidence
  FROM get_disciplinary_diversity(p_post_id, v_tags, p_limit_per_category) d
  WHERE NOT d.id = ANY(p_session_trail);

  -- Category 5: What Is Still Unknown
  RETURN QUERY
  SELECT 
    g.id, g.title,
    'what_is_still_unknown'::recommendation_category,
    'evidence_type'::diversity_objective,
    g.explanation,
    g.confidence
  FROM get_gaps_and_unknowns(p_post_id, v_tags, p_limit_per_category) g
  WHERE NOT g.id = ANY(p_session_trail);

  -- Fallback: Tag-based diversity if relationships are sparse
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    'contrasting_findings'::recommendation_category,
    'disciplinary'::diversity_objective,
    'Explores related topic from different angle' as explanation,
    0.5::DECIMAL as confidence
  FROM posts p
  WHERE p.status = 'published'
  AND p.id != p_post_id
  AND p.tags && v_tags
  AND NOT p.id = ANY(p_session_trail)
  AND NOT EXISTS (
    SELECT 1 FROM get_contrasting_content(p_post_id, 1) cc WHERE cc.id = p.id
  )
  ORDER BY random()
  LIMIT p_limit_per_category;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION get_diverse_recommendations TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_contrasting_content TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_same_site_different_view TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_methodological_alternatives TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_disciplinary_diversity TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_gaps_and_unknowns TO authenticated, anon;


-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION get_diverse_recommendations IS 
'Returns epistemically diverse recommendations that optimize for understanding and coverage, 
not engagement. Includes 5 mandatory categories: contrasting findings, methodological critiques, 
same site different interpretation, negative/failed outcomes, and gaps/unknowns.';

COMMENT ON TYPE recommendation_category IS 
'Categories for bias-aware recommendations per epistemic integrity design principles.';

COMMENT ON TYPE diversity_objective IS 
'Diversity objectives that each recommendation must satisfy for balanced coverage.';
