-- Create suggestions table if it doesn't exist
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Anyone can view suggestions" ON suggestions;
DROP POLICY IF EXISTS "Authenticated users can create suggestions" ON suggestions;
DROP POLICY IF EXISTS "Authors can update suggestions (accept/reject)" ON suggestions;
DROP POLICY IF EXISTS "Users can delete their own suggestions" ON suggestions;
DROP POLICY IF EXISTS "Users can create suggestions" ON suggestions;

-- Create correct policies
CREATE POLICY "Anyone can view suggestions" ON suggestions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create suggestions" ON suggestions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update suggestions (accept/reject)" ON suggestions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = suggestions.post_id 
      AND posts.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own suggestions" ON suggestions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS suggestions_post_id_idx ON suggestions(post_id);
CREATE INDEX IF NOT EXISTS suggestions_user_id_idx ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS suggestions_status_idx ON suggestions(status);
