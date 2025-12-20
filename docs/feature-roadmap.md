# Feature Roadmap

This roadmap outlines the SyriaHub feature modules and their current status. Each phase supports incremental rollout with clear handoff points.

## Guiding Architectural Principles

- Favor composition over tight coupling so each module can ship independently
- Introduce feature flags and gradual rollout toggles for every major capability
- Keep third-party dependencies optional; prefer native platform tooling
- Document all migrations and configuration changes alongside the code

---

## Current Status Overview

| Phase | Focus | Status | Notes |
|-------|-------|--------|-------|
| 0 | Shared Groundwork | ✅ Complete | Localization hooks, audit logging, feature flags |
| 1 | Localization (i18n) | ✅ Complete | English/Arabic with full translation coverage |
| 2 | Forum / Q&A | ✅ Complete | Questions, answers, voting, accepted answers |
| 3 | AI Plagiarism Detection | ✅ Complete | Semantic embeddings + pgvector + AI analysis |
| 4 | Private Groups / Invitations | ✅ Complete | Invite-only signup with role-based codes |
| 5 | Content Versioning & Diff | ✅ Complete | Full version history with diff viewer |
| 6 | Research Lab | ✅ Complete | Polls, surveys, AI advisor, multi-source search |
| 7 | Events System | ✅ Complete | Events, RSVP, calendar integration |
| 8 | Gamification | ✅ Complete | XP, levels, badges, achievements |
| 9 | Real-time Collaboration | ✅ Complete | Presence tracking in editor |
| 10 | Analytics Dashboard | ✅ Complete | Researcher analytics with trends |

---

## Completed Features

### ✅ Localization (Arabic / English)

- Full bilingual UI with 800+ translation keys
- RTL support for Arabic
- Locale-specific routing via `next-intl`
- Fallback to English for missing translations

### ✅ Forum / Q&A Module

- Posts can be `question` type with answer tracking
- Vote system (upvote/downvote)
- Accepted answer marking by question author
- Reputation badges tied to Q&A activity

### ✅ AI Plagiarism Detection

- Semantic similarity using OpenAI embeddings (`text-embedding-3-small`)
- pgvector for efficient similarity search
- AI-powered detailed analysis for high-similarity matches (>85%)
- Stores results in `plagiarism_checks` table
- Integrated into moderation workflow

### ✅ Private Groups / Invitations

- Invite-only signup system
- Role-specific invitation codes (member, researcher, moderator)
- Invite tracking and usage limits
- Admin invitation management dashboard

### ✅ Content Versioning & Diff View

- Automatic version snapshots on publish
- `post_versions` table with full content history
- Inline diff view comparing versions
- Restore/rollback capability
- Version history accessible from post menu

### ✅ Research Lab

| Tool | Description |
|------|-------------|
| Multi-Source Search | Internal + ReliefWeb + HDX + World Bank APIs |
| AI Question Advisor | Research question feedback and methodology suggestions |
| Polls | Quick community voting instruments |
| Surveys | Multi-question research forms with analytics |
| Statistics Tools | Data analysis and visualization |

### ✅ Events System

- Event creation with date/time/location
- Multiple event types (conference, workshop, webinar, meetup)
- RSVP tracking (going/maybe/not going)
- Calendar integration (export to ICS)
- Event search and filtering

### ✅ Gamification

- XP rewards for platform activities
- Level progression system
- Achievement badges
- Profile-visible progress
- Leaderboards (coming soon)

### ✅ Real-time Collaboration

- User presence tracking in editor
- See who's viewing/editing the same post
- Color-coded collaborator avatars
- Powered by Supabase Realtime

### ✅ Analytics Dashboard

- Researcher-specific analytics at `/analytics`
- Metrics: views, votes, publications, citations, followers, trust score
- Trend charts (7/14/30/90 day periods)
- Top performing content ranking

---

## Future Enhancements

### Internationalization Expansion

- [ ] Additional languages (French, Turkish)
- [ ] Locale-specific date/number formatting
- [ ] Translation coverage reporting dashboard

### Platform Improvements

- [ ] Leaderboards and public rankings
- [ ] Advanced collaboration (real-time co-editing)
- [ ] Mobile app (React Native or Flutter)
- [ ] Push notifications

### AI Enhancements

- [ ] AI-powered content summarization
- [ ] Automatic tag suggestions
- [ ] Smart citation recommendations
- [ ] Research question generation

---

## Cross-Cutting Infrastructure

### Documentation

| Document | Status |
|----------|--------|
| `README.md` | ✅ Updated |
| `API_DOCUMENTATION.md` | ✅ Complete |
| `MODERATION_DOCUMENTATION.md` | ✅ Complete |
| `docs/USER_GUIDE.md` | ✅ New |
| `docs/system_gap_analysis.md` | ✅ Current |
| `docs/feature-roadmap.md` | ✅ This document |

### Testing

- Unit tests in `lib/`
- Integration tests in `app/api/`
- E2E tests with Playwright (in progress)

### Observability

- Structured logging hooks
- Error tracking (console fallback until metrics stack finalized)
- Admin audit log for all moderation actions

### Feature Flags

- Environment-based toggles (`NEXT_PUBLIC_FEATURE_*`)
- Gradual rollout support
- Per-user feature gating (planned)

---

*Last updated: December 2024*
