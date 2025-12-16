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
  ('built_environment', 'Built Environment', 'Ø§Ù„Ø¨ÙŠØ¦Ø© Ø§Ù„Ù…Ø¨Ù†ÙŠØ©', 'Architecture, engineering, planning, heritage', 1),
  ('earth_spatial', 'Earth & Spatial', 'Ø§Ù„Ø£Ø±Ø¶ ÙˆØ§Ù„Ù…ÙƒØ§Ù†', 'GIS, remote sensing, environment, hydrology', 2),
  ('data_tech', 'Data & Tech', 'Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØ§Ù„ØªÙ‚Ù†ÙŠØ©', 'Digital twins, BIM, AI/ML, IoT', 3),
  ('socio_political', 'Socio-Political', 'Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ÙŠ ÙˆØ§Ù„Ø³ÙŠØ§Ø³ÙŠ', 'Governance, HLP, legal, economics', 4),
  ('human_cultural', 'Human & Cultural', 'Ø§Ù„Ø¥Ù†Ø³Ø§Ù†ÙŠ ÙˆØ§Ù„Ø«Ù‚Ø§ÙÙŠ', 'Sociology, anthropology, oral history', 5),
  ('transitional', 'Transitional Infrastructure', 'Ø§Ù„Ø¨Ù†ÙŠØ© Ø§Ù„ØªØ­ØªÙŠØ© Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ÙŠØ©', 'Shelter, WASH, energy, transport bridge solutions', 6);

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
-- External Data Integration for SyriaHub
-- Migration: 20251217000002_external_data.sql
-- Purpose: Cache layer for OSM, Copernicus, HDX, World Bank APIs

-- ============================================
-- PREREQUISITES: Enable PostGIS
-- ============================================

-- Ensure PostGIS extension exists
CREATE EXTENSION IF NOT EXISTS postgis;


-- ============================================
-- EXTERNAL DATA SOURCES REGISTRY
-- ============================================

CREATE TABLE external_data_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  base_url TEXT NOT NULL,
  description TEXT,
  
  -- Trust constraints
  max_trust_t3 INT DEFAULT 50, -- External sources max out at medium proximity
  default_evidence_tier TEXT DEFAULT 'secondary',
  
  -- Cache policy
  default_cache_days INT DEFAULT 30,
  rate_limit_per_minute INT DEFAULT 60,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_health_check TIMESTAMPTZ,
  health_status TEXT DEFAULT 'unknown',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO external_data_sources (id, name, name_ar, base_url, description, max_trust_t3, default_evidence_tier, default_cache_days) VALUES
  ('osm', 'OpenStreetMap', 'Ø®Ø±ÙŠØ·Ø© Ø§Ù„Ø´Ø§Ø±Ø¹ Ø§Ù„Ù…ÙØªÙˆØ­Ø©', 'https://overpass-api.de/api', 'Base geometry, roads, POIs', 50, 'secondary', 30),
  ('nominatim', 'Nominatim', 'Ù†ÙˆÙ…ÙŠÙ†Ø§ØªÙŠÙ…', 'https://nominatim.openstreetmap.org', 'Geocoding service', 50, 'derived', 90),
  ('sentinel', 'Copernicus Sentinel', 'ÙƒÙˆØ¨Ø±Ù†ÙŠÙƒÙˆØ³', 'https://scihub.copernicus.eu', 'Satellite imagery, change detection', 60, 'primary', 7),
  ('hdx', 'Humanitarian Data Exchange', 'ØªØ¨Ø§Ø¯Ù„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¥Ù†Ø³Ø§Ù†ÙŠØ©', 'https://data.humdata.org/api', 'Humanitarian datasets (variable quality)', 40, 'secondary', 14),
  ('worldbank', 'World Bank', 'Ø§Ù„Ø¨Ù†Ùƒ Ø§Ù„Ø¯ÙˆÙ„ÙŠ', 'https://api.worldbank.org/v2', 'Macro statistics, economics', 60, 'secondary', 90),
  ('nasa_earthdata', 'NASA Earthdata', 'Ø¨ÙŠØ§Ù†Ø§Øª Ù†Ø§Ø³Ø§ Ø§Ù„Ø£Ø±Ø¶ÙŠØ©', 'https://cmr.earthdata.nasa.gov', 'Climate, temperature, aerosols', 60, 'secondary', 30);


-- ============================================
-- EXTERNAL DATA CACHE
-- ============================================

CREATE TABLE external_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT REFERENCES external_data_sources(id) NOT NULL,
  query_hash TEXT NOT NULL, -- MD5 of query params for deduplication
  query_params JSONB NOT NULL, -- Original query for debugging
  
  -- Response data
  response_data JSONB NOT NULL,
  geometry GEOMETRY, -- PostGIS geometry for spatial data
  
  -- Metadata (stamped on fetch)
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ NOT NULL,
  api_response_time_ms INT,
  
  -- Spatial/temporal scope
  spatial_resolution TEXT, -- e.g., "1m", "10m", "country-level"
  temporal_scope_start DATE,
  temporal_scope_end DATE,
  
  -- Known limitations (documented at fetch time)
  known_limitations TEXT[] DEFAULT '{}',
  
  -- Evidence constraints
  evidence_type evidence_type DEFAULT 'external_dataset',
  max_trust_score INT DEFAULT 50, -- Never exceeds this
  
  -- Version tracking ("which version of reality?")
  version_number INT DEFAULT 1,
  previous_version_id UUID REFERENCES external_data_cache(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(source_id, query_hash, version_number)
);

-- Spatial index for geo queries
CREATE INDEX idx_external_cache_geometry ON external_data_cache USING GIST (geometry);
CREATE INDEX idx_external_cache_source ON external_data_cache(source_id);
CREATE INDEX idx_external_cache_valid ON external_data_cache(valid_until);
CREATE INDEX idx_external_cache_hash ON external_data_cache(query_hash);


-- ============================================
-- EXTERNAL DATA FETCH LOG (Audit Trail)
-- ============================================

CREATE TABLE external_data_fetch_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT REFERENCES external_data_sources(id) NOT NULL,
  query_params JSONB NOT NULL,
  
  -- Result
  success BOOLEAN NOT NULL,
  response_status INT,
  error_message TEXT,
  response_time_ms INT,
  cache_id UUID REFERENCES external_data_cache(id),
  
  -- Who/when
  requested_by UUID REFERENCES users(id),
  requested_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fetch_log_source ON external_data_fetch_log(source_id);
CREATE INDEX idx_fetch_log_time ON external_data_fetch_log(requested_at);


-- ============================================
-- DATA CONFLICTS (Field vs External)
-- ============================================

CREATE TYPE conflict_type AS ENUM (
  'existence',   -- One says exists, other says doesn't
  'state',       -- Disagreement on condition (intact vs destroyed)
  'attribute',   -- Different values for same attribute
  'temporal'     -- Conflicting timestamps or phases
);

CREATE TYPE conflict_resolution AS ENUM (
  'field_wins',      -- Primary field evidence takes precedence
  'external_wins',   -- Rare: external source more recent/reliable
  'needs_review',    -- Manual review required
  'merged',          -- Combined information from both
  'unresolved'       -- Still pending
);

CREATE TABLE data_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- External data side
  external_source_id TEXT REFERENCES external_data_sources(id) NOT NULL,
  external_cache_id UUID REFERENCES external_data_cache(id),
  external_claim TEXT NOT NULL, -- "Building exists, type=school"
  external_timestamp TIMESTAMPTZ,
  
  -- Field data side
  field_content_id UUID NOT NULL,
  field_content_type TEXT NOT NULL CHECK (field_content_type IN ('post', 'resource')),
  field_claim TEXT NOT NULL, -- "Structure destroyed in 2016"
  field_timestamp TIMESTAMPTZ,
  
  -- Conflict metadata
  conflict_type conflict_type NOT NULL,
  conflict_detail TEXT, -- Specific attribute or aspect in conflict
  
  -- Resolution
  resolution conflict_resolution DEFAULT 'unresolved',
  resolution_notes TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  
  -- Suggested action
  suggested_action TEXT, -- "flag_osm_update", "verify_field", "manual_review"
  action_taken BOOLEAN DEFAULT false,
  
  -- Location (if spatial conflict)
  geometry GEOMETRY,
  location_name TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conflicts_source ON data_conflicts(external_source_id);
CREATE INDEX idx_conflicts_field ON data_conflicts(field_content_id, field_content_type);
CREATE INDEX idx_conflicts_resolution ON data_conflicts(resolution);
CREATE INDEX idx_conflicts_geometry ON data_conflicts USING GIST (geometry);


-- ============================================
-- LINKED RESOURCES (Cross-Domain Connections)
-- ============================================

-- Resource types for cross-domain linking
CREATE TYPE linked_resource_type AS ENUM (
  'gis_layer',
  'damage_survey',
  'bim_model',
  'satellite_imagery',
  'ground_photo',
  'oral_history',
  'policy_document',
  'dataset',
  'academic_paper',
  'news_article',
  'video',
  'audio',
  'other'
);

CREATE TABLE linked_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Source (what is linking)
  source_id UUID NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('post', 'resource')),
  
  -- Target (what is linked to)
  target_url TEXT, -- External URL
  target_id UUID, -- Internal resource/post if applicable
  target_type TEXT CHECK (target_type IN ('post', 'resource', 'external')),
  
  -- Resource classification
  resource_type linked_resource_type NOT NULL,
  title TEXT,
  description TEXT,
  
  -- Temporal metadata
  event_date DATE,
  conflict_phase conflict_phase,
  date_precision TEXT DEFAULT 'day' CHECK (date_precision IN ('day', 'month', 'year', 'approximate')),
  
  -- Geo metadata
  geometry GEOMETRY,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_name TEXT,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verification_notes TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  
  -- External source tracking
  external_source_id TEXT REFERENCES external_data_sources(id),
  external_cache_id UUID REFERENCES external_data_cache(id),
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_linked_resources_source ON linked_resources(source_id, source_type);
CREATE INDEX idx_linked_resources_type ON linked_resources(resource_type);
CREATE INDEX idx_linked_resources_geometry ON linked_resources USING GIST (geometry);
CREATE INDEX idx_linked_resources_phase ON linked_resources(conflict_phase);


-- ============================================
-- FUNCTIONS: Cache Management
-- ============================================

-- Check if cache is still valid
CREATE OR REPLACE FUNCTION is_cache_valid(cache_row external_data_cache)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN cache_row.valid_until > NOW();
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get latest cached data for a query
CREATE OR REPLACE FUNCTION get_cached_external_data(
  p_source_id TEXT,
  p_query_hash TEXT
)
RETURNS external_data_cache AS $$
DECLARE
  cache_row external_data_cache;
BEGIN
  SELECT * INTO cache_row
  FROM external_data_cache
  WHERE source_id = p_source_id
    AND query_hash = p_query_hash
    AND valid_until > NOW()
  ORDER BY version_number DESC
  LIMIT 1;
  
  RETURN cache_row;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update conflicts updated_at
CREATE OR REPLACE FUNCTION update_conflict_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.resolution != OLD.resolution AND NEW.resolution IN ('field_wins', 'external_wins', 'merged') THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_conflict_updated
  BEFORE UPDATE ON data_conflicts
  FOR EACH ROW
  EXECUTE FUNCTION update_conflict_timestamp();


-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE external_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_data_fetch_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE linked_resources ENABLE ROW LEVEL SECURITY;

-- External data sources: public read
CREATE POLICY "Public read external_sources" ON external_data_sources 
  FOR SELECT USING (true);

-- Cache: public read
CREATE POLICY "Public read cache" ON external_data_cache 
  FOR SELECT USING (true);

-- Fetch log: admin only
CREATE POLICY "Admin read fetch_log" ON external_data_fetch_log 
  FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Conflicts: public read, authenticated resolve
CREATE POLICY "Public read conflicts" ON data_conflicts 
  FOR SELECT USING (true);
CREATE POLICY "Authenticated create conflicts" ON data_conflicts 
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Moderators resolve conflicts" ON data_conflicts 
  FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Linked resources: public read, authenticated create
CREATE POLICY "Public read linked_resources" ON linked_resources 
  FOR SELECT USING (true);
CREATE POLICY "Authenticated create linked_resources" ON linked_resources 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Owner or admin delete linked_resources" ON linked_resources 
  FOR DELETE TO authenticated 
  USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
-- Jury Review System for Decentralized Appeals
-- Migration: 20251217000003_jury_system.sql
-- Purpose: Prevent single-admin decision making on appeals

-- ============================================
-- MODIFY EXISTING APPEALS TABLE
-- ============================================

-- Add jury-related status to moderation_appeals
ALTER TABLE moderation_appeals 
  DROP CONSTRAINT IF EXISTS moderation_appeals_status_check;
  
ALTER TABLE moderation_appeals 
  ADD CONSTRAINT moderation_appeals_status_check 
  CHECK (status IN ('pending', 'under_jury_review', 'approved', 'rejected', 'revision_requested'));


-- ============================================
-- JURY DELIBERATIONS
-- ============================================

CREATE TABLE jury_deliberations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appeal_id UUID REFERENCES moderation_appeals(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Configuration
  required_votes INT DEFAULT 3 CHECK (required_votes >= 3),
  majority_threshold DECIMAL(3,2) DEFAULT 0.67, -- 2/3 majority
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'concluded', 'timed_out', 'cancelled')),
  
  -- Vote counts (updated by trigger)
  votes_uphold INT DEFAULT 0,
  votes_overturn INT DEFAULT 0,
  votes_abstain INT DEFAULT 0,
  total_votes INT DEFAULT 0,
  
  -- Decision
  final_decision TEXT CHECK (final_decision IN ('uphold', 'overturn', 'split', 'inconclusive')),
  decision_reasoning TEXT,
  
  -- Timing
  deadline TIMESTAMPTZ DEFAULT (now() + interval '72 hours'),
  created_at TIMESTAMPTZ DEFAULT now(),
  concluded_at TIMESTAMPTZ
);

CREATE INDEX idx_jury_deliberations_appeal ON jury_deliberations(appeal_id);
CREATE INDEX idx_jury_deliberations_status ON jury_deliberations(status);
CREATE INDEX idx_jury_deliberations_deadline ON jury_deliberations(deadline);


-- ============================================
-- JURY ASSIGNMENTS
-- ============================================

CREATE TABLE jury_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliberation_id UUID REFERENCES jury_deliberations(id) ON DELETE CASCADE NOT NULL,
  juror_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Status
  assigned_at TIMESTAMPTZ DEFAULT now(),
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,
  responded BOOLEAN DEFAULT false,
  responded_at TIMESTAMPTZ,
  
  -- Decline option
  declined BOOLEAN DEFAULT false,
  decline_reason TEXT,
  
  UNIQUE(deliberation_id, juror_id)
);

CREATE INDEX idx_jury_assignments_deliberation ON jury_assignments(deliberation_id);
CREATE INDEX idx_jury_assignments_juror ON jury_assignments(juror_id);
CREATE INDEX idx_jury_assignments_pending ON jury_assignments(responded) WHERE responded = false;


-- ============================================
-- JURY VOTES
-- ============================================

CREATE TABLE jury_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliberation_id UUID REFERENCES jury_deliberations(id) ON DELETE CASCADE NOT NULL,
  juror_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Vote
  vote TEXT NOT NULL CHECK (vote IN ('uphold', 'overturn', 'abstain')),
  reasoning TEXT NOT NULL, -- Required explanation
  
  -- Metadata
  is_anonymous BOOLEAN DEFAULT true, -- Hide identity until concluded
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(deliberation_id, juror_id)
);

CREATE INDEX idx_jury_votes_deliberation ON jury_votes(deliberation_id);
CREATE INDEX idx_jury_votes_juror ON jury_votes(juror_id);


-- ============================================
-- FUNCTIONS: Jury Selection
-- ============================================

-- Get eligible jurors for an appeal
CREATE OR REPLACE FUNCTION get_eligible_jurors(
  p_appeal_id UUID,
  p_exclude_user_id UUID DEFAULT NULL -- The post author
)
RETURNS TABLE(user_id UUID, name TEXT, role TEXT, reputation INT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.role,
    COALESCE(u.reputation, 0)::INT
  FROM users u
  WHERE u.role IN ('admin', 'moderator', 'researcher')
    AND u.id != COALESCE(p_exclude_user_id, '00000000-0000-0000-0000-000000000000'::UUID)
    -- Exclude the moderator who flagged the content
    AND u.id NOT IN (
      SELECT p.approved_by FROM posts p
      JOIN moderation_appeals ma ON ma.post_id = p.id
      WHERE ma.id = p_appeal_id
      AND p.approved_by IS NOT NULL
    )
    -- Exclude anyone who already voted on this appeal's deliberation
    AND u.id NOT IN (
      SELECT jv.juror_id FROM jury_votes jv
      JOIN jury_deliberations jd ON jd.id = jv.deliberation_id
      WHERE jd.appeal_id = p_appeal_id
    )
  ORDER BY 
    CASE u.role 
      WHEN 'admin' THEN 1 
      WHEN 'moderator' THEN 2 
      ELSE 3 
    END,
    COALESCE(u.reputation, 0) DESC
  LIMIT 10; -- Return top 10 candidates to pick from
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- FUNCTIONS: Vote Counting & Decision
-- ============================================

-- Update vote counts when a vote is cast
CREATE OR REPLACE FUNCTION update_jury_vote_counts()
RETURNS TRIGGER AS $$
DECLARE
  v_deliberation jury_deliberations;
  v_uphold INT;
  v_overturn INT;
  v_abstain INT;
  v_total INT;
  v_required INT;
  v_threshold DECIMAL;
  v_decision TEXT;
BEGIN
  -- Count votes
  SELECT 
    COUNT(*) FILTER (WHERE vote = 'uphold'),
    COUNT(*) FILTER (WHERE vote = 'overturn'),
    COUNT(*) FILTER (WHERE vote = 'abstain'),
    COUNT(*)
  INTO v_uphold, v_overturn, v_abstain, v_total
  FROM jury_votes
  WHERE deliberation_id = NEW.deliberation_id;
  
  -- Get deliberation config
  SELECT * INTO v_deliberation
  FROM jury_deliberations
  WHERE id = NEW.deliberation_id;
  
  v_required := v_deliberation.required_votes;
  v_threshold := v_deliberation.majority_threshold;
  
  -- Update counts
  UPDATE jury_deliberations
  SET 
    votes_uphold = v_uphold,
    votes_overturn = v_overturn,
    votes_abstain = v_abstain,
    total_votes = v_total
  WHERE id = NEW.deliberation_id;
  
  -- Mark assignment as responded
  UPDATE jury_assignments
  SET responded = true, responded_at = NOW()
  WHERE deliberation_id = NEW.deliberation_id AND juror_id = NEW.juror_id;
  
  -- Check if we can conclude
  IF v_total >= v_required THEN
    -- Determine decision
    IF v_uphold::DECIMAL / v_total >= v_threshold THEN
      v_decision := 'uphold';
    ELSIF v_overturn::DECIMAL / v_total >= v_threshold THEN
      v_decision := 'overturn';
    ELSE
      v_decision := 'split';
    END IF;
    
    -- Conclude the deliberation
    UPDATE jury_deliberations
    SET 
      status = 'concluded',
      final_decision = v_decision,
      concluded_at = NOW()
    WHERE id = NEW.deliberation_id;
    
    -- Update the appeal based on decision
    IF v_decision = 'overturn' THEN
      UPDATE moderation_appeals
      SET status = 'approved'
      WHERE id = v_deliberation.appeal_id;
      
      -- Restore the post
      UPDATE posts
      SET approval_status = 'pending'
      WHERE id = (SELECT post_id FROM moderation_appeals WHERE id = v_deliberation.appeal_id);
    ELSE
      UPDATE moderation_appeals
      SET status = 'rejected'
      WHERE id = v_deliberation.appeal_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_jury_vote_cast
  AFTER INSERT ON jury_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_jury_vote_counts();


-- Check for timed-out deliberations (to be called by cron)
CREATE OR REPLACE FUNCTION check_jury_timeouts()
RETURNS INT AS $$
DECLARE
  v_count INT := 0;
BEGIN
  UPDATE jury_deliberations
  SET 
    status = 'timed_out',
    concluded_at = NOW(),
    final_decision = 'inconclusive'
  WHERE status = 'active'
    AND deadline < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE jury_deliberations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jury_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jury_votes ENABLE ROW LEVEL SECURITY;

-- Deliberations: Public read (concluded), assigned jurors read (active)
CREATE POLICY "Public read concluded deliberations" ON jury_deliberations
  FOR SELECT USING (status = 'concluded');
  
CREATE POLICY "Assigned jurors read active deliberations" ON jury_deliberations
  FOR SELECT TO authenticated
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM jury_assignments ja
      WHERE ja.deliberation_id = jury_deliberations.id
      AND ja.juror_id = auth.uid()
    )
  );

CREATE POLICY "Admins read all deliberations" ON jury_deliberations
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins create deliberations" ON jury_deliberations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Assignments: Jurors see their own, admins see all
CREATE POLICY "Jurors see own assignments" ON jury_assignments
  FOR SELECT TO authenticated
  USING (juror_id = auth.uid());

CREATE POLICY "Admins see all assignments" ON jury_assignments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins create assignments" ON jury_assignments
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Votes: Anonymous until concluded, then public
CREATE POLICY "Public read concluded votes" ON jury_votes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jury_deliberations jd
      WHERE jd.id = jury_votes.deliberation_id
      AND jd.status = 'concluded'
    )
  );

CREATE POLICY "Jurors vote on assigned deliberations" ON jury_votes
  FOR INSERT TO authenticated
  WITH CHECK (
    juror_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM jury_assignments ja
      WHERE ja.deliberation_id = jury_votes.deliberation_id
      AND ja.juror_id = auth.uid()
      AND ja.declined = false
    )
  );


-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
-- Peer Review Workflow
-- Migration: 20251217000004_peer_review.sql
-- Purpose: Structured expert review for content validation

-- ============================================
-- ADD REVIEW STATUS TO POSTS
-- ============================================

ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS review_status TEXT 
  DEFAULT 'not_requested' 
  CHECK (review_status IN (
    'not_requested',      -- Author hasn't requested review
    'pending_reviewers',  -- Waiting for reviewers to accept
    'under_review',       -- Active review in progress
    'peer_reviewed',      -- Successfully peer reviewed
    'needs_revision'      -- Reviewer requested changes
  ));

CREATE INDEX idx_posts_review_status ON posts(review_status);


-- ============================================
-- PEER REVIEW REQUESTS
-- ============================================

CREATE TABLE review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  
  -- Requester
  requested_by UUID REFERENCES users(id) NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT now(),
  
  -- Configuration
  min_reviewers INT DEFAULT 2,
  max_reviewers INT DEFAULT 5,
  review_type TEXT DEFAULT 'open' CHECK (review_type IN ('open', 'blind', 'double_blind')),
  
  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  
  -- Result (after reviews)
  consensus_recommendation TEXT,
  
  -- Notes
  request_notes TEXT
);

CREATE INDEX idx_review_requests_post ON review_requests(post_id);
CREATE INDEX idx_review_requests_status ON review_requests(status);


-- ============================================
-- PEER REVIEWS
-- ============================================

CREATE TABLE peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES review_requests(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Invited, not yet responded
    'accepted',     -- Reviewer accepted
    'in_progress',  -- Actively reviewing
    'completed',    -- Review submitted
    'declined'      -- Reviewer declined
  )),
  
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Review Criteria Scores (1-5)
  accuracy_score INT CHECK (accuracy_score BETWEEN 1 AND 5),
  methodology_score INT CHECK (methodology_score BETWEEN 1 AND 5),
  clarity_score INT CHECK (clarity_score BETWEEN 1 AND 5),
  relevance_score INT CHECK (relevance_score BETWEEN 1 AND 5),
  citations_score INT CHECK (citations_score BETWEEN 1 AND 5),
  
  -- Composite score (computed)
  overall_score DECIMAL(3,2),
  
  -- Recommendation
  recommendation TEXT CHECK (recommendation IN (
    'accept',           -- Publish as-is
    'minor_revision',   -- Small changes needed
    'major_revision',   -- Significant changes needed
    'reject'            -- Not suitable for publication
  )),
  
  -- Comments
  public_comments TEXT,   -- Visible to author and public after publish
  private_comments TEXT,  -- Only visible to author
  editor_comments TEXT,   -- Only visible to moderators/admins
  
  -- Confidence
  reviewer_confidence TEXT CHECK (reviewer_confidence IN ('low', 'medium', 'high')),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_peer_reviews_request ON peer_reviews(request_id);
CREATE INDEX idx_peer_reviews_post ON peer_reviews(post_id);
CREATE INDEX idx_peer_reviews_reviewer ON peer_reviews(reviewer_id);
CREATE INDEX idx_peer_reviews_status ON peer_reviews(status);


-- ============================================
-- EXPERT VERIFICATION
-- ============================================

CREATE TABLE expert_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- What they're verified for
  discipline discipline NOT NULL,
  expertise_level TEXT DEFAULT 'intermediate' CHECK (expertise_level IN ('beginner', 'intermediate', 'expert', 'authority')),
  
  -- Credentials
  credential_type TEXT NOT NULL CHECK (credential_type IN (
    'academic_degree',
    'professional_certification',
    'work_experience',
    'publication_record',
    'institutional_affiliation'
  )),
  credential_details TEXT NOT NULL,
  credential_year INT,
  institution TEXT,
  
  -- Proof
  document_url TEXT, -- Supabase storage URL
  document_verified BOOLEAN DEFAULT false,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  
  -- Review
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Validity
  valid_until TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_expert_verifications_user ON expert_verifications(user_id);
CREATE INDEX idx_expert_verifications_discipline ON expert_verifications(discipline);
CREATE INDEX idx_expert_verifications_status ON expert_verifications(status);

-- Add verified domains to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_disciplines discipline[] DEFAULT '{}';


-- ============================================
-- FUNCTIONS: Expert Matching
-- ============================================

-- Find reviewers matching post disciplines
CREATE OR REPLACE FUNCTION find_matching_reviewers(
  p_post_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE(
  user_id UUID,
  name TEXT,
  match_score INT,
  verified_disciplines discipline[]
) AS $$
BEGIN
  RETURN QUERY
  WITH post_disciplines AS (
    SELECT discipline FROM content_disciplines
    WHERE content_id = p_post_id AND content_type = 'post'
  ),
  post_author AS (
    SELECT author_id FROM posts WHERE id = p_post_id
  )
  SELECT 
    u.id,
    u.name,
    (
      -- Score based on matching verified disciplines
      COALESCE(array_length(
        ARRAY(
          SELECT unnest(u.verified_disciplines) 
          INTERSECT 
          SELECT discipline FROM post_disciplines
        ), 1
      ), 0) * 10 +
      -- Bonus for being a researcher/moderator
      CASE u.role WHEN 'researcher' THEN 5 WHEN 'moderator' THEN 7 WHEN 'admin' THEN 8 ELSE 0 END +
      -- Bonus for reputation
      LEAST(COALESCE(u.reputation, 0) / 100, 10)
    )::INT as match_score,
    u.verified_disciplines
  FROM users u
  WHERE u.id != (SELECT author_id FROM post_author)
    AND u.role IN ('researcher', 'moderator', 'admin')
    AND (
      -- At least one verified discipline matches
      u.verified_disciplines && ARRAY(SELECT discipline FROM post_disciplines)
      OR
      -- Or has posts in same disciplines
      EXISTS (
        SELECT 1 FROM content_disciplines cd
        JOIN posts p ON p.id = cd.content_id AND cd.content_type = 'post'
        WHERE p.author_id = u.id
        AND cd.discipline IN (SELECT discipline FROM post_disciplines)
      )
    )
  ORDER BY match_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


-- Calculate overall review score
CREATE OR REPLACE FUNCTION calculate_review_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.accuracy_score IS NOT NULL AND 
     NEW.methodology_score IS NOT NULL AND
     NEW.clarity_score IS NOT NULL AND
     NEW.relevance_score IS NOT NULL AND
     NEW.citations_score IS NOT NULL THEN
    NEW.overall_score := (
      NEW.accuracy_score + 
      NEW.methodology_score + 
      NEW.clarity_score + 
      NEW.relevance_score + 
      NEW.citations_score
    )::DECIMAL / 5;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_review_score
  BEFORE INSERT OR UPDATE ON peer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION calculate_review_score();


-- Update post review status based on reviews
CREATE OR REPLACE FUNCTION update_post_review_status()
RETURNS TRIGGER AS $$
DECLARE
  v_completed_count INT;
  v_min_reviewers INT;
  v_avg_recommendation TEXT;
BEGIN
  -- Only act on completed reviews
  IF NEW.status != 'completed' THEN
    RETURN NEW;
  END IF;
  
  -- Count completed reviews for this request
  SELECT COUNT(*) INTO v_completed_count
  FROM peer_reviews
  WHERE request_id = NEW.request_id AND status = 'completed';
  
  -- Get min reviewers required
  SELECT min_reviewers INTO v_min_reviewers
  FROM review_requests
  WHERE id = NEW.request_id;
  
  -- If we have enough reviews, determine consensus
  IF v_completed_count >= v_min_reviewers THEN
    -- Get most common recommendation
    SELECT recommendation INTO v_avg_recommendation
    FROM peer_reviews
    WHERE request_id = NEW.request_id AND status = 'completed'
    GROUP BY recommendation
    ORDER BY COUNT(*) DESC
    LIMIT 1;
    
    -- Update review request
    UPDATE review_requests
    SET 
      status = 'completed',
      completed_at = NOW(),
      consensus_recommendation = v_avg_recommendation
    WHERE id = NEW.request_id;
    
    -- Update post status
    UPDATE posts
    SET review_status = CASE 
      WHEN v_avg_recommendation = 'accept' THEN 'peer_reviewed'
      WHEN v_avg_recommendation IN ('minor_revision', 'major_revision') THEN 'needs_revision'
      ELSE 'not_requested'
    END
    WHERE id = NEW.post_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_review_status
  AFTER UPDATE ON peer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_post_review_status();


-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_verifications ENABLE ROW LEVEL SECURITY;

-- Review requests: author and admins
CREATE POLICY "Authors see own review requests" ON review_requests
  FOR SELECT TO authenticated
  USING (requested_by = auth.uid());

CREATE POLICY "Admins see all review requests" ON review_requests
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "Authors create review requests" ON review_requests
  FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid());

-- Peer reviews: reviewers see their own, public after post published
CREATE POLICY "Reviewers see own reviews" ON peer_reviews
  FOR SELECT TO authenticated
  USING (reviewer_id = auth.uid());

CREATE POLICY "Public see completed reviews on published posts" ON peer_reviews
  FOR SELECT
  USING (
    status = 'completed' AND
    EXISTS (
      SELECT 1 FROM posts p
      WHERE p.id = peer_reviews.post_id
      AND p.status = 'published'
    )
  );

CREATE POLICY "Reviewers submit reviews" ON peer_reviews
  FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid())
  WITH CHECK (reviewer_id = auth.uid());

-- Expert verifications: user sees own, admins see all
CREATE POLICY "Users see own verifications" ON expert_verifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins see all verifications" ON expert_verifications
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users create verification requests" ON expert_verifications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins update verifications" ON expert_verifications
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));


-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
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
