# Planned Schema Migrations

This log tracks upcoming database changes for the roadmap items. Each migration should map to a Supabase SQL file under `supabase/migrations/` and be cross-referenced in module-specific docs.

## Conventions
- Use timestamped filenames (`YYYYMMDDHHMMSS_description.sql`) to maintain ordering.
- Document breaking changes and data backfill steps here before executing migrations.
- After applying, move the entry to `MIGRATION_COMPLETE.md` with execution details.

## Migration Backlog

### Localization Preferences
- **Migration file**: `20251110090000_add_preferred_locale_to_users.sql`
- **Tables / columns**: Add `preferred_locale` to `users` (enum: `en`, `ar`).
- **Default handling**: Backfill existing users as `en` then set `NOT NULL`.
- **Rollback**: Drop column; ensure default view falls back to `en`.

### Forum / Q&A Enhancements
- **Migration file**: `20251110090500_update_posts_for_forum_module.sql`
- **Tables / columns**: Add `content_type` (enum: `article`, `question`, `answer`) and `status` to `posts`.
- **Supporting tables**: Create `post_votes` table for up/down votes with unique `(user_id, post_id)` constraint.
- **Policies**: Extend RLS to allow question authors edit window of 30 minutes.

### Content Versioning
- **Migration file**: `20251110091500_create_post_versions.sql`
- **Tables**: Create `post_versions` capturing `post_id`, content snapshot, metadata (editor, comment, plagiarism score foreign key).
- **Triggers**: On update of `posts`, insert snapshot into `post_versions`.
- **Diff metadata**: Optional `diff_from_previous` JSON column for quick rendering caches.

### AI Plagiarism Records
- **Migration file**: `20251110092000_create_plagiarism_checks.sql`
- **Tables**: Create `plagiarism_checks` table linked to `post_version_id` with score, provider, and `flagged` boolean.
- **Indexes**: Composite index on `(post_version_id, created_at)` for review queries.
- **Retention**: Schedule Supabase cron to purge records older than 2 years (config TBD).

### Private Groups & Invitations
- **Migration file**: `20251110091000_create_groups_and_invitations.sql`
- **Tables**: Add `groups`, `group_members`, and `group_invitations`.
- **Constraints**: Use foreign keys to `users` and cascade deletes thoughtfully (keep audit history).
- **Policies**: RLS policy to restrict read access to members; allow admins to manage invites.

## Pending Research
- Evaluate whether Supabase `pg_net` or external webhook service should handle plagiarism provider callbacks.
- Validate storage impact of `post_versions` and tune retention strategy before prod rollout.
