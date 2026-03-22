-- Migration: Add data source provenance fields to polls and surveys
-- Created: 2026-03-21
-- Purpose: Allow creators to publicly disclose whether a poll/survey reflects
--          community-gathered data (first-hand accounts from SyriaHub members),
--          externally-sourced data (NGO reports, UN datasets, field research),
--          or a mix of both.  Displayed prominently to readers on all poll and
--          survey cards so consumers can evaluate credibility accordingly.

-- ── polls ──────────────────────────────────────────────────────────────────
ALTER TABLE polls
    ADD COLUMN IF NOT EXISTS data_source_type TEXT
        CHECK (data_source_type IN ('community', 'external', 'mixed')),
    ADD COLUMN IF NOT EXISTS data_source_label TEXT
        CHECK (char_length(data_source_label) <= 200);

COMMENT ON COLUMN polls.data_source_type IS
'Provenance of the poll data.
  community = responses collected from SyriaHub members (first-hand);
  external  = data imported from an outside source (NGO, UN, academic, etc.);
  mixed     = combination of both.
  NULL means not disclosed.';

COMMENT ON COLUMN polls.data_source_label IS
'Optional free-text describing the specific source, e.g. "UN OCHA field survey 2024".
 Max 200 characters.';

-- ── surveys ────────────────────────────────────────────────────────────────
ALTER TABLE surveys
    ADD COLUMN IF NOT EXISTS data_source_type TEXT
        CHECK (data_source_type IN ('community', 'external', 'mixed')),
    ADD COLUMN IF NOT EXISTS data_source_label TEXT
        CHECK (char_length(data_source_label) <= 200);

COMMENT ON COLUMN surveys.data_source_type IS
'Provenance of the survey data (same values as polls.data_source_type).';

COMMENT ON COLUMN surveys.data_source_label IS
'Optional free-text describing the specific source. Max 200 characters.';
