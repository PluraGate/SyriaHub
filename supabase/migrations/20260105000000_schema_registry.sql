-- ============================================
-- ADMIN-MANAGED SCHEMA REGISTRY SYSTEM
-- Migration: 20260105000000_schema_registry.sql
--
-- Enables admins to evolve SyriaHub's data model without code changes.
-- This is the "Tightened MVP" - Posts-only, history-capable, locked RLS.
-- ============================================

-- ============================================
-- 1. CONTENT TYPE ENUM (for strict references)
-- ============================================
DO $$ BEGIN
  CREATE TYPE content_type_enum AS ENUM (
    'article', 'question', 'answer', 'resource', 'event', 'trace'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 2. FIELD TYPE ENUM
-- ============================================
DO $$ BEGIN
  CREATE TYPE schema_field_type AS ENUM (
    'text', 'number', 'boolean', 'date', 'datetime',
    'select', 'multiselect', 'registry_ref', 'registry_ref_multi',
    'geo_point', 'geo_polygon', 'url', 'file',
    'json', 'rich_text'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 3. SCHEMA REGISTRIES (groupings of values)
-- ============================================
CREATE TABLE IF NOT EXISTS schema_registries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registry_key TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  display_name_ar TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE schema_registries IS 'Admin-managed registries for dynamic values (e.g., Research Domains, Methodologies)';

-- ============================================
-- 4. SCHEMA ITEMS (values within registries)
-- ============================================
CREATE TABLE IF NOT EXISTS schema_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registry_id UUID NOT NULL REFERENCES schema_registries(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  display_name_ar TEXT,
  description TEXT,
  parent_id UUID REFERENCES schema_items(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  is_deprecated BOOLEAN DEFAULT false,
  deprecated_in_favor_of UUID REFERENCES schema_items(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(registry_id, item_key)
);

COMMENT ON TABLE schema_items IS 'Values within a registry (e.g., "archaeology" in Research Domains)';

-- ============================================
-- 5. SCHEMA FIELDS (stable identity)
-- ============================================
CREATE TABLE IF NOT EXISTS schema_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  field_key TEXT UNIQUE NOT NULL,
  current_version_id UUID,  -- Points to schema_field_versions (FK added later)
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE schema_fields IS 'Stable identity for dynamic metadata fields';

-- ============================================
-- 6. SCHEMA FIELD VERSIONS (immutable snapshots)
-- ============================================
CREATE TABLE IF NOT EXISTS schema_field_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  field_id UUID NOT NULL REFERENCES schema_fields(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  display_name_ar TEXT,
  description TEXT,
  field_type schema_field_type NOT NULL,
  registry_id UUID REFERENCES schema_registries(id) ON DELETE SET NULL,
  constraints JSONB DEFAULT '{}',
  default_value JSONB,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'author_only', 'admin_only')),
  -- Constrained to known content types
  applies_to content_type_enum[] NOT NULL DEFAULT ARRAY['article']::content_type_enum[],
  is_required BOOLEAN DEFAULT false,
  is_searchable BOOLEAN DEFAULT true,
  is_filterable BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(field_id, version)
);

COMMENT ON TABLE schema_field_versions IS 'Immutable versioned snapshots of field definitions';

-- Add FK from schema_fields to current version
ALTER TABLE schema_fields 
  ADD CONSTRAINT fk_schema_fields_current_version 
  FOREIGN KEY (current_version_id) 
  REFERENCES schema_field_versions(id) ON DELETE SET NULL;

-- ============================================
-- 7. SCHEMA POST FIELD VALUES (posts-only, history-capable)
-- ============================================
CREATE TABLE IF NOT EXISTS schema_post_field_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES schema_fields(id) ON DELETE CASCADE,
  field_version_id UUID NOT NULL REFERENCES schema_field_versions(id),
  value JSONB NOT NULL,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- History-capable: allows multiple versions per post+field
  UNIQUE(post_id, field_id, field_version_id)
);

COMMENT ON TABLE schema_post_field_values IS 'Stores dynamic field values for posts, linked to specific field versions';

-- Index for fetching current values efficiently
CREATE INDEX IF NOT EXISTS idx_schema_post_field_values_current 
  ON schema_post_field_values(post_id, field_id) 
  WHERE is_current = true;

-- ============================================
-- 8. SCHEMA AUDIT LOG (immutable, trigger-populated)
-- ============================================
CREATE TABLE IF NOT EXISTS schema_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'deprecate')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  change_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE schema_audit_log IS 'Immutable audit log for all schema changes';

-- ============================================
-- 9. RLS POLICIES (locked down)
-- ============================================

-- Enable RLS on all schema tables
ALTER TABLE schema_registries ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_field_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_post_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_audit_log ENABLE ROW LEVEL SECURITY;

-- REGISTRIES: Public read active, admin write
CREATE POLICY "schema_registries_select_active" ON schema_registries
  FOR SELECT USING (is_active = true);

CREATE POLICY "schema_registries_admin_all" ON schema_registries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ITEMS: Public read, admin write
CREATE POLICY "schema_items_select" ON schema_items
  FOR SELECT USING (true);

CREATE POLICY "schema_items_admin_all" ON schema_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- FIELDS: Public read active, admin write
CREATE POLICY "schema_fields_select_active" ON schema_fields
  FOR SELECT USING (is_active = true);

CREATE POLICY "schema_fields_admin_all" ON schema_fields
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- FIELD VERSIONS: Public read, admin insert
CREATE POLICY "schema_field_versions_select" ON schema_field_versions
  FOR SELECT USING (true);

CREATE POLICY "schema_field_versions_admin_insert" ON schema_field_versions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- FIELD VALUES: Public read, post authors can write
CREATE POLICY "schema_post_field_values_select" ON schema_post_field_values
  FOR SELECT USING (true);

CREATE POLICY "schema_post_field_values_author_all" ON schema_post_field_values
  FOR ALL USING (
    EXISTS (SELECT 1 FROM posts WHERE id = post_id AND author_id = auth.uid())
  );

-- AUDIT LOG: Admin read only, no direct writes
CREATE POLICY "schema_audit_log_admin_select" ON schema_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Block all direct writes to audit log (trigger only)
CREATE POLICY "schema_audit_log_no_insert" ON schema_audit_log
  FOR INSERT WITH CHECK (false);

-- ============================================
-- 10. AUDIT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION schema_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO schema_audit_log (table_name, record_id, action, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'create', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO schema_audit_log (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO schema_audit_log (table_name, record_id, action, old_values, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'delete', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Apply audit triggers
CREATE TRIGGER schema_registries_audit
  AFTER INSERT OR UPDATE OR DELETE ON schema_registries
  FOR EACH ROW EXECUTE FUNCTION schema_audit_trigger();

CREATE TRIGGER schema_items_audit
  AFTER INSERT OR UPDATE OR DELETE ON schema_items
  FOR EACH ROW EXECUTE FUNCTION schema_audit_trigger();

CREATE TRIGGER schema_fields_audit
  AFTER INSERT OR UPDATE OR DELETE ON schema_fields
  FOR EACH ROW EXECUTE FUNCTION schema_audit_trigger();

CREATE TRIGGER schema_field_versions_audit
  AFTER INSERT OR UPDATE OR DELETE ON schema_field_versions
  FOR EACH ROW EXECUTE FUNCTION schema_audit_trigger();

-- ============================================
-- 11. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_schema_items_registry ON schema_items(registry_id);
CREATE INDEX IF NOT EXISTS idx_schema_items_parent ON schema_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_schema_field_versions_field ON schema_field_versions(field_id);
CREATE INDEX IF NOT EXISTS idx_schema_post_values_post ON schema_post_field_values(post_id);
CREATE INDEX IF NOT EXISTS idx_schema_audit_table_record ON schema_audit_log(table_name, record_id);

-- ============================================
-- 12. HELPER FUNCTIONS
-- ============================================

-- Get current field definition by key
CREATE OR REPLACE FUNCTION get_field_definition(p_field_key TEXT)
RETURNS TABLE (
  field_id UUID,
  field_key TEXT,
  version INTEGER,
  display_name TEXT,
  display_name_ar TEXT,
  field_type schema_field_type,
  registry_id UUID,
  constraints JSONB,
  default_value JSONB,
  applies_to content_type_enum[],
  is_required BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sf.id,
    sf.field_key,
    sfv.version,
    sfv.display_name,
    sfv.display_name_ar,
    sfv.field_type,
    sfv.registry_id,
    sfv.constraints,
    sfv.default_value,
    sfv.applies_to,
    sfv.is_required
  FROM schema_fields sf
  JOIN schema_field_versions sfv ON sf.current_version_id = sfv.id
  WHERE sf.field_key = p_field_key AND sf.is_active = true;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Get all active fields for a content type
CREATE OR REPLACE FUNCTION get_fields_for_content_type(p_content_type content_type_enum)
RETURNS TABLE (
  field_id UUID,
  field_version_id UUID,
  field_key TEXT,
  version INTEGER,
  display_name TEXT,
  display_name_ar TEXT,
  field_type schema_field_type,
  registry_id UUID,
  constraints JSONB,
  default_value JSONB,
  is_required BOOLEAN,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sf.id,
    sfv.id,
    sf.field_key,
    sfv.version,
    sfv.display_name,
    sfv.display_name_ar,
    sfv.field_type,
    sfv.registry_id,
    sfv.constraints,
    sfv.default_value,
    sfv.is_required,
    sfv.sort_order
  FROM schema_fields sf
  JOIN schema_field_versions sfv ON sf.current_version_id = sfv.id
  WHERE sf.is_active = true 
    AND p_content_type = ANY(sfv.applies_to)
  ORDER BY sfv.sort_order, sfv.display_name;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- ============================================
-- 13. UPDATED_AT TRIGGERS
-- ============================================
CREATE TRIGGER update_schema_registries_updated_at
  BEFORE UPDATE ON schema_registries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schema_items_updated_at
  BEFORE UPDATE ON schema_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schema_fields_updated_at
  BEFORE UPDATE ON schema_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schema_post_field_values_updated_at
  BEFORE UPDATE ON schema_post_field_values
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 14. GRANTS
-- ============================================
GRANT SELECT ON schema_registries TO anon, authenticated;
GRANT SELECT ON schema_items TO anon, authenticated;
GRANT SELECT ON schema_fields TO anon, authenticated;
GRANT SELECT ON schema_field_versions TO anon, authenticated;
GRANT SELECT ON schema_post_field_values TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON schema_registries TO authenticated;
GRANT INSERT, UPDATE, DELETE ON schema_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON schema_fields TO authenticated;
GRANT INSERT ON schema_field_versions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON schema_post_field_values TO authenticated;

GRANT EXECUTE ON FUNCTION get_field_definition(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_fields_for_content_type(content_type_enum) TO anon, authenticated;
