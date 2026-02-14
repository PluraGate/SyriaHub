-- ============================================
-- ADD ADMIN SKILLS MANAGEMENT POLICIES
-- ============================================
-- Allow admins and moderators to update and delete skills

-- Policy for admins to update skills
CREATE POLICY "Admins can update skills" ON skills 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator')
    )
  );

-- Policy for admins to delete skills
CREATE POLICY "Admins can delete skills" ON skills 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator')
    )
  );

-- Policy for admins to delete user_skills (needed when deleting/merging skills)
CREATE POLICY "Admins can delete user skills" ON user_skills 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator')
    )
  );

-- Policy for admins to update user_skills (needed when merging skills)
CREATE POLICY "Admins can update user skills" ON user_skills 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'moderator')
    )
  );
