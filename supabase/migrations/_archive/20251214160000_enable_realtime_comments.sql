-- Enable realtime for comments table
-- This allows clients to subscribe to new comments in real-time

-- Add comments table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
