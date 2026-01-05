-- ============================================
-- Update Schema Registry RPC to return version id + extra fields
-- ============================================

-- Must DROP first because return type is changing
DROP FUNCTION IF EXISTS get_fields_for_content_type(content_type_enum);

CREATE OR REPLACE FUNCTION get_fields_for_content_type(p_content_type content_type_enum)
RETURNS TABLE (
  id UUID,
  field_id UUID,
  field_key TEXT,
  version INTEGER,
  display_name TEXT,
  display_name_ar TEXT,
  description TEXT,
  field_type schema_field_type,
  registry_id UUID,
  constraints JSONB,
  default_value JSONB,
  applies_to content_type_enum[],
  visibility TEXT,
  is_required BOOLEAN,
  is_searchable BOOLEAN,
  is_filterable BOOLEAN,
  sort_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sfv.id,
    sf.id,
    sf.field_key,
    sfv.version,
    sfv.display_name,
    sfv.display_name_ar,
    sfv.description,
    sfv.field_type,
    sfv.registry_id,
    sfv.constraints,
    sfv.default_value,
    sfv.applies_to,
    sfv.visibility,
    sfv.is_required,
    sfv.is_searchable,
    sfv.is_filterable,
    sfv.sort_order
  FROM schema_fields sf
  JOIN schema_field_versions sfv ON sf.current_version_id = sfv.id
  WHERE sf.is_active = true 
    AND p_content_type = ANY(sfv.applies_to)
  ORDER BY sfv.sort_order, sfv.display_name;
END;
$$ LANGUAGE plpgsql
SET search_path = public;
