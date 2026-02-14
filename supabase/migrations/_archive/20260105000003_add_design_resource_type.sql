-- ============================================
-- ADD DESIGN RESOURCE TYPE
-- ============================================
-- Adds 'design' as a valid resource type for CAD files, 
-- 3D models, and architectural drawings

-- Update generate_resource_slug to accept 'design' type
CREATE OR REPLACE FUNCTION generate_resource_slug(
  p_resource_type TEXT,
  p_discipline TEXT,
  p_short_title TEXT,
  p_created_at TIMESTAMP WITH TIME ZONE,
  p_uuid UUID
)
RETURNS TEXT AS $$
DECLARE
  v_type TEXT;
  v_disc TEXT;
  v_title TEXT;
  v_date TEXT;
  v_hash TEXT;
BEGIN
  -- Validate and default resource type (now includes 'design')
  IF p_resource_type IN ('dataset', 'paper', 'tool', 'media', 'template', 'design') THEN
    v_type := p_resource_type;
  ELSE
    v_type := 'resource';
  END IF;
  
  -- Sanitize discipline (basic mapping)
  v_disc := LOWER(COALESCE(p_discipline, 'general'));
  v_disc := CASE v_disc
    WHEN 'cultural heritage' THEN 'heritage'
    WHEN 'cultural-heritage' THEN 'heritage'
    WHEN 'legal' THEN 'law'
    WHEN 'legal studies' THEN 'law'
    WHEN 'human rights' THEN 'rights'
    WHEN 'human-rights' THEN 'rights'
    WHEN 'urban planning' THEN 'urban'
    WHEN 'urban-planning' THEN 'urban'
    WHEN 'architecture' THEN 'arch'
    WHEN 'architectural' THEN 'arch'
    ELSE REGEXP_REPLACE(LOWER(v_disc), '[^a-z0-9-]', '', 'g')
  END;
  IF v_disc = '' THEN v_disc := 'general'; END IF;
  
  -- Sanitize short title
  v_title := LOWER(COALESCE(p_short_title, 'untitled'));
  v_title := REGEXP_REPLACE(v_title, '[^a-z0-9\s-]', '', 'g');
  v_title := REGEXP_REPLACE(v_title, '\s+', '-', 'g');
  v_title := REGEXP_REPLACE(v_title, '-+', '-', 'g');
  v_title := TRIM(BOTH '-' FROM v_title);
  v_title := LEFT(v_title, 50);
  IF v_title = '' THEN v_title := 'untitled'; END IF;
  
  -- Format date as YYYYMMDD
  v_date := TO_CHAR(p_created_at, 'YYYYMMDD');
  
  -- Extract last 6 chars of UUID (without dashes)
  v_hash := RIGHT(REPLACE(p_uuid::TEXT, '-', ''), 6);
  
  RETURN v_type || '-' || v_disc || '-' || v_title || '-' || v_date || '-' || v_hash;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION generate_resource_slug IS 'Generates a canonical slug for a resource post. Valid types: dataset, paper, tool, media, template, design.';
