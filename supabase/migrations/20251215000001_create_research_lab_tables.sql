-- Research Lab Tables Migration
-- Created: 2024-12-15
-- Purpose: Add tables for surveys, polls, and research tools

-- =====================================================
-- SURVEYS
-- =====================================================

CREATE TABLE IF NOT EXISTS surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
    is_anonymous BOOLEAN DEFAULT false,
    allow_multiple_responses BOOLEAN DEFAULT false,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    response_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN (
        'single_choice', 'multiple_choice', 'text', 'long_text',
        'scale', 'rating', 'matrix', 'date', 'number', 'dropdown'
    )),
    options JSONB, -- For choice questions: [{ id, text, order }]
    required BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    description TEXT, -- Optional help text
    validation_rules JSONB, -- { min, max, pattern, etc. }
    conditional_logic JSONB, -- Show if other question has specific answer
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    respondent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    answers JSONB NOT NULL, -- { question_id: answer_value }
    is_complete BOOLEAN DEFAULT true,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB -- For anonymous: IP hash, user agent
);

-- =====================================================
-- POLLS (lightweight voting)
-- =====================================================

CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    description TEXT,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    options JSONB NOT NULL DEFAULT '[]', -- [{ id, text, vote_count }]
    is_multiple_choice BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false,
    show_results_before_vote BOOLEAN DEFAULT false,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    total_votes INTEGER DEFAULT 0,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL, -- If embedded in post
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    option_ids TEXT[] NOT NULL, -- Array of selected option IDs
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

-- =====================================================
-- DATASET ANALYSES (Statistics tool)
-- =====================================================

CREATE TABLE IF NOT EXISTS dataset_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_ids UUID[], -- Linked resource/dataset IDs
    data_snapshot JSONB, -- Cached data for visualization
    chart_configs JSONB DEFAULT '[]', -- Saved chart configurations
    statistics JSONB, -- Calculated statistics (mean, median, etc.)
    analysis_notes TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AI QUESTION ADVISOR USAGE TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL CHECK (feature IN ('question_advisor', 'other')),
    tokens_used INTEGER DEFAULT 0,
    request_count INTEGER DEFAULT 1,
    period_start DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, feature, period_start)
);

-- Daily/Monthly limits table for future paid tiers
CREATE TABLE IF NOT EXISTS ai_usage_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
    feature TEXT NOT NULL,
    daily_limit INTEGER DEFAULT 10,
    monthly_limit INTEGER DEFAULT 100,
    tokens_per_request INTEGER DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tier, feature)
);

-- Insert default limits for free tier
INSERT INTO ai_usage_limits (tier, feature, daily_limit, monthly_limit, tokens_per_request)
VALUES ('free', 'question_advisor', 10, 100, 2000)
ON CONFLICT (tier, feature) DO NOTHING;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_surveys_author ON surveys(author_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_surveys_created ON surveys(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_survey_questions_survey ON survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_order ON survey_questions(survey_id, order_index);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_respondent ON survey_responses(respondent_id);

CREATE INDEX IF NOT EXISTS idx_polls_author ON polls(author_id);
CREATE INDEX IF NOT EXISTS idx_polls_active ON polls(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_polls_post ON polls(post_id) WHERE post_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user ON poll_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_dataset_analyses_author ON dataset_analyses(author_id);
CREATE INDEX IF NOT EXISTS idx_dataset_analyses_public ON dataset_analyses(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_period ON ai_usage(user_id, feature, period_start);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_limits ENABLE ROW LEVEL SECURITY;

-- Surveys: Public read for active, author full access
CREATE POLICY "Active surveys are viewable by everyone"
    ON surveys FOR SELECT
    USING (status = 'active' OR author_id = auth.uid());

CREATE POLICY "Users can create surveys"
    ON surveys FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their surveys"
    ON surveys FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their surveys"
    ON surveys FOR DELETE
    USING (auth.uid() = author_id);

-- Survey Questions: Same as parent survey
CREATE POLICY "Questions visible for active surveys"
    ON survey_questions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM surveys 
        WHERE surveys.id = survey_questions.survey_id 
        AND (surveys.status = 'active' OR surveys.author_id = auth.uid())
    ));

CREATE POLICY "Authors can manage questions"
    ON survey_questions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM surveys 
        WHERE surveys.id = survey_questions.survey_id 
        AND surveys.author_id = auth.uid()
    ));

-- Survey Responses: Respondent and author access
CREATE POLICY "Authors can view responses"
    ON survey_responses FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM surveys 
        WHERE surveys.id = survey_responses.survey_id 
        AND surveys.author_id = auth.uid()
    ) OR respondent_id = auth.uid());

CREATE POLICY "Users can submit responses"
    ON survey_responses FOR INSERT
    WITH CHECK (auth.uid() = respondent_id OR respondent_id IS NULL);

-- Polls: Public read for active
CREATE POLICY "Active polls are viewable"
    ON polls FOR SELECT
    USING (is_active = true OR author_id = auth.uid());

CREATE POLICY "Users can create polls"
    ON polls FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can manage polls"
    ON polls FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete polls"
    ON polls FOR DELETE
    USING (auth.uid() = author_id);

-- Poll Votes: User can see own votes, author can see all
CREATE POLICY "Users can see their votes"
    ON poll_votes FOR SELECT
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM polls WHERE polls.id = poll_votes.poll_id AND polls.author_id = auth.uid()
    ));

CREATE POLICY "Users can vote"
    ON poll_votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Dataset Analyses: Author and public analyses
CREATE POLICY "Public analyses are viewable"
    ON dataset_analyses FOR SELECT
    USING (is_public = true OR author_id = auth.uid());

CREATE POLICY "Users can create analyses"
    ON dataset_analyses FOR INSERT
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can manage analyses"
    ON dataset_analyses FOR UPDATE
    USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete analyses"
    ON dataset_analyses FOR DELETE
    USING (auth.uid() = author_id);

-- AI Usage: Only own usage
CREATE POLICY "Users can view own usage"
    ON ai_usage FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "System can track usage"
    ON ai_usage FOR ALL
    USING (user_id = auth.uid());

-- AI Usage Limits: Read only
CREATE POLICY "Anyone can read limits"
    ON ai_usage_limits FOR SELECT
    USING (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check AI usage limits
CREATE OR REPLACE FUNCTION check_ai_usage_limit(
    p_user_id UUID,
    p_feature TEXT DEFAULT 'question_advisor'
)
RETURNS TABLE (
    can_use BOOLEAN,
    daily_remaining INTEGER,
    monthly_remaining INTEGER,
    reset_at TIMESTAMPTZ
) AS $$
DECLARE
    v_daily_limit INTEGER;
    v_monthly_limit INTEGER;
    v_daily_used INTEGER;
    v_monthly_used INTEGER;
    v_user_tier TEXT;
BEGIN
    -- Get user tier (default to free)
    v_user_tier := 'free';
    
    -- Get limits for tier
    SELECT daily_limit, monthly_limit INTO v_daily_limit, v_monthly_limit
    FROM ai_usage_limits
    WHERE tier = v_user_tier AND feature = p_feature;
    
    IF v_daily_limit IS NULL THEN
        v_daily_limit := 10;
        v_monthly_limit := 100;
    END IF;
    
    -- Get today's usage
    SELECT COALESCE(SUM(request_count), 0) INTO v_daily_used
    FROM ai_usage
    WHERE user_id = p_user_id 
      AND feature = p_feature 
      AND period_start = CURRENT_DATE;
    
    -- Get this month's usage
    SELECT COALESCE(SUM(request_count), 0) INTO v_monthly_used
    FROM ai_usage
    WHERE user_id = p_user_id 
      AND feature = p_feature 
      AND period_start >= DATE_TRUNC('month', CURRENT_DATE);
    
    RETURN QUERY SELECT 
        (v_daily_used < v_daily_limit AND v_monthly_used < v_monthly_limit) AS can_use,
        GREATEST(0, v_daily_limit - v_daily_used) AS daily_remaining,
        GREATEST(0, v_monthly_limit - v_monthly_used) AS monthly_remaining,
        (DATE_TRUNC('day', NOW()) + INTERVAL '1 day')::TIMESTAMPTZ AS reset_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record AI usage
CREATE OR REPLACE FUNCTION record_ai_usage(
    p_user_id UUID,
    p_feature TEXT DEFAULT 'question_advisor',
    p_tokens INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO ai_usage (user_id, feature, tokens_used, request_count, period_start)
    VALUES (p_user_id, p_feature, p_tokens, 1, CURRENT_DATE)
    ON CONFLICT (user_id, feature, period_start) 
    DO UPDATE SET 
        tokens_used = ai_usage.tokens_used + p_tokens,
        request_count = ai_usage.request_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment survey response count
CREATE OR REPLACE FUNCTION increment_survey_response()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE surveys 
    SET response_count = response_count + 1
    WHERE id = NEW.survey_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_survey_response
    AFTER INSERT ON survey_responses
    FOR EACH ROW EXECUTE FUNCTION increment_survey_response();

-- Function to update poll vote counts
CREATE OR REPLACE FUNCTION update_poll_votes()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_votes count
    UPDATE polls 
    SET total_votes = (
        SELECT COUNT(*) FROM poll_votes WHERE poll_id = NEW.poll_id
    )
    WHERE id = NEW.poll_id;
    
    -- Update individual option counts in JSONB
    UPDATE polls
    SET options = (
        SELECT jsonb_agg(
            opt || jsonb_build_object(
                'vote_count', 
                COALESCE((
                    SELECT COUNT(*) FROM poll_votes 
                    WHERE poll_id = NEW.poll_id 
                    AND opt->>'id' = ANY(option_ids)
                ), 0)
            )
        )
        FROM jsonb_array_elements(options) AS opt
    )
    WHERE id = NEW.poll_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_poll_votes
    AFTER INSERT OR DELETE ON poll_votes
    FOR EACH ROW EXECUTE FUNCTION update_poll_votes();

-- Update timestamp trigger for surveys
CREATE TRIGGER update_surveys_updated_at
    BEFORE UPDATE ON surveys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update timestamp trigger for dataset_analyses
CREATE TRIGGER update_dataset_analyses_updated_at
    BEFORE UPDATE ON dataset_analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
