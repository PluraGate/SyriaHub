-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on created_at for efficient sorting
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);

-- Create index on author_id for efficient filtering
CREATE INDEX IF NOT EXISTS posts_author_id_idx ON posts(author_id);

-- Create index on tags for efficient tag filtering
CREATE INDEX IF NOT EXISTS posts_tags_idx ON posts USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read posts
CREATE POLICY "Anyone can read posts" ON posts
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users to insert posts
CREATE POLICY "Authenticated users can insert posts" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Create policy to allow users to update their own posts
CREATE POLICY "Users can update their own posts" ON posts
  FOR UPDATE
  USING (auth.uid() = author_id);

-- Create policy to allow users to delete their own posts
CREATE POLICY "Users can delete their own posts" ON posts
  FOR DELETE
  USING (auth.uid() = author_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
