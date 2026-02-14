-- Fix plagiarism_checks RLS to allow post authors to run checks
-- The original policy only allows moderators/admins

DROP POLICY IF EXISTS "Authors can run plagiarism checks on their own posts" ON plagiarism_checks;

CREATE POLICY "Authors can run plagiarism checks on their own posts" ON plagiarism_checks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM post_versions pv
      JOIN posts p ON pv.post_id = p.id
      WHERE pv.id = plagiarism_checks.post_version_id
      AND p.author_id = auth.uid()
    )
  );

-- Allow authors to view their own plagiarism check results
DROP POLICY IF EXISTS "Authors can view plagiarism checks on their own posts" ON plagiarism_checks;

CREATE POLICY "Authors can view plagiarism checks on their own posts" ON plagiarism_checks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM post_versions pv
      JOIN posts p ON pv.post_id = p.id
      WHERE pv.id = plagiarism_checks.post_version_id
      AND p.author_id = auth.uid()
    )
  );
