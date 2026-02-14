-- Create suggestions table
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

-- RLS Policies
CREATE POLICY "Anyone can view suggestions" ON suggestions
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create suggestions" ON suggestions
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

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
