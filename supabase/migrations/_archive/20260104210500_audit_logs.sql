-- Audit Logs Table
-- Stores security-critical events for forensic analysis

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What happened
    action TEXT NOT NULL,  -- e.g., 'login_success', 'password_changed', 'content_flagged'
    category TEXT NOT NULL DEFAULT 'general',  -- 'auth', 'moderation', 'admin', 'data'
    
    -- Who did it
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Details
    metadata JSONB DEFAULT '{}',  -- action-specific data
    
    -- When
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_category ON audit_logs(category);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Composite index for time-range queries by user
CREATE INDEX idx_audit_logs_user_time ON audit_logs(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
    ON audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'moderator')
        )
    );

-- Service role (backend) can insert logs
CREATE POLICY "Service role can insert audit logs"
    ON audit_logs
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Also allow authenticated users to insert (for client-side logging)
CREATE POLICY "Authenticated users can insert own audit logs"
    ON audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- No one can update or delete audit logs (immutable)
-- This is enforced by NOT having UPDATE or DELETE policies

COMMENT ON TABLE audit_logs IS 'Immutable security audit log for forensic analysis';
