-- Run this script in your Supabase Dashboard SQL Editor to force reload the schema cache
-- This is needed after adding new tables like 'bookmarks'

-- First, verify the bookmarks table exists
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'bookmarks';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'bookmarks';

-- Check policies
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'bookmarks';

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';

-- Recommended: Also reload the config if available
NOTIFY pgrst, 'reload config';
