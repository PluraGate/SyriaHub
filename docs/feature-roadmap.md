# Feature Roadmap

This roadmap outlines the next feature modules and how to integrate them with minimal disruption. Each phase intentionally keeps dependencies lean and supports incremental rollout, with clear handoff points for design, frontend, backend, and ops.

## Guiding Architectural Principles
- Favor composition over tight coupling so each module can ship independently.
- Introduce feature flags and gradual rollout toggles for every major capability.
- Keep third-party dependencies optional; prefer native platform tooling or existing services.
- Document all migrations and configuration changes alongside the code for reproducibility.

## Phased Module Overview

| Phase | Focus | Key Outcomes |
| --- | --- | --- |
| 0 | Shared groundwork | Localization hooks, audit logging, feature flag scaffolding |
| 1 | Localization (i18n) | Bilingual UI and content workflows |
| 2 | Forum / Q&A | Threaded discussions, moderation-friendly schemas |
| 3 | AI Plagiarism Detection | Plagiarism service integration with review queue |
| 4 | Private Groups / Invitations | Private communities with invitation flows |
| 5 | Content Versioning & Diff | Revision history, diff views, rollback tooling |

---

## Localization (Arabic / English)
- **Incremental adoption**
  - Phase 0: Extract literals into reusable translation keys and load default locale via Next.js internationalized routing.
  - Phase 1: Layer in Arabic translations feature-flagged per user profile. Allow fallback to English.
  - Phase 2: Enable locale-specific SEO assets (sitemap entries, metadata) and localized emails.
- **Key workstreams**
  - Introduce `i18n` utilities in `lib/` without new runtime dependencies (use built-in `next-intl` or similar lightweight solution once vetted).
  - Add locale column to user profile preferences (schema change documented in `schema-migrations.md`).
  - Ensure moderation copy supports bilingual responses.
- **Dependencies / integrations**
  - Avoid large translation libraries initially; rely on JSON resource bundles committed to the repo.
  - Optional later integration with translation management platform via API adapter.

## Forum / Q&A Module
- **Incremental adoption**
  - Phase 1: Read-only listing powered by existing posts schema (e.g., flag posts as `type = "question"`).
  - Phase 2: Enable answers and comments with vote tracking, keeping separation from article content.
  - Phase 3: Launch reputation badges and moderation escalation workflows.
- **Key workstreams**
  - Reuse current `posts` table by adding enumerated `content_type` and `status` fields.
  - Implement question-specific components under `app/forum/` with shared UI primitives.
  - Extend Supabase Row Level Security (RLS) policies to cover new interactions.
- **Dependencies / integrations**
  - Stick to Supabase functions or webhooks; defer any new queue/worker infra unless metrics require it.

## AI Plagiarism Detection
- **Incremental adoption**
  - Phase 1: Manual plagiarism checks triggered by moderators, stored as review events.
  - Phase 2: Automatic scanning webhook on submission using a lightweight external API.
  - Phase 3: Inline feedback surfaced to authors with override workflow.
- **Key workstreams**
  - Create service abstraction in `lib/ai/` (pure TypeScript) so provider swaps are isolated.
  - Store plagiarism scores in dedicated table; associate with `post_version_id` for future versioning alignment.
  - Queue suspicious content for human review within moderation dashboard.
- **Dependencies / integrations**
  - Use HTTP-based API clients only; avoid SDK bloat. Prefer fetch-based adapters.
  - Cache responses via existing Supabase storage or simple KV table until volume justifies more.

## Private Groups / Invitations
- **Incremental adoption**
  - Phase 1: Private tags that gate visibility (no new UI chrome yet).
  - Phase 2: Full groups with membership management and invite emails.
  - Phase 3: Group-scoped moderation settings and analytics.
- **Key workstreams**
  - Add `groups` table and membership join table (`group_members`).
  - Extend access checks in API routes (`app/api/posts`, `app/api/comments`) to respect group membership.
  - Add lightweight invitation service using signed Supabase tokens.
- **Dependencies / integrations**
  - Reuse Supabase Auth for invitation acceptance flows.
  - Use existing email provider configuration; no new vendor footprint initially.

## Content Versioning & Diff View
- **Incremental adoption**
  - Phase 1: Track versions on publish (auto-created snapshots).
  - Phase 2: Author-visible history with revert option.
  - Phase 3: Side-by-side diff view and moderation comparison tools.
- **Key workstreams**
  - Introduce `post_versions` table and link to moderation audit trail.
  - Implement diff utility in `lib/versioning/` using existing diff algorithms (e.g., `diff` npm package if acceptable size) or custom minimal implementation.
  - Update editor workflow to save drafts vs. published versions cleanly.
- **Dependencies / integrations**
  - Prefer minimal diff library (<50kb). If none suitable, implement simple character/paragraph diff bespoke.
  - Avoid full CMS dependencies; maintain current Next.js rendering pipeline.

## Cross-Cutting Tasks
- Expand automated tests: per module add unit tests in `lib/`, integration tests in `app/api/`, and Cypress/Playwright smoke tests once infrastructure is stable.
- Extend observability with structured logging hooks for new services; keep console fallback until metrics stack is finalized.
- Update `CHANGELOG.md` and `/docs/schema-migrations.md` alongside feature releases to preserve traceability.
- Maintain env-based feature toggles (`NEXT_PUBLIC_FEATURE_*`) so each module can ship behind gradual rollout flags.
