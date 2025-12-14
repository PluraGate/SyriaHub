-- Force PostgREST schema cache reload
-- This is necessary when new tables are added but the API has not yet detected them
NOTIFY pgrst, 'reload schema';
