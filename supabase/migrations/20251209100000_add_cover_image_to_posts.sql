-- Add cover image support to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Add index for faster queries when filtering by posts with covers
CREATE INDEX IF NOT EXISTS idx_posts_cover_image ON posts (cover_image_url) WHERE cover_image_url IS NOT NULL;
