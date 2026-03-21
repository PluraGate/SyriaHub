-- Migration: Database security hardening
-- Created: 2026-03-21
--
-- 1. Revoke email column SELECT from API roles (anon, authenticated).
--    The public.users table has a broad "Anyone can view user profiles"
--    RLS policy (USING (true)) which is necessary for foreign-key joins in
--    PostgREST, but that policy grants access to the full row including the
--    email column.  Postgres column-level privileges allow us to strip email
--    from SELECT for those roles without touching RLS or breaking joins.
--
--    • service_role (used by admin API routes and Supabase internals) is
--      unaffected and retains full access.
--    • Any code that needs to show a user their own email should use
--      supabase.auth.getUser() which reads from auth.users, not public.users.
--    • The INSERT and UPDATE privileges on the email column are unaffected,
--      so user registration and profile updates continue to work.
--
-- 2. Add indices for the new data_source_type columns added in 20260321000001.
--
-- 3. Documents that require_turnstile enforcement is at the API layer
--    (see app/api/polls/[id]/vote and app/api/surveys/[id]/respond).

BEGIN;

-- ── 1. Column-level email security ─────────────────────────────────────────

-- Revoke SELECT on the email column for the two API-facing roles.
-- PostgREST automatically excludes columns a role cannot SELECT, so
-- this protects against both direct table queries and wildcard selects.
REVOKE SELECT (email) ON public.users FROM anon, authenticated;

-- ── 2. Indices for data_source_type ────────────────────────────────────────

-- Polls are often filtered/displayed by data source type, so index it.
CREATE INDEX IF NOT EXISTS idx_polls_data_source_type
    ON polls(data_source_type)
    WHERE data_source_type IS NOT NULL;

-- Surveys likewise.
CREATE INDEX IF NOT EXISTS idx_surveys_data_source_type
    ON surveys(data_source_type)
    WHERE data_source_type IS NOT NULL;

-- ── 3. Confirm Turnstile schema is in place ─────────────────────────────────
-- require_turnstile was added in migration 20260103000002.
-- Enforcement in the authenticated vote/respond routes is handled at the
-- API layer (app/api/polls/[id]/vote/route.ts and
-- app/api/surveys/[id]/respond/route.ts).
-- This comment documents the contract; no DDL change needed here.

COMMIT;
