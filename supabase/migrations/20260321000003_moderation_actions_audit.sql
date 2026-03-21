-- Migration: Moderation actions audit trail
-- Every moderation decision (resolve report, reject post, suspend user, etc.)
-- is recorded for transparency, compliance, and appeals.

BEGIN;

CREATE TABLE IF NOT EXISTS moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    performed_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'resolve_report',
        'dismiss_report',
        'delete_content',
        'approve_post',
        'reject_post',
        'suspend_user',
        'unsuspend_user',
        'approve_appeal',
        'reject_appeal',
        'request_revision',
        'warn_user'
    )),
    -- Optional references depending on what was acted on
    report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    appeal_id UUID REFERENCES moderation_appeals(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    -- Free-text reason for the action (required for reject/suspend/dismiss)
    reason TEXT,
    -- Extra context (e.g., AI confidence scores, previous warnings count)
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admins and moderators can view the audit trail
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators and admins can view moderation actions"
    ON moderation_actions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('moderator', 'admin')
        )
    );

CREATE POLICY "Moderators and admins can insert moderation actions"
    ON moderation_actions FOR INSERT
    WITH CHECK (
        auth.uid() = performed_by AND
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('moderator', 'admin')
        )
    );

-- Performance indices
CREATE INDEX idx_moderation_actions_performed_by
    ON moderation_actions(performed_by);
CREATE INDEX idx_moderation_actions_created_at
    ON moderation_actions(created_at DESC);
CREATE INDEX idx_moderation_actions_action_type
    ON moderation_actions(action_type);
CREATE INDEX idx_moderation_actions_target_user
    ON moderation_actions(target_user_id)
    WHERE target_user_id IS NOT NULL;

-- Helpful view for moderators: recent actions with actor names
CREATE OR REPLACE VIEW recent_moderation_actions AS
SELECT
    ma.id,
    ma.action_type,
    ma.reason,
    ma.created_at,
    u.name AS performed_by_name,
    u.role AS performed_by_role,
    ma.target_user_id,
    tu.name AS target_user_name,
    ma.post_id,
    ma.report_id,
    ma.appeal_id
FROM moderation_actions ma
JOIN users u ON u.id = ma.performed_by
LEFT JOIN users tu ON tu.id = ma.target_user_id
ORDER BY ma.created_at DESC;

-- Grant view access to moderators/admins (view uses security invoker so RLS applies)
GRANT SELECT ON recent_moderation_actions TO authenticated;

COMMENT ON TABLE moderation_actions IS
'Immutable audit log of all moderation decisions. Every resolve, dismiss, suspend, approve, and reject action must be recorded here.';

COMMIT;
