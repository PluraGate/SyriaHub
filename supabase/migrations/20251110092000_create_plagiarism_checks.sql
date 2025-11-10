CREATE TABLE IF NOT EXISTS plagiarism_checks (
COMMENT ON COLUMN plagiarism_checks.score IS 'Provider-specific plagiarism score (0-100).';
  post_version_id UUID NOT NULL REFERENCES post_versions(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  score NUMERIC(5, 2),
  flagged BOOLEAN NOT NULL DEFAULT false,
  summary TEXT,
  raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS plagiarism_checks_version_idx ON plagiarism_checks(post_version_id);
CREATE INDEX IF NOT EXISTS plagiarism_checks_status_idx ON plagiarism_checks(status);
CREATE INDEX IF NOT EXISTS plagiarism_checks_flagged_idx ON plagiarism_checks(flagged);

ALTER TABLE plagiarism_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Plagiarism checks viewable by moderators" ON plagiarism_checks;
CREATE POLICY "Plagiarism checks viewable by moderators" ON plagiarism_checks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role IN ('moderator', 'admin')
    )
  );

DROP POLICY IF EXISTS "Moderators manage plagiarism checks" ON plagiarism_checks;
CREATE POLICY "Moderators manage plagiarism checks" ON plagiarism_checks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role IN ('moderator', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.role IN ('moderator', 'admin')
    )
  );

COMMENT ON TABLE plagiarism_checks IS 'AI plagiarism scan results associated with specific post versions.';
COMMENT ON COLUMN plagiarism_checks.score IS 'Provider-specific plagiarism score (0-100).' ;
