-- Semantic Search with pgvector
-- Migration: 20251217000005_semantic_search.sql
-- Purpose: AI-powered embeddings for explainable, discipline-aware search

-- ============================================
-- PREREQUISITES: Enable pgvector
-- ============================================

CREATE EXTENSION IF NOT EXISTS vector;


-- ============================================
-- CONTENT EMBEDDINGS
-- ============================================

CREATE TABLE content_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'resource', 'external_data')),
  
  -- Embedding vector (OpenAI text-embedding-3-small = 1536 dimensions)
  embedding vector(1536),
  
  -- Metadata for explanation
  embedded_text TEXT, -- The text that was embedded (for explaining matches)
  embedding_model TEXT DEFAULT 'text-embedding-3-small',
  
  -- Freshness
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(content_id, content_type)
);

-- IVFFlat index for fast similarity search
CREATE INDEX ON content_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_embeddings_content ON content_embeddings(content_id, content_type);


-- ============================================
-- SEARCH SESSIONS (for explainability)
-- ============================================

CREATE TABLE search_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  
  -- Query
  query_text TEXT NOT NULL,
  query_embedding vector(1536),
  
  -- Filters applied
  disciplines discipline[] DEFAULT '{}',
  evidence_tiers evidence_tier[] DEFAULT '{}',
  conflict_phase conflict_phase,
  date_range TSTZRANGE,
  location_filter GEOMETRY,
  location_radius_km INT,
  
  -- Results summary
  result_count INT DEFAULT 0,
  top_result_id UUID,
  
  -- Timing
  search_duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_search_sessions_user ON search_sessions(user_id);
CREATE INDEX idx_search_sessions_time ON search_sessions(created_at);


-- ============================================
-- SEARCH RESULT EXPLANATIONS
-- ============================================

CREATE TABLE search_result_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES search_sessions(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  
  -- Ranking
  rank_position INT NOT NULL,
  similarity_score DECIMAL(5,4), -- 0.0000 to 1.0000
  final_score DECIMAL(5,4), -- After applying trust/evidence weights
  
  -- Why it matched (explainability)
  match_reasons JSONB NOT NULL DEFAULT '[]',
  -- Example: [
  --   {"reason": "Query term 'housing' in title", "weight": 0.4},
  --   {"reason": "Discipline match: urban_planning", "weight": 0.2},
  --   {"reason": "High trust score (85)", "weight": 0.2}
  -- ]
  
  -- Supporting data
  supporting_evidence JSONB DEFAULT '[]',
  -- Example: [
  --   {"type": "citation", "count": 5, "detail": "Cited by 5 peer-reviewed posts"},
  --   {"type": "linked_resource", "count": 3, "types": ["satellite_imagery", "field_survey"]}
  -- ]
  
  -- Credibility assessment
  credibility_score INT CHECK (credibility_score BETWEEN 0 AND 100),
  credibility_breakdown JSONB DEFAULT '{}',
  -- Example: {
  --   "author_verification": 20,
  --   "citation_count": 25,
  --   "peer_review_status": 25,
  --   "linked_resources": 15,
  --   "data_freshness": 15
  -- }
  
  -- Data gaps & uncertainty
  data_gaps JSONB DEFAULT '[]',
  -- Example: [
  --   {"gap": "No on-ground verification", "severity": "medium"},
  --   {"gap": "Data from 2019, may be outdated", "severity": "low"}
  -- ]
  
  uncertainty_flags JSONB DEFAULT '[]',
  -- Example: [
  --   {"flag": "Contradicted by 2 sources", "detail": "Damage extent estimation"},
  --   {"flag": "Author affiliation unverified", "detail": null}
  -- ]
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_explanations_session ON search_result_explanations(session_id);
CREATE INDEX idx_explanations_content ON search_result_explanations(content_id, content_type);


-- ============================================
-- FUNCTIONS: Semantic Search
-- ============================================

-- Main semantic search function
CREATE OR REPLACE FUNCTION semantic_search(
  p_query_embedding vector(1536),
  p_limit INT DEFAULT 20,
  p_disciplines discipline[] DEFAULT NULL,
  p_evidence_tiers evidence_tier[] DEFAULT NULL,
  p_conflict_phase conflict_phase DEFAULT NULL,
  p_min_trust_score INT DEFAULT 0
)
RETURNS TABLE(
  content_id UUID,
  content_type TEXT,
  similarity DECIMAL(5,4),
  evidence_tier evidence_tier,
  trust_score INT,
  final_score DECIMAL(5,4)
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked AS (
    SELECT 
      ce.content_id,
      ce.content_type,
      (1 - (ce.embedding <=> p_query_embedding))::DECIMAL(5,4) as similarity,
      COALESCE(cev.evidence_tier, 'secondary') as evidence_tier,
      COALESCE((tp.t1_source_score + tp.t2_method_score + tp.t3_proximity_score + tp.t4_temporal_score + tp.t5_validation_score) / 5, 50) as trust_score
    FROM content_embeddings ce
    LEFT JOIN content_evidence cev ON cev.content_id = ce.content_id AND cev.content_type = ce.content_type
    LEFT JOIN trust_profiles tp ON tp.content_id = ce.content_id AND tp.content_type = ce.content_type
    -- Filter by disciplines if provided
    WHERE (p_disciplines IS NULL OR EXISTS (
      SELECT 1 FROM content_disciplines cd
      WHERE cd.content_id = ce.content_id 
      AND cd.content_type = ce.content_type
      AND cd.discipline = ANY(p_disciplines)
    ))
    -- Filter by evidence tier if provided
    AND (p_evidence_tiers IS NULL OR COALESCE(cev.evidence_tier, 'secondary') = ANY(p_evidence_tiers))
    -- Filter by minimum trust score
    AND COALESCE((tp.t1_source_score + tp.t2_method_score + tp.t3_proximity_score + tp.t4_temporal_score + tp.t5_validation_score) / 5, 50) >= p_min_trust_score
  )
  SELECT 
    r.content_id,
    r.content_type,
    r.similarity,
    r.evidence_tier,
    r.trust_score::INT,
    -- Final score: weighted combination of similarity, evidence tier, and trust
    (
      r.similarity * 0.5 +
      CASE r.evidence_tier
        WHEN 'primary' THEN 0.25
        WHEN 'secondary' THEN 0.15
        WHEN 'derived' THEN 0.08
        WHEN 'interpretive' THEN 0.02
        ELSE 0.1
      END +
      (r.trust_score::DECIMAL / 400) -- Normalize trust to 0.0-0.25 contribution
    )::DECIMAL(5,4) as final_score
  FROM ranked r
  ORDER BY final_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


-- Calculate credibility score for a piece of content
CREATE OR REPLACE FUNCTION calculate_credibility_score(
  p_content_id UUID,
  p_content_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_score INT := 0;
  v_breakdown JSONB := '{}';
  v_author_verified BOOLEAN;
  v_citation_count INT;
  v_review_status TEXT;
  v_linked_count INT;
  v_data_age INT;
BEGIN
  -- Author verification (20 points max)
  IF p_content_type = 'post' THEN
    SELECT EXISTS(
      SELECT 1 FROM expert_verifications ev
      JOIN posts p ON p.author_id = ev.user_id
      WHERE p.id = p_content_id AND ev.status = 'approved'
    ) INTO v_author_verified;
    
    IF v_author_verified THEN
      v_score := v_score + 20;
      v_breakdown := v_breakdown || '{"author_verification": 20}';
    ELSE
      v_breakdown := v_breakdown || '{"author_verification": 0}';
    END IF;
  END IF;
  
  -- Citation count (25 points max)
  SELECT COUNT(*) INTO v_citation_count
  FROM content_relationships
  WHERE target_id = p_content_id 
  AND target_type = p_content_type
  AND relationship = 'supports';
  
  v_score := v_score + LEAST(v_citation_count * 5, 25);
  v_breakdown := v_breakdown || jsonb_build_object('citation_count', LEAST(v_citation_count * 5, 25));
  
  -- Peer review status (25 points max)
  IF p_content_type = 'post' THEN
    SELECT review_status INTO v_review_status FROM posts WHERE id = p_content_id;
    CASE v_review_status
      WHEN 'peer_reviewed' THEN
        v_score := v_score + 25;
        v_breakdown := v_breakdown || '{"peer_review_status": 25}';
      WHEN 'under_review' THEN
        v_score := v_score + 10;
        v_breakdown := v_breakdown || '{"peer_review_status": 10}';
      ELSE
        v_breakdown := v_breakdown || '{"peer_review_status": 0}';
    END CASE;
  END IF;
  
  -- Linked resources (15 points max)
  SELECT COUNT(*) INTO v_linked_count
  FROM linked_resources
  WHERE source_id = p_content_id AND source_type = p_content_type;
  
  v_score := v_score + LEAST(v_linked_count * 3, 15);
  v_breakdown := v_breakdown || jsonb_build_object('linked_resources', LEAST(v_linked_count * 3, 15));
  
  -- Data freshness (15 points max)
  IF p_content_type = 'post' THEN
    SELECT EXTRACT(DAYS FROM NOW() - created_at)::INT INTO v_data_age
    FROM posts WHERE id = p_content_id;
    
    IF v_data_age < 90 THEN
      v_score := v_score + 15;
      v_breakdown := v_breakdown || '{"data_freshness": 15}';
    ELSIF v_data_age < 365 THEN
      v_score := v_score + 10;
      v_breakdown := v_breakdown || '{"data_freshness": 10}';
    ELSIF v_data_age < 730 THEN
      v_score := v_score + 5;
      v_breakdown := v_breakdown || '{"data_freshness": 5}';
    ELSE
      v_breakdown := v_breakdown || '{"data_freshness": 0}';
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'total_score', v_score,
    'breakdown', v_breakdown
  );
END;
$$ LANGUAGE plpgsql;


-- Get data gaps for a piece of content
CREATE OR REPLACE FUNCTION get_data_gaps(
  p_content_id UUID,
  p_content_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_gaps JSONB := '[]';
  v_trust trust_profiles;
  v_has_field_evidence BOOLEAN;
  v_has_geo BOOLEAN;
  v_contradictions INT;
BEGIN
  -- Get trust profile
  SELECT * INTO v_trust
  FROM trust_profiles
  WHERE content_id = p_content_id AND content_type = p_content_type;
  
  -- Check for field evidence
  SELECT EXISTS(
    SELECT 1 FROM linked_resources
    WHERE source_id = p_content_id 
    AND source_type = p_content_type
    AND resource_type IN ('field_survey', 'ground_photo', 'laser_scan')
  ) INTO v_has_field_evidence;
  
  IF NOT v_has_field_evidence THEN
    v_gaps := v_gaps || '[{"gap": "No on-ground verification", "severity": "medium"}]'::jsonb;
  END IF;
  
  -- Check for geo-tagging
  SELECT EXISTS(
    SELECT 1 FROM linked_resources
    WHERE source_id = p_content_id 
    AND source_type = p_content_type
    AND geometry IS NOT NULL
  ) INTO v_has_geo;
  
  IF NOT v_has_geo THEN
    v_gaps := v_gaps || '[{"gap": "No geographic location tagged", "severity": "low"}]'::jsonb;
  END IF;
  
  -- Check for contradictions
  SELECT COUNT(*) INTO v_contradictions
  FROM content_relationships
  WHERE target_id = p_content_id 
  AND target_type = p_content_type
  AND relationship = 'contradicts';
  
  IF v_contradictions > 0 THEN
    v_gaps := v_gaps || jsonb_build_array(
      jsonb_build_object(
        'gap', 'Contradicted by ' || v_contradictions || ' source(s)',
        'severity', 'high'
      )
    );
  END IF;
  
  -- Check temporal relevance
  IF v_trust.t4_is_time_sensitive AND v_trust.t4_data_timestamp < NOW() - INTERVAL '1 year' THEN
    v_gaps := v_gaps || '[{"gap": "Time-sensitive data may be outdated", "severity": "medium"}]'::jsonb;
  END IF;
  
  RETURN v_gaps;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update embedding timestamp
CREATE OR REPLACE FUNCTION update_embedding_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_embedding_updated
  BEFORE UPDATE ON content_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_embedding_timestamp();


-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE content_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_result_explanations ENABLE ROW LEVEL SECURITY;

-- Embeddings: system access only (created by background jobs)
CREATE POLICY "Public read embeddings" ON content_embeddings
  FOR SELECT USING (true);

-- Search sessions: users see their own
CREATE POLICY "Users see own search sessions" ON search_sessions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users create search sessions" ON search_sessions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Explanations: follow session ownership
CREATE POLICY "Users see own explanations" ON search_result_explanations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM search_sessions ss
      WHERE ss.id = search_result_explanations.session_id
      AND (ss.user_id = auth.uid() OR ss.user_id IS NULL)
    )
  );


-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
