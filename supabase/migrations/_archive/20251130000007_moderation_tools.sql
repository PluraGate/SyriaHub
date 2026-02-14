-- Make post_id nullable to allow reporting other resources
ALTER TABLE reports ALTER COLUMN post_id DROP NOT NULL;

-- Add comment_id for reporting comments
ALTER TABLE reports ADD COLUMN IF NOT EXISTS comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- Ensure exactly one target is specified
ALTER TABLE reports ADD CONSTRAINT reports_target_check CHECK (
  (post_id IS NOT NULL AND comment_id IS NULL) OR
  (post_id IS NULL AND comment_id IS NOT NULL)
);

-- Add index for comment_id
CREATE INDEX IF NOT EXISTS reports_comment_id_idx ON reports(comment_id);
