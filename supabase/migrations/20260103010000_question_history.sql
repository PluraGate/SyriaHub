-- Question History table for storing past Question Advisor searches
CREATE TABLE IF NOT EXISTS question_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    context TEXT,
    clarity_score INTEGER,
    measurability_score INTEGER,
    scope_assessment TEXT CHECK (scope_assessment IN ('too_broad', 'too_narrow', 'appropriate')),
    has_bias BOOLEAN DEFAULT FALSE,
    suggestions JSONB DEFAULT '[]'::jsonb,
    refined_versions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_question_history_user_id ON question_history(user_id);
CREATE INDEX IF NOT EXISTS idx_question_history_created_at ON question_history(created_at DESC);

-- RLS Policies
ALTER TABLE question_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own history
DROP POLICY IF EXISTS "Users can view own question history" ON question_history;
CREATE POLICY "Users can view own question history"
    ON question_history FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own history
DROP POLICY IF EXISTS "Users can insert own question history" ON question_history;
CREATE POLICY "Users can insert own question history"
    ON question_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own history
DROP POLICY IF EXISTS "Users can delete own question history" ON question_history;
CREATE POLICY "Users can delete own question history"
    ON question_history FOR DELETE
    USING (auth.uid() = user_id);
