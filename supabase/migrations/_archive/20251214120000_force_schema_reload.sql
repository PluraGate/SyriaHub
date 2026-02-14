-- Force PostgREST schema reload
-- Run this SQL to ensure the bookmarks table is recognized

-- Verify bookmarks table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookmarks') THEN
        RAISE EXCEPTION 'bookmarks table does not exist!';
    END IF;
END $$;

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';

-- Also reload config if available
NOTIFY pgrst, 'reload config';

-- Re-grant permissions just in case
GRANT ALL ON public.bookmarks TO authenticated;
GRANT SELECT ON public.bookmarks TO anon;
