-- Add metadata column to posts for storing resource details (url, size, mime_type, etc.)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update content_type check constraint to include 'resource'
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_content_type_check;
ALTER TABLE posts ADD CONSTRAINT posts_content_type_check 
  CHECK (content_type IN ('article', 'question', 'answer', 'resource'));

-- Create resources bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for resources bucket

-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'resources' );

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload resources"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resources' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update/delete their own files
CREATE POLICY "Users can update their own resources"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resources' 
  AND auth.uid() = owner
);

CREATE POLICY "Users can delete their own resources"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resources' 
  AND auth.uid() = owner
);
