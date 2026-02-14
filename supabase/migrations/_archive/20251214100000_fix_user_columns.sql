-- Ensure all required user profile columns exist
-- This script adds any missing columns with IF NOT EXISTS

-- Core profile fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS research_interests TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_locale TEXT DEFAULT 'en';

-- Add column comments
COMMENT ON COLUMN public.users.avatar_url IS 'User profile picture URL';
COMMENT ON COLUMN public.users.cover_image_url IS 'Profile banner/cover image URL';
COMMENT ON COLUMN public.users.location IS 'User location (city, country)';
COMMENT ON COLUMN public.users.website IS 'User personal website';
COMMENT ON COLUMN public.users.research_interests IS 'Array of research interest tags';
COMMENT ON COLUMN public.users.preferred_locale IS 'User preferred language locale';

-- Force PostgREST to reload its schema cache by issuing NOTIFY
-- This is the recommended way to reload schema in Supabase
NOTIFY pgrst, 'reload schema';
