-- Fix: Add 'link' column to notifications table for backwards compatibility
-- Some older triggers reference 'link' while the new schema uses 'url'

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;

-- Copy existing url values to link for consistency
UPDATE notifications SET link = url WHERE link IS NULL AND url IS NOT NULL;

-- Create a trigger to sync url and link columns
CREATE OR REPLACE FUNCTION sync_notification_link()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync link and url columns
  IF NEW.link IS NOT NULL AND NEW.url IS NULL THEN
    NEW.url = NEW.link;
  ELSIF NEW.url IS NOT NULL AND NEW.link IS NULL THEN
    NEW.link = NEW.url;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_notification_link ON notifications;
CREATE TRIGGER trigger_sync_notification_link
  BEFORE INSERT OR UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION sync_notification_link();
