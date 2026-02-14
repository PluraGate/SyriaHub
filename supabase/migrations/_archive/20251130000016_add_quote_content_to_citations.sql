-- Add quote_content column to citations table
ALTER TABLE citations ADD COLUMN IF NOT EXISTS quote_content TEXT;

-- Update RLS policies if necessary (existing ones should cover update/insert if they are broad enough, but let's check)
-- The existing policy "Authenticated users can create citations" allows INSERT.
-- We might need an UPDATE policy if we want users to be able to edit the quote later, but for now, it's set on creation.
