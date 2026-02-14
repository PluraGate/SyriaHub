-- Migration: Create saved_references table for saving external web resources
-- This allows users to save web search results as research references

CREATE TABLE saved_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    snippet TEXT,
    source TEXT, -- e.g., "World Bank", "Google Scholar"
    citation TEXT, -- Formatted citation
    notes TEXT, -- User notes
    tags TEXT[], -- User-defined tags
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_saved_references_user_id ON saved_references(user_id);
CREATE INDEX idx_saved_references_created_at ON saved_references(created_at DESC);
CREATE UNIQUE INDEX idx_saved_references_user_url ON saved_references(user_id, url);

-- RLS Policies
ALTER TABLE saved_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved references"
    ON saved_references FOR ALL USING (auth.uid() = user_id);
