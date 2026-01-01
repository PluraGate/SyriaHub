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
  ('osm', 'OpenStreetMap', 'خريطة الشارع المفتوحة', 'https://overpass-api.de/api', 'Base geometry, roads, POIs', 50, 'secondary', 30),
  ('nominatim', 'Nominatim', 'نوميناتيم', 'https://nominatim.openstreetmap.org', 'Geocoding service', 50, 'derived', 90),
  ('sentinel', 'Copernicus Sentinel', 'كوبرنيكوس', 'https://scihub.copernicus.eu', 'Satellite imagery, change detection', 60, 'primary', 7),
  ('hdx', 'Humanitarian Data Exchange', 'تبادل البيانات الإنسانية', 'https://data.humdata.org/api', 'Humanitarian datasets (variable quality)', 40, 'secondary', 14),
  ('worldbank', 'World Bank', 'البنك الدولي', 'https://api.worldbank.org/v2', 'Macro statistics, economics', 60, 'secondary', 90),
  ('nasa_earthdata', 'NASA Earthdata', 'بيانات ناسا الأرضية', 'https://cmr.earthdata.nasa.gov', 'Climate, temperature, aerosols', 60, 'secondary', 30);


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
