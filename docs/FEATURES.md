# SyriaHub Platform Features

> **Last Updated:** December 24, 2024
> 
> A comprehensive summary of all features implemented in the SyriaHub research collaboration platform.

---

## 🏗️ Core Platform

### Authentication & Users
- **Invite-only signup** with role-specific invitation codes
- **Role system**: Admin, Moderator, Researcher, Member
- **Profile management** with avatar upload, bio, affiliation
- **Trust profiles** with reputation scoring

### Content Types
| Type | Description |
|------|-------------|
| **Article** | Long-form research posts with citations and markdown |
| **Question** | Community Q&A with accepted answers and voting |
| **Trace** | Collective memory artefacts (photos, documents, testimonies) |
| **Event** | Conferences, workshops, webinars with RSVP |
| **Resource** | Datasets, papers, tools, media with download tracking |

### Content Features
- **Markdown editor** with rich text toggle
- **Cover images** with upload/crop
- **Tagging system** with admin controls
- **License selection** (CC-BY, CC0, MIT, All Rights Reserved)
- **24-hour edit window** post-publish for transparency
- **Version history** with diff viewer
- **Forking/remixing** with attribution links
- **Citation backlinks** showing who cited your work

---

## 🔬 Research Lab

### Tools
| Tool | Description |
|------|-------------|
| **Multi-Source Search** | Internal + ReliefWeb + HDX + World Bank APIs |
| **AI Question Advisor** | OpenAI-powered research question refinement |
| **Polls** | Quick community voting instruments |
| **Surveys** | Professional multi-question research forms |
| **Statistics Tools** | Data visualization with Recharts |
| **Knowledge Graph** | Topic visualization with D3.js force layout |

### Research Gaps ("The Absence Model")
- Gap types: data, methodological, interpretive, population, regional, temporal
- Priority flagging and upvoting
- Claim system for researchers to work on gaps
- Links to posts that address gaps

---

## 🗺️ Spatial Engine

### Editor Features
- **Drawing tools**: Point, Circle, Polygon
- **Place search** via OpenStreetMap Nominatim
- **Radius slider** for circle regions
- **Pattern preview** - see flags while creating

### Pattern Detection (P1-P5)
| Pattern | Detection |
|---------|-----------|
| P1 Network Bottleneck | OSM Overpass API - road density analysis |
| P2 Service Mismatch | Reference data comparison |
| P3 Boundary Spill-over | Multi-governorate intersection |
| P4 Access Discontinuity | Administrative vs physical access |
| P5 Aid Activity | Nearby post clustering + humanitarian keywords |

### Post View
- **SpatialContextCard** with interactive map
- **Temporal range display** (e.g., "Jan 2023 – Dec 2024")
- **Awareness Flags** - dismissible, hedging language
- **Precedent cards** for related case studies

---

## 🎮 Gamification

- **XP rewards** for posting, commenting, answering, citations
- **Level progression** (1-100+)
- **Achievement badges** with categories
- **Profile display** of progress and badges
- **Activity feed** showing recent actions

---

## 📅 Events System

- **Event types**: Conference, Workshop, Webinar, Meetup
- **RSVP tracking**: Going, Maybe, Not Going
- **Organizer management**
- **Calendar export** (ICS format)
- **Location support**: Online, In-Person, Hybrid

---

## 👥 Groups

- **Public and private groups**
- **Invite-only membership**
- **Group chat** with real-time messaging
- **Shared files** and posts
- **Role management**: Admin, Moderator, Member

---

## 🔔 Notifications

- **Real-time notification center**
- **Types**: Comments, replies, mentions, follows, badges, system
- **Mark all read** functionality
- **Email digest** (configurable)
- **Push notifications** (PWA)

---

## 🔍 Search & Discovery

- **Full-text PostgreSQL search**
- **Advanced filters**: Content type, date range, author, tags
- **External API integration** for research sources
- **Search analytics** tracking queries
- **Trending posts** algorithm

---

## 📱 Mobile App / PWA

- **Installable PWA** with native-like experience
- **Offline support** via Service Worker
- **IndexedDB caching** for drafts and articles
- **Install prompt** (non-intrusive)
- **Offline indicator** badge

---

## 🌐 Internationalization

- **Languages**: English, Arabic
- **Full RTL support** for Arabic
- **900+ translation keys**
- **Locale-aware routing**
- **Date/number formatting**

---

## 🛡️ Moderation & Trust

### Content Moderation
- **Admin review queue**
- **Rejection with reason**
- **Appeals system** with revision requests
- **Jury panel** for complex cases

### AI-Powered
- **Plagiarism detection** (semantic embeddings + pgvector)
- **Auto-flag** for high-similarity matches (>85%)
- **Moderation AI** for content analysis

---

## ♿ Accessibility

- **WCAG 2.1 AA compliance**
- **Focus traps** for modals/dialogs
- **Reduced motion** support
- **Semantic HTML** throughout
- **Screen reader** friendly

---

## 📊 Analytics

- **Researcher dashboard** at `/analytics`
- **Metrics**: Views, votes, publications, citations, followers
- **Trend charts** (7/14/30/90 day periods)
- **Top content** ranking
- **Academic impact score**

---

## 🔧 Infrastructure

### Testing
- **Unit tests** with Vitest
- **E2E tests** with Playwright
- **Component tests** with React Testing Library

### Monitoring
- **Sentry integration** for error tracking
- **Vercel Analytics** for performance
- **Structured logging** hooks

### Security
- **API rate limiting** on critical endpoints
- **CAPTCHA** (Cloudflare Turnstile) on auth forms
- **GDPR data export** (BibTeX, RIS, JSON, Markdown)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `README.md` | Getting started, tech stack, roadmap |
| `API_DOCUMENTATION.md` | Full API reference |
| `MODERATION_DOCUMENTATION.md` | AI moderation setup |
| `docs/USER_GUIDE.md` | User walkthrough |
| `docs/system_gap_analysis.md` | System status tracking |
| `docs/feature-roadmap.md` | Phased module overview |
| `docs/SPATIAL_PATTERN_PHILOSOPHY.md` | Spatial engine design |

---

## 🗂️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + pgvector)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS
- **AI**: OpenAI API (GPT-4, embeddings)
- **Maps**: Leaflet + OpenStreetMap
- **Charts**: Recharts, D3.js
- **Testing**: Vitest, Playwright
- **Hosting**: Vercel
