-- Search Ontology Schema for SyriaHub Research Engine
-- Migration: 20251217000001_search_ontology.sql
-- Purpose: Disciplines, evidence types, trust vectors, relationships

-- ============================================
-- PART 1: DISCIPLINE LAYER
-- ============================================

-- 6 main categories, 26 sub-disciplines
CREATE TYPE discipline AS ENUM (
  -- Built Environment
  'architecture',
  'structural_engineering',
  'urban_planning',
  'heritage_conservation',
  'construction_methods',
  
  -- Earth & Spatial
  'gis_remote_sensing',
  'topography_surveying',
  'environmental_science',
  'hydrology_climate',
  
  -- Data & Tech
  'digital_twins',
  'bim_scan',
  'ai_ml',
  'iot_monitoring',
  'simulation_modelling',
  
  -- Socio-Political
  'governance_policy',
  'housing_land_property',
  'legal_frameworks',
  'economics_financing',
  
  -- Human & Cultural
  'sociology',
  'anthropology',
  'oral_history',
  'memory_documentation',
  'conflict_studies',
  
  -- Transitional Infrastructure (Bridge Category)
  'shelter_housing',
  'water_sanitation',
  'energy_infrastructure',
  'transport_logistics'
);

-- Discipline categories for grouping
CREATE TABLE discipline_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0
);

INSERT INTO discipline_categories (id, name, name_ar, description, sort_order) VALUES
  ('built_environment', 'Built Environment', 'البيئة المبنية', 'Architecture, engineering, planning, heritage', 1),
  ('earth_spatial', 'Earth & Spatial', 'الأرض والمكان', 'GIS, remote sensing, environment, hydrology', 2),
  ('data_tech', 'Data & Tech', 'البيانات والتقنية', 'Digital twins, BIM, AI/ML, IoT', 3),
  ('socio_political', 'Socio-Political', 'الاجتماعي والسياسي', 'Governance, HLP, legal, economics', 4),
  ('human_cultural', 'Human & Cultural', 'الإنساني والثقافي', 'Sociology, anthropology, oral history', 5),
  ('transitional', 'Transitional Infrastructure', 'البنية التحتية الانتقالية', 'Shelter, WASH, energy, transport bridge solutions', 6);

-- Discipline to category mapping
CREATE TABLE discipline_mappings (
  discipline discipline PRIMARY KEY,
  category_id TEXT REFERENCES discipline_categories(id) NOT NULL
);

INSERT INTO discipline_mappings (discipline, category_id) VALUES
  ('architecture', 'built_environment'),
  ('structural_engineering', 'built_environment'),
  ('urban_planning', 'built_environment'),
  ('heritage_conservation', 'built_environment'),
  ('construction_methods', 'built_environment'),
  ('gis_remote_sensing', 'earth_spatial'),
  ('topography_surveying', 'earth_spatial'),
  ('environmental_science', 'earth_spatial'),
  ('hydrology_climate', 'earth_spatial'),
  ('digital_twins', 'data_tech'),
  ('bim_scan', 'data_tech'),
  ('ai_ml', 'data_tech'),
  ('iot_monitoring', 'data_tech'),
  ('simulation_modelling', 'data_tech'),
  ('governance_policy', 'socio_political'),
  ('housing_land_property', 'socio_political'),
  ('legal_frameworks', 'socio_political'),
  ('economics_financing', 'socio_political'),
  ('sociology', 'human_cultural'),
  ('anthropology', 'human_cultural'),
  ('oral_history', 'human_cultural'),
  ('memory_documentation', 'human_cultural'),
  ('conflict_studies', 'human_cultural'),
  ('shelter_housing', 'transitional'),
  ('water_sanitation', 'transitional'),
  ('energy_infrastructure', 'transitional'),
  ('transport_logistics', 'transitional');


-- ============================================
-- PART 2: EVIDENCE TYPE LAYER
-- ============================================

-- Evidence tiers (ranking hierarchy)
CREATE TYPE evidence_tier AS ENUM (
  'primary',      -- Highest ranking: field data, scans, eyewitness
  'secondary',    -- Academic papers, reports, government docs
  'derived',      -- BIM models, simulations, AI predictions
  'interpretive'  -- Policy briefs, commentary, analysis
);

-- Specific evidence types
CREATE TYPE evidence_type AS ENUM (
  -- Primary (highest gravity)
  'field_survey',
  'laser_scan',
  'photogrammetry',
  'satellite_imagery',
  'sensor_data',
  'eyewitness_testimony',
  'ground_photo',
  
  -- Secondary
  'academic_paper',
  'technical_report',
  'ngo_assessment',
  'government_document',
  'news_article',
  
  -- Derived/Synthetic
  'bim_model',
  'simulation',
  'ai_prediction',
  'scenario_analysis',
  'gis_layer',
  
  -- Interpretive (lowest ranking)
  'policy_brief',
  'expert_commentary',
  'editorial_analysis',
  
  -- External (from APIs)
  'external_dataset'
);

-- Evidence type to tier mapping
CREATE TABLE evidence_tier_mappings (
  evidence_type evidence_type PRIMARY KEY,
  tier evidence_tier NOT NULL,
  ranking_weight DECIMAL(3,2) DEFAULT 1.0 -- For search ranking
);

INSERT INTO evidence_tier_mappings (evidence_type, tier, ranking_weight) VALUES
  ('field_survey', 'primary', 1.0),
  ('laser_scan', 'primary', 1.0),
  ('photogrammetry', 'primary', 1.0),
  ('satellite_imagery', 'primary', 0.9),
  ('sensor_data', 'primary', 0.95),
  ('eyewitness_testimony', 'primary', 0.85),
  ('ground_photo', 'primary', 0.9),
  ('academic_paper', 'secondary', 0.75),
  ('technical_report', 'secondary', 0.7),
  ('ngo_assessment', 'secondary', 0.65),
  ('government_document', 'secondary', 0.7),
  ('news_article', 'secondary', 0.5),
  ('bim_model', 'derived', 0.6),
  ('simulation', 'derived', 0.55),
  ('ai_prediction', 'derived', 0.5),
  ('scenario_analysis', 'derived', 0.55),
  ('gis_layer', 'derived', 0.6),
  ('policy_brief', 'interpretive', 0.4),
  ('expert_commentary', 'interpretive', 0.35),
  ('editorial_analysis', 'interpretive', 0.3),
  ('external_dataset', 'secondary', 0.5); -- External never exceeds secondary


-- ============================================
-- PART 3: CONFLICT PHASES (Temporal Context)
-- ============================================

CREATE TYPE conflict_phase AS ENUM (
  'pre_conflict',           -- Before 2011
  'active_conflict',        -- 2011-2020
  'de_escalation',          -- Ceasefire/stability periods
  'early_reconstruction',   -- Initial return/recovery
  'active_reconstruction'   -- Ongoing rebuilding
);


-- ============================================
-- PART 4: TRUST VECTOR SYSTEM (5 Dimensions)
-- ============================================

CREATE TABLE trust_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'resource', 'external_data')),
  
  -- T1: Source Credibility (0-100)
  t1_source_score INT DEFAULT 50 CHECK (t1_source_score BETWEEN 0 AND 100),
  t1_author_known BOOLEAN DEFAULT false,
  t1_institution TEXT,
  t1_track_record JSONB DEFAULT '{}', -- {"posts_count": 0, "citation_count": 0, "accuracy_rate": 0}
  
  -- T2: Method Clarity (0-100)
  t2_method_score INT DEFAULT 50 CHECK (t2_method_score BETWEEN 0 AND 100),
  t2_method_described BOOLEAN DEFAULT false,
  t2_reproducible BOOLEAN DEFAULT false,
  t2_data_available BOOLEAN DEFAULT false,
  
  -- T3: Evidence Proximity (0-100)
  t3_proximity_score INT DEFAULT 50 CHECK (t3_proximity_score BETWEEN 0 AND 100),
  t3_proximity_type TEXT DEFAULT 'inferred' CHECK (t3_proximity_type IN ('on_site', 'remote', 'inferred')),
  t3_firsthand BOOLEAN DEFAULT false,
  
  -- T4: Temporal Relevance (0-100)
  t4_temporal_score INT DEFAULT 50 CHECK (t4_temporal_score BETWEEN 0 AND 100),
  t4_conflict_phase conflict_phase,
  t4_data_timestamp TIMESTAMPTZ,
  t4_is_time_sensitive BOOLEAN DEFAULT false,
  
  -- T5: Cross-Validation (0-100)
  t5_validation_score INT DEFAULT 50 CHECK (t5_validation_score BETWEEN 0 AND 100),
  t5_corroborating_count INT DEFAULT 0,
  t5_contradicting_count INT DEFAULT 0,
  t5_contradictions JSONB DEFAULT '[]', -- Array of {content_id, content_type, detail}
  
  -- Computed summary (for display)
  trust_summary TEXT, -- "Strong source, medium proximity, time-sensitive"
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(content_id, content_type)
);

CREATE INDEX idx_trust_profiles_content ON trust_profiles(content_id, content_type);
CREATE INDEX idx_trust_profiles_t1 ON trust_profiles(t1_source_score);
CREATE INDEX idx_trust_profiles_t3 ON trust_profiles(t3_proximity_score);


-- ============================================
-- PART 5: RELATIONSHIPS (Reasoning Graph)
-- ============================================

CREATE TYPE content_relationship AS ENUM (
  'contradicts',    -- Disagrees with findings
  'supports',       -- Provides corroborating evidence
  'derived_from',   -- Built upon / transformed from
  'same_site',      -- About same geographic location
  'same_dataset',   -- Uses same underlying data
  'updates',        -- More recent version of same work
  'supersedes'      -- Entirely replaces (deprecated)
);

CREATE TABLE content_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('post', 'resource', 'external_data')),
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'resource', 'external_data')),
  relationship content_relationship NOT NULL,
  relationship_detail TEXT, -- E.g., "Contradicts on: damage extent estimation"
  confidence DECIMAL(3,2) DEFAULT 1.0 CHECK (confidence BETWEEN 0 AND 1),
  detected_by TEXT DEFAULT 'manual' CHECK (detected_by IN ('manual', 'ai', 'system')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Prevent duplicate relationships
  UNIQUE(source_id, source_type, target_id, target_type, relationship)
);

CREATE INDEX idx_relationships_source ON content_relationships(source_id, source_type);
CREATE INDEX idx_relationships_target ON content_relationships(target_id, target_type);
CREATE INDEX idx_relationships_type ON content_relationships(relationship);


-- ============================================
-- PART 6: CONTENT DISCIPLINES (Many-to-Many)
-- ============================================

-- Posts can have multiple disciplines
CREATE TABLE content_disciplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'resource')),
  discipline discipline NOT NULL,
  is_primary BOOLEAN DEFAULT false, -- Primary discipline for this content
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(content_id, content_type, discipline)
);

CREATE INDEX idx_content_disciplines_content ON content_disciplines(content_id, content_type);
CREATE INDEX idx_content_disciplines_discipline ON content_disciplines(discipline);


-- ============================================
-- PART 7: CONTENT EVIDENCE TYPES
-- ============================================

-- Track evidence type for posts/resources
CREATE TABLE content_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'resource')),
  evidence_type evidence_type NOT NULL,
  evidence_tier evidence_tier NOT NULL,
  notes TEXT, -- Additional context
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(content_id, content_type)
);

CREATE INDEX idx_content_evidence_content ON content_evidence(content_id, content_type);
CREATE INDEX idx_content_evidence_tier ON content_evidence(evidence_tier);


-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-update trust_profiles updated_at
CREATE OR REPLACE FUNCTION update_trust_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_trust_profile_updated
  BEFORE UPDATE ON trust_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_trust_profile_timestamp();

-- Auto-generate trust summary
CREATE OR REPLACE FUNCTION generate_trust_summary()
RETURNS TRIGGER AS $$
DECLARE
  summary_parts TEXT[] := '{}';
BEGIN
  -- T1 Source
  IF NEW.t1_source_score >= 80 THEN
    summary_parts := array_append(summary_parts, 'Strong source');
  ELSIF NEW.t1_source_score >= 50 THEN
    summary_parts := array_append(summary_parts, 'Medium source');
  ELSE
    summary_parts := array_append(summary_parts, 'Weak source');
  END IF;
  
  -- T2 Method
  IF NEW.t2_method_score >= 80 THEN
    summary_parts := array_append(summary_parts, 'excellent method');
  ELSIF NEW.t2_method_score >= 50 THEN
    summary_parts := array_append(summary_parts, 'fair method');
  ELSE
    summary_parts := array_append(summary_parts, 'unclear method');
  END IF;
  
  -- T3 Proximity
  IF NEW.t3_proximity_type = 'on_site' THEN
    summary_parts := array_append(summary_parts, 'high proximity');
  ELSIF NEW.t3_proximity_type = 'remote' THEN
    summary_parts := array_append(summary_parts, 'medium proximity');
  ELSE
    summary_parts := array_append(summary_parts, 'inferred data');
  END IF;
  
  -- T4 Temporal
  IF NEW.t4_is_time_sensitive THEN
    summary_parts := array_append(summary_parts, 'time-sensitive');
  END IF;
  
  -- T5 Validation
  IF NEW.t5_contradicting_count > 0 THEN
    summary_parts := array_append(summary_parts, 
      'contradicted by ' || NEW.t5_contradicting_count || ' source(s)');
  ELSIF NEW.t5_corroborating_count >= 2 THEN
    summary_parts := array_append(summary_parts, 'well-corroborated');
  ELSIF NEW.t5_corroborating_count > 0 THEN
    summary_parts := array_append(summary_parts, 'partially corroborated');
  END IF;
  
  NEW.trust_summary := array_to_string(summary_parts, ', ');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_trust_summary
  BEFORE INSERT OR UPDATE ON trust_profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_trust_summary();


-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE discipline_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipline_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_tier_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_evidence ENABLE ROW LEVEL SECURITY;

-- Reference tables: public read
CREATE POLICY "Public read discipline_categories" ON discipline_categories FOR SELECT USING (true);
CREATE POLICY "Public read discipline_mappings" ON discipline_mappings FOR SELECT USING (true);
CREATE POLICY "Public read evidence_tier_mappings" ON evidence_tier_mappings FOR SELECT USING (true);

-- Trust profiles: public read, authenticated create/update own
CREATE POLICY "Public read trust_profiles" ON trust_profiles FOR SELECT USING (true);
CREATE POLICY "Authenticated create trust_profiles" ON trust_profiles 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins update trust_profiles" ON trust_profiles 
  FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Relationships: public read, authenticated create
CREATE POLICY "Public read relationships" ON content_relationships FOR SELECT USING (true);
CREATE POLICY "Authenticated create relationships" ON content_relationships 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins delete relationships" ON content_relationships 
  FOR DELETE TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Content disciplines/evidence: public read, authenticated create for own content
CREATE POLICY "Public read content_disciplines" ON content_disciplines FOR SELECT USING (true);
CREATE POLICY "Public read content_evidence" ON content_evidence FOR SELECT USING (true);


-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
