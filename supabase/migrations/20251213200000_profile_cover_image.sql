-- Add cover image to user profiles
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Add comment
COMMENT ON COLUMN public.users.cover_image_url IS 'Profile banner/cover image URL';
