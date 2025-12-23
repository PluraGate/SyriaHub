-- Precedent System Schema
-- Stores curated case studies that match spatial patterns

-- Precedents table: stores historical case studies
CREATE TABLE IF NOT EXISTS precedents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic info
    title TEXT NOT NULL,
    title_ar TEXT,
    summary TEXT NOT NULL,
    summary_ar TEXT,
    
    -- Pattern matching
    pattern_id TEXT NOT NULL CHECK (pattern_id IN ('P1', 'P2', 'P3', 'P4', 'P5')),
    
    -- Spatial scope
    governorate TEXT,
    geometry JSONB,
    
    -- Source and credibility
    source_url TEXT,
    source_name TEXT,
    source_date DATE,
    trust_level TEXT CHECK (trust_level IN ('high', 'medium', 'low')) DEFAULT 'medium',
    
    -- Content
    full_text TEXT,
    key_lessons TEXT[],
    
    -- Admin curation
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_published BOOLEAN DEFAULT false,
    
    -- Search
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(full_text, '')), 'C')
    ) STORED
);

-- Index for pattern matching
CREATE INDEX IF NOT EXISTS idx_precedents_pattern ON precedents(pattern_id);
CREATE INDEX IF NOT EXISTS idx_precedents_governorate ON precedents(governorate);
CREATE INDEX IF NOT EXISTS idx_precedents_published ON precedents(is_published);
CREATE INDEX IF NOT EXISTS idx_precedents_search ON precedents USING GIN(search_vector);

-- Precedent-pattern matches: tracks when precedents are surfaced
CREATE TABLE IF NOT EXISTS precedent_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    precedent_id UUID REFERENCES precedents(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    pattern_id TEXT NOT NULL,
    confidence DECIMAL(3,2),
    matched_at TIMESTAMPTZ DEFAULT now(),
    
    -- Feedback
    was_helpful BOOLEAN,
    feedback_at TIMESTAMPTZ,
    
    UNIQUE(precedent_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_precedent_matches_post ON precedent_matches(post_id);
CREATE INDEX IF NOT EXISTS idx_precedent_matches_precedent ON precedent_matches(precedent_id);

-- RLS policies
ALTER TABLE precedents ENABLE ROW LEVEL SECURITY;
ALTER TABLE precedent_matches ENABLE ROW LEVEL SECURITY;

-- Anyone can read published precedents
CREATE POLICY "Published precedents are viewable by all"
    ON precedents FOR SELECT
    USING (is_published = true);

-- Admins can manage precedents
CREATE POLICY "Admins can manage precedents"
    ON precedents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'moderator')
        )
    );

-- Authenticated users can view matches on their own posts
CREATE POLICY "Users can view matches on their posts"
    ON precedent_matches FOR SELECT
    USING (
        post_id IN (
            SELECT id FROM posts WHERE author_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'moderator')
        )
    );

-- Admins can manage matches
CREATE POLICY "Admins can manage matches"
    ON precedent_matches FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'moderator')
        )
    );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_precedent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_precedent_updated_at
    BEFORE UPDATE ON precedents
    FOR EACH ROW
    EXECUTE FUNCTION update_precedent_updated_at();
