-- Quick check for bookmarks table existence and structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookmarks'
ORDER BY ordinal_position;

-- Check for any bookmarks data
SELECT COUNT(*) as bookmark_count FROM bookmarks;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
