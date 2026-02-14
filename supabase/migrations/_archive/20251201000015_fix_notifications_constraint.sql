-- Drop existing check constraint on type
-- We try common names, or just alter the column type to text to drop constraints if possible?
-- No, we need to drop the constraint by name.
-- Since we don't know the name for sure, we can try to drop the one we created (if it existed) or the default one.
-- Postgres default is table_column_check.

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new check constraint that includes all types
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('badge', 'solution', 'reply', 'mention', 'system', 'comment'));

-- Re-enable triggers (just in case)
-- (They are already enabled)
