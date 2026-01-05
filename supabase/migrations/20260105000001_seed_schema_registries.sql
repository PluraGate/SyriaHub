-- ============================================
-- SEED INITIAL SCHEMA REGISTRIES
-- Migration: 20260105000001_seed_schema_registries.sql
--
-- Populates the registries with standard initial data.
-- ============================================

DO $$ 
DECLARE
  v_domain_id UUID;
  v_method_id UUID;
  v_evidence_id UUID;
  v_scale_id UUID;
  v_admin_id UUID;
BEGIN

  -- Get the first admin user for attribution (optional, can be null)
  SELECT id INTO v_admin_id FROM users WHERE role = 'admin' LIMIT 1;

  -- 1. Research Domains
  INSERT INTO schema_registries (registry_key, display_name, display_name_ar, description, created_by)
  VALUES ('research_domains', 'Research Domains', 'مجالات البحث', 'Primary academic and practical disciplines.', v_admin_id)
  ON CONFLICT (registry_key) DO UPDATE SET updated_at = now()
  RETURNING id INTO v_domain_id;

  INSERT INTO schema_items (registry_id, item_key, display_name, display_name_ar, sort_order, created_by)
  VALUES 
    (v_domain_id, 'archaeology', 'Archaeology', 'علم الآثار', 10, v_admin_id),
    (v_domain_id, 'urban_planning', 'Urban Planning', 'التخطيط الحضري', 20, v_admin_id),
    (v_domain_id, 'sociology', 'Sociology', 'علم الاجتماع', 30, v_admin_id),
    (v_domain_id, 'economics', 'Economics', 'الاقتصاد', 40, v_admin_id),
    (v_domain_id, 'history', 'History', 'التاريخ', 50, v_admin_id),
    (v_domain_id, 'political_science', 'Political Science', 'العلوم السياسية', 60, v_admin_id)
  ON CONFLICT (registry_id, item_key) DO NOTHING;

  -- 2. Methodologies
  INSERT INTO schema_registries (registry_key, display_name, display_name_ar, description, created_by)
  VALUES ('methodologies', 'Methodologies', 'المنهجيات', 'Research methods used to collect and analyze data.', v_admin_id)
  ON CONFLICT (registry_key) DO UPDATE SET updated_at = now()
  RETURNING id INTO v_method_id;

  INSERT INTO schema_items (registry_id, item_key, display_name, display_name_ar, sort_order, created_by)
  VALUES 
    (v_method_id, 'field_survey', 'Field Survey', 'مسح ميداني', 10, v_admin_id),
    (v_method_id, 'remote_sensing', 'Remote Sensing', 'الاستشعار عن بعد', 20, v_admin_id),
    (v_method_id, 'oral_history', 'Oral History', 'التاريخ الشفوي', 30, v_admin_id),
    (v_method_id, 'statistical_analysis', 'Statistical Analysis', 'التحليل الإحصائي', 40, v_admin_id),
    (v_method_id, 'ethnography', 'Ethnography', 'الإثنوغرافيا', 50, v_admin_id),
    (v_method_id, 'archival_research', 'Archival Research', 'البحث الأرشيفي', 60, v_admin_id)
  ON CONFLICT (registry_id, item_key) DO NOTHING;

  -- 3. Evidence Types (Data Sources)
  INSERT INTO schema_registries (registry_key, display_name, display_name_ar, description, created_by)
  VALUES ('evidence_types', 'Evidence Types', 'أنواع الأدلة', 'Types of data sources or evidence used.', v_admin_id)
  ON CONFLICT (registry_key) DO UPDATE SET updated_at = now()
  RETURNING id INTO v_evidence_id;

  INSERT INTO schema_items (registry_id, item_key, display_name, display_name_ar, sort_order, created_by)
  VALUES 
    (v_evidence_id, 'satellite_imagery', 'Satellite Imagery', 'صور الأقمار الصناعية', 10, v_admin_id),
    (v_evidence_id, 'official_records', 'Official Records', 'سجلات رسمية', 20, v_admin_id),
    (v_evidence_id, 'interviews', 'Interviews', 'مقابلات', 30, v_admin_id),
    (v_evidence_id, 'media_reports', 'Media Reports', 'تقارير إعلامية', 40, v_admin_id),
    (v_evidence_id, 'social_media', 'Social Media', 'وسائل التواصل الاجتماعي', 50, v_admin_id)
  ON CONFLICT (registry_id, item_key) DO NOTHING;

  -- 4. Spatial Scales
  INSERT INTO schema_registries (registry_key, display_name, display_name_ar, description, created_by)
  VALUES ('spatial_scales', 'Spatial Scales', 'المقاييس المكانية', 'The geographic scale of the research.', v_admin_id)
  ON CONFLICT (registry_key) DO UPDATE SET updated_at = now()
  RETURNING id INTO v_scale_id;

  INSERT INTO schema_items (registry_id, item_key, display_name, display_name_ar, sort_order, created_by)
  VALUES 
    (v_scale_id, 'site', 'Site', 'موقع', 10, v_admin_id),
    (v_scale_id, 'neighborhood', 'Neighborhood', 'حي', 20, v_admin_id),
    (v_scale_id, 'city', 'City', 'مدينة', 30, v_admin_id),
    (v_scale_id, 'region', 'Region', 'منطقة', 40, v_admin_id),
    (v_scale_id, 'national', 'National', 'وطني', 50, v_admin_id),
    (v_scale_id, 'transnational', 'Transnational', 'عابر للحدود', 60, v_admin_id)
  ON CONFLICT (registry_id, item_key) DO NOTHING;

END $$;
