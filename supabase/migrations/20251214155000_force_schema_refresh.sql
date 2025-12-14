-- Ensure event_rsvps table exists (Re-applying definition in case it was lost)
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Ensure Indexes
CREATE INDEX IF NOT EXISTS event_rsvps_event_id_idx ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS event_rsvps_user_id_idx ON event_rsvps(user_id);

-- Enable RLS
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- Re-apply Policies (Drop first to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view rsvps" ON event_rsvps;
CREATE POLICY "Anyone can view rsvps" ON event_rsvps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can rsvp" ON event_rsvps;
CREATE POLICY "Authenticated users can rsvp" ON event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own rsvp" ON event_rsvps;
CREATE POLICY "Users can update their own rsvp" ON event_rsvps FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own rsvp" ON event_rsvps;
CREATE POLICY "Users can delete their own rsvp" ON event_rsvps FOR DELETE USING (auth.uid() = user_id);

-- Force schema cache refresh finally
NOTIFY pgrst, 'reload schema';
