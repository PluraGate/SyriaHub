-- Migration: Create saved_searches table for persisting user search history
-- This allows users to save and manage their research searches

CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    source_type TEXT NOT NULL DEFAULT 'all' CHECK (source_type IN ('internal', 'web', 'all')),
    result_count INT DEFAULT 0,
    cached_results JSONB DEFAULT '{}', -- Store { internal: [], web: [] } to avoid re-querying
    title TEXT, -- Optional custom title for the search
    notes TEXT, -- Optional notes about the search
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient user queries
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_created_at ON saved_searches(created_at DESC);

-- RLS Policies
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Users can only see their own saved searches
CREATE POLICY "Users can view own saved searches"
    ON saved_searches FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own saved searches
CREATE POLICY "Users can create own saved searches"
    ON saved_searches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own saved searches
CREATE POLICY "Users can update own saved searches"
    ON saved_searches FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own saved searches
CREATE POLICY "Users can delete own saved searches"
    ON saved_searches FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_searches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saved_searches_updated_at
    BEFORE UPDATE ON saved_searches
    FOR EACH ROW
    EXECUTE FUNCTION update_saved_searches_updated_at();
