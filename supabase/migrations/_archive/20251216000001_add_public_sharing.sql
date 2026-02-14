-- Public Sharing Migration
-- Created: 2024-12-16
-- Purpose: Add public sharing tokens and tables for anonymous responses

-- =====================================================
-- Add public sharing columns to surveys
-- =====================================================

ALTER TABLE surveys ADD COLUMN IF NOT EXISTS public_token TEXT UNIQUE;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS allow_public_responses BOOLEAN DEFAULT false;

-- Create index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_surveys_public_token ON surveys(public_token) WHERE public_token IS NOT NULL;

-- =====================================================
-- Add public sharing columns to polls
-- =====================================================

ALTER TABLE polls ADD COLUMN IF NOT EXISTS public_token TEXT UNIQUE;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS allow_public_responses BOOLEAN DEFAULT false;

-- Create index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_polls_public_token ON polls(public_token) WHERE public_token IS NOT NULL;

-- =====================================================
-- Create table for anonymous poll votes
-- =====================================================

CREATE TABLE IF NOT EXISTS poll_public_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    option_ids TEXT[] NOT NULL,
    fingerprint_hash TEXT NOT NULL,
    ip_hash TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(poll_id, fingerprint_hash)
);

-- =====================================================
-- RLS Policies for public access
-- =====================================================

-- Allow anyone to read surveys with public_token set and allow_public_responses = true
DROP POLICY IF EXISTS "Public can read public surveys" ON surveys;
CREATE POLICY "Public can read public surveys" ON surveys
    FOR SELECT
    USING (
        public_token IS NOT NULL 
        AND allow_public_responses = true 
        AND status = 'active'
    );

-- Allow anyone to read questions for public surveys
DROP POLICY IF EXISTS "Public can read public survey questions" ON survey_questions;
CREATE POLICY "Public can read public survey questions" ON survey_questions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM surveys 
            WHERE surveys.id = survey_questions.survey_id 
            AND surveys.public_token IS NOT NULL 
            AND surveys.allow_public_responses = true
            AND surveys.status = 'active'
        )
    );

-- Allow anyone to insert responses to public surveys
DROP POLICY IF EXISTS "Public can respond to public surveys" ON survey_responses;
CREATE POLICY "Public can respond to public surveys" ON survey_responses
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM surveys 
            WHERE surveys.id = survey_responses.survey_id 
            AND surveys.public_token IS NOT NULL 
            AND surveys.allow_public_responses = true
            AND surveys.status = 'active'
        )
    );

-- Allow anyone to read public polls
DROP POLICY IF EXISTS "Public can read public polls" ON polls;
CREATE POLICY "Public can read public polls" ON polls
    FOR SELECT
    USING (
        public_token IS NOT NULL 
        AND allow_public_responses = true 
        AND is_active = true
    );

-- Enable RLS on poll_public_votes
ALTER TABLE poll_public_votes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert and read public votes
DROP POLICY IF EXISTS "Public can vote on public polls" ON poll_public_votes;
CREATE POLICY "Public can vote on public polls" ON poll_public_votes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM polls 
            WHERE polls.id = poll_public_votes.poll_id 
            AND polls.public_token IS NOT NULL 
            AND polls.allow_public_responses = true
            AND polls.is_active = true
        )
    );

DROP POLICY IF EXISTS "Public can read their own votes" ON poll_public_votes;
CREATE POLICY "Public can read their own votes" ON poll_public_votes
    FOR SELECT
    USING (true);

-- =====================================================
-- Function to generate unique public token
-- =====================================================

CREATE OR REPLACE FUNCTION generate_public_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$;
