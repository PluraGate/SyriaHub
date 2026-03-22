-- Migration: Epistemological architecture improvements
-- Created: 2026-03-21
--
-- Changes:
--
-- 1. posts.perspective_type
--    Captures the structural position of the author relative to the documented events.
--    Distinct from institutional affiliation (T1). Allows readers to interpret claims
--    with appropriate context — an insider-affected account carries different epistemic
--    weight than an outsider-researcher analysis of the same event. Optional field.
--
-- 2. gap_contributions.contribution_type: add 'challenge_framing'
--    Allows researchers to formally dispute the framing or existence of a gap,
--    not just suggest resources or collaborate. Recorded as a contribution so it
--    is visible and attributed, not anonymous criticism.
--
-- 3. trust_profiles: T4 temporal decay columns
--    t4_decay_rate: Phase-aware decay rate per day. Different phases have different
--    rates — active_conflict data decays in weeks; pre_conflict archival data is
--    essentially permanent. Null = rate not yet computed.
--    t4_computed_at: Timestamp of last T4 score computation. Enables scheduled
--    re-computation without touching all records.
--
-- 4. trust_profiles: T5 source independence flag
--    t5_sources_independent: Explicit flag for whether corroborating sources have
--    been verified as independent (not all citing the same single original).
--    Null = unknown / not verified. Addresses the citogenesis risk.
--
-- 5. calculate_t4_decay_score() function
--    Computes a decayed T4 score from initial score, data_timestamp, conflict_phase,
--    and is_time_sensitive. Uses exponential decay with phase-specific half-lives.
--
--    Half-lives by phase:
--      pre_conflict          → ~7000 days (archival material essentially permanent)
--      active_conflict       → ~200 days  (field data stales fast during conflict)
--      de_escalation         → ~600 days
--      early_reconstruction  → ~1000 days
--      active_reconstruction → ~2000 days
--
--    Floor at 10: data retains minimal epistemic value even when very old.
--    If not time-sensitive: decay rate is 10% of phase rate.
--
-- 6. get_t4_decay_rate() helper function
--    Returns the decay rate per day for a given conflict phase and sensitivity flag.

BEGIN;

-- ── 1. posts.perspective_type ────────────────────────────────────────────────

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS perspective_type TEXT
    CHECK (perspective_type IN (
      'insider_affected',     -- Directly experienced / affected by the events
      'insider_professional', -- Syrian professional working in-country
      'outsider_researcher',  -- External academic or researcher
      'institutional',        -- Institutional / organisational voice (UN, NGO, govt)
      'diaspora'              -- Syrian diaspora perspective
    ));

COMMENT ON COLUMN posts.perspective_type IS
  'Structural position of the author relative to the documented events. '
  'Distinct from T1 institutional affiliation. Optional; set by author at submission. '
  'Enables readers to interpret claims with appropriate standpoint context.';

-- ── 2. gap_contributions.contribution_type: add challenge_framing ────────────

-- DROP and recreate the CHECK constraint to include the new value.
-- The constraint name in the baseline is gap_contributions_contribution_type_check.
ALTER TABLE gap_contributions
  DROP CONSTRAINT IF EXISTS gap_contributions_contribution_type_check;

ALTER TABLE gap_contributions
  ADD CONSTRAINT gap_contributions_contribution_type_check
    CHECK (contribution_type IN (
      'reading_suggestion',   -- Suggest a relevant resource or paper
      'collaboration_offer',  -- Offer to collaborate on addressing the gap
      'methodological_note',  -- Note on approach or methodology
      'data_pointer',         -- Point to an available dataset or evidence
      'challenge_framing'     -- Dispute the framing or existence of the gap itself
    ));

COMMENT ON COLUMN gap_contributions.contribution_type IS
  'reading_suggestion: suggest a resource. '
  'collaboration_offer: offer to work on it. '
  'methodological_note: note on approach. '
  'data_pointer: point to available data. '
  'challenge_framing: dispute the gap framing or whether the gap exists.';

-- ── 3. trust_profiles: T4 temporal decay columns ─────────────────────────────

ALTER TABLE trust_profiles
  ADD COLUMN IF NOT EXISTS t4_decay_rate NUMERIC(10,8) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS t4_computed_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN trust_profiles.t4_decay_rate IS
  'Phase-aware exponential decay rate per day. '
  'Derived from t4_conflict_phase and t4_is_time_sensitive. '
  'NULL means not yet computed. Used by calculate_t4_decay_score().';

COMMENT ON COLUMN trust_profiles.t4_computed_at IS
  'When the T4 score was last computed via the decay function. '
  'Enables incremental re-computation without touching all rows.';

-- ── 4. trust_profiles: T5 source independence flag ───────────────────────────

ALTER TABLE trust_profiles
  ADD COLUMN IF NOT EXISTS t5_sources_independent BOOLEAN DEFAULT NULL;

COMMENT ON COLUMN trust_profiles.t5_sources_independent IS
  'Whether the corroborating sources counted in t5_corroborating_count have been '
  'verified as genuinely independent (not all ultimately derived from one original). '
  'NULL = unknown / not verified. TRUE = verified independent. FALSE = citogenesis risk flagged. '
  'Addresses the manufactured-consensus problem in T5 scoring.';

CREATE INDEX IF NOT EXISTS idx_trust_profiles_t5_independent
  ON trust_profiles(t5_sources_independent)
  WHERE t5_sources_independent IS NOT NULL;

-- ── 5. Helper: get_t4_decay_rate() ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_t4_decay_rate(
  p_conflict_phase conflict_phase,
  p_is_time_sensitive BOOLEAN
)
RETURNS NUMERIC(10,8)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_base_rate NUMERIC(10,8);
BEGIN
  -- Base decay rates derived from target half-lives:
  -- rate = ln(2) / half_life_days
  --   pre_conflict          7000 days → 0.00009902
  --   active_conflict        200 days → 0.00346574
  --   de_escalation          600 days → 0.00115525
  --   early_reconstruction  1000 days → 0.00069315
  --   active_reconstruction 2000 days → 0.00034657
  v_base_rate := CASE p_conflict_phase
    WHEN 'pre_conflict'          THEN 0.00009902
    WHEN 'active_conflict'       THEN 0.00346574
    WHEN 'de_escalation'         THEN 0.00115525
    WHEN 'early_reconstruction'  THEN 0.00069315
    WHEN 'active_reconstruction' THEN 0.00034657
    ELSE                              0.00069315  -- Default: early_reconstruction rate
  END;

  -- Non-time-sensitive data decays at 10% of the phase rate
  IF p_is_time_sensitive IS FALSE THEN
    v_base_rate := v_base_rate * 0.1;
  END IF;

  RETURN v_base_rate;
END;
$$;

COMMENT ON FUNCTION get_t4_decay_rate(conflict_phase, BOOLEAN) IS
  'Returns the exponential decay rate per day for a given conflict phase and sensitivity. '
  'Rate = ln(2) / half_life_days. Non-time-sensitive data uses 10% of the phase rate.';

-- ── 6. Core: calculate_t4_decay_score() ──────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_t4_decay_score(
  p_initial_score INT,
  p_data_timestamp TIMESTAMPTZ,
  p_conflict_phase conflict_phase,
  p_is_time_sensitive BOOLEAN
)
RETURNS INT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_days_elapsed NUMERIC;
  v_rate NUMERIC(10,8);
  v_decayed NUMERIC;
  v_floor INT := 10;
BEGIN
  -- If no timestamp, return the initial score unchanged
  IF p_data_timestamp IS NULL THEN
    RETURN p_initial_score;
  END IF;

  v_days_elapsed := EXTRACT(EPOCH FROM (now() - p_data_timestamp)) / 86400.0;

  -- Timestamps in the future or within 1 day: no decay
  IF v_days_elapsed < 1 THEN
    RETURN p_initial_score;
  END IF;

  v_rate    := get_t4_decay_rate(p_conflict_phase, p_is_time_sensitive);
  v_decayed := p_initial_score * exp(-v_rate * v_days_elapsed);

  -- Floor at 10: data never reaches zero epistemic value
  RETURN GREATEST(ROUND(v_decayed)::INT, v_floor);
END;
$$;

COMMENT ON FUNCTION calculate_t4_decay_score(INT, TIMESTAMPTZ, conflict_phase, BOOLEAN) IS
  'Computes a phase-aware exponentially decayed T4 temporal score. '
  'score(t) = initial × e^(−rate × days). Floor is 10 (data never fully expires). '
  'Called when displaying trust profiles; the stored t4_temporal_score is the '
  'baseline set by a human or the system — this function computes the live value.';

-- ── 7. Convenience: refresh_t4_score() ───────────────────────────────────────
-- Updates t4_temporal_score, t4_decay_rate, and t4_computed_at for one row.

CREATE OR REPLACE FUNCTION refresh_t4_score(p_trust_profile_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_row trust_profiles%ROWTYPE;
  v_new_score INT;
  v_rate NUMERIC(10,8);
BEGIN
  SELECT * INTO v_row FROM trust_profiles WHERE id = p_trust_profile_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Only compute if we have a data timestamp and conflict phase
  IF v_row.t4_data_timestamp IS NULL OR v_row.t4_conflict_phase IS NULL THEN
    RETURN;
  END IF;

  v_rate      := get_t4_decay_rate(v_row.t4_conflict_phase, v_row.t4_is_time_sensitive);
  v_new_score := calculate_t4_decay_score(
    v_row.t4_temporal_score,
    v_row.t4_data_timestamp,
    v_row.t4_conflict_phase,
    v_row.t4_is_time_sensitive
  );

  UPDATE trust_profiles
  SET
    t4_temporal_score = v_new_score,
    t4_decay_rate     = v_rate,
    t4_computed_at    = now()
  WHERE id = p_trust_profile_id;
END;
$$;

COMMENT ON FUNCTION refresh_t4_score(UUID) IS
  'Recomputes and persists t4_temporal_score for a single trust_profiles row. '
  'Intended for scheduled jobs and manual admin refresh. '
  'Idempotent: safe to call repeatedly.';

COMMIT;
