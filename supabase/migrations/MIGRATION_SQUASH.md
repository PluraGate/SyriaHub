# Migration Squash — January 2026

## What happened

179 individual migration files were squashed into a single baseline migration
(`00000000000000_baseline.sql`) on 2026-01-19.

The original files are preserved in `_archive/` for reference only.

## For existing deployments

If your Supabase project already has all 179 migrations applied, run this
command once to tell Supabase the new baseline is satisfied:

```bash
# Mark the old migrations as reverted and the baseline as applied
supabase migration repair --status reverted 20250101000000 20250101000001 ... # all old timestamps
supabase migration repair --status applied 00000000000000
```

Or, the quicker approach:

```sql
-- Run directly against your project's database
DELETE FROM supabase_migrations.schema_migrations;
INSERT INTO supabase_migrations.schema_migrations (version, statements)
VALUES ('00000000000000', ARRAY['-- baseline squash']);
```

## For fresh deployments

Simply run `supabase db push` — the single baseline file contains everything.

## Archive

The `_archive/` folder contains the original 179 migration files for historical
reference. They are git-ignored and never applied.
