-- Update content_type check constraint to include 'event'
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_content_type_check;
ALTER TABLE posts ADD CONSTRAINT posts_content_type_check 
  CHECK (content_type IN ('article', 'question', 'answer', 'resource', 'event'));

-- Create event_rsvps table
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Indexes for event_rsvps
CREATE INDEX IF NOT EXISTS event_rsvps_event_id_idx ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS event_rsvps_user_id_idx ON event_rsvps(user_id);

-- Enable RLS
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view rsvps" ON event_rsvps
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can rsvp" ON event_rsvps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rsvp" ON event_rsvps
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rsvp" ON event_rsvps
  FOR DELETE
  USING (auth.uid() = user_id);
