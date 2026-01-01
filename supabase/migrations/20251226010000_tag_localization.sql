-- Migration: Add Arabic label support for tags
-- This allows tags to have localized Arabic translations

-- Add label_ar column for Arabic translations
ALTER TABLE tags ADD COLUMN IF NOT EXISTS label_ar TEXT;

-- Add index for label_ar for faster lookups
CREATE INDEX IF NOT EXISTS idx_tags_label_ar ON tags(label_ar);

-- Comment for documentation
COMMENT ON COLUMN tags.label_ar IS 'Arabic translation of the tag label';
