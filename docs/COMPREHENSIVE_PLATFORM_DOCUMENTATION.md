# SyriaHub Platform Comprehensive Documentation

**Version:** 0.8.0  
**Last Updated:** January 5, 2026

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Feature Categories](#2-feature-categories)
3. [User Roles & Authentication](#3-user-roles--authentication)
4. [Content Engine](#4-content-engine)
5. [Research Lab](#5-research-lab)
6. [Events System](#6-events-system)
7. [Gamification System](#7-gamification-system)
8. [Discovery & Search](#8-discovery--search)
9. [Moderation & Governance](#9-moderation--governance)
10. [Internationalization (i18n)](#10-internationalization-i18n)
11. [Progressive Web App (PWA)](#11-progressive-web-app-pwa)
12. [Technical Architecture](#12-technical-architecture)
13. [API Reference](#13-api-reference)
14. [Development & Deployment](#14-development--deployment)

---

## 1. Platform Overview

**SyriaHub** is a minimalist, mobile-first research platform designed to facilitate academic and humanitarian knowledge sharing for the Syrian context. Built with Next.js 14+, Supabase, and modern web technologies, it prioritizes epistemic diversity, academic integrity, and community governance.

### Core Mission

| Principle | Description |
|-----------|-------------|
| **Epistemic Diversity** | Break echo chambers by recommending diverse viewpoints |
| **Academic Integrity** | Support rigorous citations, peer review, and quality control |
| **Community Governance** | Empower users through role-based access and moderation |
| **Accessibility** | Full RTL support, WCAG 2.1 AA compliance, offline-first PWA |

### Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14+ (App Router), React 18, TypeScript |
| **Styling** | Tailwind CSS, Shadcn UI (Radix Primitives) |
| **Database** | Supabase (PostgreSQL 15), Row-Level Security |
| **AI Integration** | OpenAI API (GPT-4 for moderation & question analysis) |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **Deployment** | Vercel (Edge Runtime compatible) |

---

## 2. Feature Categories

### Core Platform
| Feature | Status | Description |
|---------|--------|-------------|
| Invite-Only Authentication | ✅ | Secure signup with invitation codes |
| Content Publishing | ✅ | Articles, Questions, Events with Markdown |
| User Profiles | ✅ | Dynamic profiles with gamification & research history |
| Tag System | ✅ | Organize content by categories |
| Comments & Replies | ✅ | Threaded discussions with reply-to |
| Citations & Forking | ✅ | Academic referencing with attribution |
| Notifications | ✅ | Real-time notification center |

### Research Tools
| Feature | Status | Description |
|---------|--------|-------------|
| AI Question Advisor | ✅ | OpenAI-powered research question refinement |
| Surveys | ✅ | Professional multi-question survey builder |
| Polls | ✅ | Quick community sentiment voting |
| Statistics Tools | ✅ | Data visualization with Recharts |
| Knowledge Graph | ✅ | Topic visualization with D3.js |
| Research Gaps | ✅ | "Absence Model" for identifying knowledge gaps |

### Infrastructure
| Feature | Status | Description |
|---------|--------|-------------|
| Full-text Search | ✅ | PostgreSQL-powered with advanced filters |
| PWA Support | ✅ | Offline-first with service workers |
| RTL Support | ✅ | Complete Arabic right-to-left layout |
| Dark Mode | ✅ | System preference and manual toggle |
| API Rate Limiting | ✅ | Protection against abuse |

---

## 3. User Roles & Authentication

### Invite-Only Signup Flow

1. **Invitation**: New users receive a unique code from existing Researchers or Admins
2. **Registration**: Email verification via Supabase Auth
3. **Onboarding**: 4-step wizard introduces platform features and values

### Role Hierarchy

| Role | Access Level | Key Privileges |
|------|--------------|----------------|
| **Member** | Basic | View content, comment, RSVP to events, follow users |
| **Researcher** | Standard | Publish articles/questions, create events, send invites (default for verified users) |
| **Moderator** | Elevated | Review reports, manage tags, resolve tickets, access Moderation Panel |
| **Admin** | Full | User management, role configuration, system settings, database logs |

### Invitation System

- Each verified user receives **5 invite credits**
- Credits replenish based on contribution milestones
- Invitation codes are single-use with tracking

---

## 4. Content Engine

### Supported Content Types

| Type | Purpose | Features |
|------|---------|----------|
| **Article** | Long-form research | Rich text, citations, forking, versioning |
| **Question** | Community Q&A | Answers, upvoting, accepted answers |
| **Resource** | Datasets & links | External API integration (HDX, ReliefWeb) |
| **Event** | Academic gatherings | RSVP, calendar integration, location |
| **Trace** | Collective memory | Photos, documents, oral testimonies |

### Editor Features

- **Markdown Support**: Full CommonMark compliance
- **Rich Text Toolbar**: Bold, italic, lists, quotes, code blocks
- **Tag System**: Verified (admin-managed) + custom tags
- **Citations**: Internal (`@PostID`) and external (DOI, URL)
- **Forking**: Build upon existing work with clear attribution
- **Version History**: Track changes with diff views

### Epistemic Metadata

| Field | Description |
|-------|-------------|
| Temporal Coverage | Start/end dates for research period |
| Spatial Coverage | Geographic region fields |
| Evidence Type | Primary/secondary classification |
| Trust Score | Calculated from citations and peer reviews |

---

## 5. Research Lab

A dedicated suite of tools for elevating research quality.

### AI Question Advisor

**Purpose**: Refine research questions for clarity, scope, and measurability.

**How it works**:
1. User inputs draft research question
2. OpenAI GPT-4 analyzes for:
   - Clarity and specificity
   - Scope appropriateness
   - Potential biases
   - Measurability
3. System provides specific refinement suggestions
4. Daily usage limits (10 queries per user)

### Polls

| Feature | Description |
|---------|-------------|
| Single/Multiple Choice | Support for various answer formats |
| Anonymous Voting | Optional privacy for respondents |
| Real-time Results | Live vote count updates |
| Author Controls | Close polls, delete, view analytics |

### Surveys

| Feature | Description |
|---------|-------------|
| Question Types | Single choice, multiple choice, short text, long text, scale (1-10), rating (stars), number, date |
| Logic Jumps | Conditional question display |
| Response Analytics | Charts and statistics |
| Export | CSV/JSON response data |

### Statistics Tools

- **Chart Builder**: Bar, line, pie, area charts
- **Statistical Calculator**: Mean, median, mode, standard deviation
- **Data Import**: From files (CSV/JSON), resources, surveys, polls

### Research Search Engine

- **Dual Sources**: Internal evidence space + open web
- **Filters**: Discipline, evidence type, temporal phase, trust score
- **Saved Searches**: Cache and restore previous queries
- **Citation Generation**: Auto-format references

---

## 6. Events System

### Event Creation

| Field | Description |
|-------|-------------|
| Title & Description | Event details with Markdown support |
| Date & Time | Start and end timestamps |
| Location | Physical address or virtual meeting link |
| Type | Conference, Workshop, Webinar, Other |

### RSVP System

| Status | Description |
|--------|-------------|
| Going | Confirmed attendance |
| Maybe | Tentative interest |
| Not Going | Declined |

### Calendar Integration

- **Google Calendar**: Add events directly
- **iCal/ICS Export**: Download for any calendar app
- **Reminder Emails**: Automatic notifications (when email configured)

---

## 7. Gamification System

### XP & Progression

| Action | XP Earned |
|--------|-----------|
| Publish article | +20 |
| Publish question | +15 |
| Receive upvote | +5 |
| Comment on content | +2 |
| Survey response | +1 |
| Detailed review | +50 |

### Level Tiers

| Tier | Levels | Perks |
|------|--------|-------|
| Bronze | 1-10 | Basic publishing |
| Silver | 11-25 | Additional invite credits |
| Gold | 26-40 | Featured author status |
| Platinum | 41-50 | Instant publish (skip moderation) |

### Badges & Achievements

- **Prolific Writer**: 50 published articles
- **Community Helper**: 100 answers given
- **Top Reviewer**: 20 content reviews
- **Event Host**: 10 events organized
- **Knowledge Architect**: 50 citations received

---

## 8. Discovery & Search

### Full-text Search

- **Engine**: PostgreSQL Full-Text Search (pg_search)
- **Filters**: Content type, date range, author, tags, discipline
- **Sorting**: Relevance, date, popularity

### Bias-Aware Recommendations

| Category | Purpose |
|----------|---------|
| Counter-Perspective | Opposing viewpoints |
| Unfamiliar Authors | Broaden source diversity |
| Underexplored Tags | Expand topic coverage |
| Different Methodology | Alternative research approaches |
| Temporal Diversity | Historical and recent content |

### External API Integration

| Source | Data Type |
|--------|-----------|
| ReliefWeb | Humanitarian reports |
| HDX | Humanitarian datasets |
| World Bank | Development indicators |

---

## 9. Moderation & Governance

### Multi-Layer Approach

| Layer | Method | Description |
|-------|--------|-------------|
| Layer 1 | AI Auto-Scan | OpenAI Moderation + Perspective API |
| Layer 2 | User Reporting | Community flagging with reasons |
| Layer 3 | Human Review | Moderator review with approve/edit/delete |
| Layer 4 | Appeals | Author can dispute decisions |

### Jury System

- **Community Review**: Trusted members vote on edge cases
- **Threshold**: Requires 3+ votes for decision
- **Appeal Override**: Super-majority can reverse decisions

### Trust Governance

| Component | Description |
|-----------|-------------|
| Trust Profiles | Author reliability metrics |
| Delegation System | Trusted members can delegate moderation power |
| Threshold Configuration | Admin-adjustable sensitivity levels |
| Audit Logs | Full history of moderation actions |

### Feedback System

| Type | Purpose |
|------|---------|
| Bug Report | Technical issues |
| Feature Request | New functionality suggestions |
| General Feedback | Platform improvement ideas |

---

## 10. Internationalization (i18n)

### Language Support

| Language | Status | Translation Keys |
|----------|--------|------------------|
| English | ✅ Complete | 900+ keys |
| Arabic | ✅ Complete | 900+ keys |
| French | 🔮 Planned | Future |
| Turkish | 🔮 Planned | Future |

### RTL Support

- **Automatic Detection**: Based on locale
- **Layout Mirroring**: CSS `dir="rtl"`
- **Logical CSS Properties**: `start`/`end` instead of `left`/`right`
- **Font Support**: Arabic typography optimization

### Translation Sections

```
Common, Navigation, Auth, Post, Editor, Profile, Landing,
Footer, Resources, Events, Groups, Notifications, Search,
Comments, Settings, Admin, ResearchLab, Trending, 
Recommendations, ResearchGaps, Onboarding, Errors, About,
Faq, Roles, Surveys, Polls, Feedback, TrustGovernance
```

---

## 11. Progressive Web App (PWA)

### Capabilities

| Feature | Status | Description |
|---------|--------|-------------|
| Installable | ✅ | Add to home screen on mobile/desktop |
| Offline Mode | ✅ | Access cached content without internet |
| Push Notifications | 🔮 Planned | Browser-based alerts |
| Background Sync | ✅ | Queue actions when offline |

### Service Worker Strategies

| Strategy | Used For |
|----------|----------|
| Cache-First | Static assets, fonts, icons |
| Network-First | API responses, dynamic content |
| Stale-While-Revalidate | Semi-static pages |

### Offline Storage

- **IndexedDB**: Drafts, cached articles
- **Cache API**: Static resources, API responses
- **LocalStorage**: User preferences, session state

---

## 12. Technical Architecture

### Database Schema (Core Tables)

| Table | Purpose |
|-------|---------|
| `users` | Extends auth.users with profile, XP, role |
| `posts` | Polymorphic content (articles, questions, events) |
| `comments` | Threaded discussions (Adjacency List) |
| `reports` | Moderation queue |
| `roles` | JSONB permission definitions |
| `citations` | Post-to-post references |
| `tags` | Content categorization |
| `feedback_tickets` | User-submitted issues |
| `research_gaps` | Knowledge gap tracking |
| `surveys` / `polls` | Research Lab data |
| `events` / `event_rsvps` | Event management |

### Security

| Layer | Protection |
|-------|------------|
| RLS | Row-Level Security on all tables |
| JWT | Token verification on protected routes |
| RBAC | Role-based API endpoint access |
| Rate Limiting | Request throttling per user/IP |

### Project Structure

```
├── app/
│   ├── [locale]/          # Internationalized routes
│   │   ├── admin/         # Admin panel pages
│   │   ├── auth/          # Authentication pages
│   │   ├── editor/        # Content editor
│   │   ├── events/        # Events system
│   │   ├── research-lab/  # Research tools
│   │   └── ...
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities & Supabase clients
├── messages/              # Translation files (en.json, ar.json)
├── supabase/migrations/   # Database migrations
└── tests/                 # Unit & E2E tests
```

---

## 13. API Reference

**Base URL**: `/api`

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/signup` | POST | Create account with invite code |
| `/auth/login` | POST | Exchange credentials for session |
| `/auth/logout` | POST | End session |

### Content
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/posts` | GET | List posts with filters |
| `/posts` | POST | Create new post |
| `/posts/:id` | GET | Get post details |
| `/posts/:id` | PUT | Update post |
| `/posts/:id` | DELETE | Delete post |

### Research Lab
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/surveys` | GET/POST | Manage surveys |
| `/surveys/:id/respond` | POST | Submit survey response |
| `/polls` | GET/POST | Manage polls |
| `/polls/:id/vote` | POST | Cast vote |
| `/question-advisor` | POST | AI question analysis |

### Events
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/events` | GET/POST | Manage events |
| `/events/:id/rsvp` | POST | RSVP to event |

### Moderation
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/reports` | GET/POST | Manage reports |
| `/reports/:id` | PATCH | Update report status |
| `/appeals` | GET/POST | Manage appeals |

---

## 14. Development & Deployment

### Local Setup

```bash
# Clone repository
git clone https://github.com/lAvArt/SyriaHub.git
cd SyriaHub

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Setup database
cd supabase && ./setup.ps1  # Windows
cd supabase && ./setup.sh   # macOS/Linux

# Start development server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `OPENAI_API_KEY` | ⚠️ | For AI moderation (optional) |

### Testing

```bash
# Unit tests
npm run test:unit

# E2E tests (Playwright)
npx playwright test

# Lint & type check
npm run lint && npm run typecheck
```

### Deployment (Vercel)

1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Push to `main` for production deploy
4. Preview deployments auto-created for PRs

---

## Future Roadmap

| Feature | Status | Priority |
|---------|--------|----------|
| Real-time Collaboration | 🔮 Planned | High |
| Additional Languages | 🔮 Planned | Medium |
| Native Mobile Apps | 🔮 Planned | Low |
| Advanced Analytics | 🔮 Planned | Medium |

---

**Documentation maintained by the SyriaHub development team.**
