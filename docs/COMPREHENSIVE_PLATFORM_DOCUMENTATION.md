# SyriaHub Platform Comprehensive Documentation

**Version:** 1.0.0
**Last Updated:** December 20, 2025

---

## 1. Platform Overview

**SyriaHub** is a minimalist, mobile-first research platform designed to facilitate academic and humanitarian knowledge sharing for the Syrian context. It is built to foster epistemic diversity, ensure high-quality content through AI and community moderation, and reward contributions via a robust gamification system.

### Core Mission
To create a decentralized, resilient, and accessible knowledge hub that prioritizes:
1.  **Epistemic Diversity**: Breaking echo chambers by recommending diverse viewpoints.
2.  **Academic Integrity**: Supporting rigorous citations, peer review workflows, and plagiarism checks.
3.  **Community Governance**: Empowering users through role-based access and moderation tools.

---

## 2. User Experience & Features

### 2.1 Authentication & Roles

The platform operates on a secure, invite-only basis to maintain community quality.

#### Signup Flow
1.  **Invitation**: New users must receive a unique invitation code from an existing Researcher or Admin.
2.  **Verification**: Email verification is mandatory via Supabase Auth.
3.  **Onboarding**: A 4-step wizard guides users through profile setup and introduces the platform's core values.

#### User Roles & Permissions
| Role | Access Level | Responsibilities & Privileges |
| :--- | :--- | :--- |
| **Member** | Basic | Can view content, comment, RSVP to events, and follow users. Cannot publish articles. |
| **Researcher** | Standard | **Default for verified users.** Can publish articles, questions, resources, create events, and invite new members. |
| **Moderator** | Elevated | Can review reported content, manage tags, resolve tickets, and access the Moderation Panel. |
| **Admin** | Full | Full system access: User management, Role configuration, System settings, and Database logs. |

### 2.2 Content Engine

The content engine is the heart of SyriaHub, supporting multiple formats with academic rigour.

#### Supported Content Types
*   **Articles**: Long-form research papers with rich text and media support.
*   **Questions**: Community Q&A designed for academic inquiry.
*   **Resources**: Shared datasets, PDFs, or external links (e.g., HDX, ReliefWeb).
*   **Events**: Conferences, webinars, and workshops (see Section 2.4).

#### Editor Features
*   **Markdown Support**: Full CommonMark compliance for distraction-free writing.
*   **Rich Text Toolbar**: Formatting options (Bold, Italic, Lists, Quotes) for non-technical users.
*   **Tagging System**:
    *   **Verified Tags**: Managed by admins (e.g., "Public Health", "Economy").
    *   **Custom Tags**: User-generated tags for niche topics.
*   **Citations**:
    *   **Internal**: Link existing SyriaHub posts using `@PostID` syntax.
    *   **External**: DOI and URL support with automatic metadata fetching.
*   **Forking**: Users can "fork" an existing article to build upon its research, maintaining a clear attribution chain ("Based on work by [Author]").

### 2.3 Research Lab

A suite of tools designed to elevate the standard of inquiry.

*   **AI Question Advisor**:
    *   **Function**: Users input a draft research question.
    *   **Logic**: OpenAI GPT-4 analyzes the question for clarity, scope, and bias, offering specific refinements.
*   **Polls & Surveys**:
    *   **Polls**: Single-question voting for quick community sentiment.
    *   **Surveys**: Multi-page forms with logic jumps for in-depth data collection.
*   **Knowledge Graph**:
    *   **Visualization**: Interactive D3.js force-directed graph showing connections between related articles, tags, and authors.
*   **Statistical Tools**:
    *   **Integration**: Built-in Recharts library to visualize dataset uploads (CSV/JSON).

### 2.4 Events System

A dedicated system for academic and community coordination.

*   **Creation**: Researchers can schedule events with physical locations or virtual links.
*   **RSVP Management**:
    *   Statuses: `Going`, `Not Going`, `Maybe`.
    *   Limits: Organizers can set attendee caps.
*   **Calendar**: Integration with Google Calendar and iCal (ICS export).

### 2.5 Gamification

A psychology-based reward system to encourage constructive participation.

#### XP & Progression
*   **XP Sources**: Publishing (+20), Commenting (+2), Upvotes Received (+5), Detailed Reviews (+50).
*   **Levels**: 1-50 scale.
    *   **Tiers**: Bronze (1-10), Silver (11-25), Gold (26-40), Platinum (41-50).

#### Rewards
*   **Badges**: Visual awards for milestones (e.g., "Prolific Writer" for 50 posts).
*   **Trust Score**: A hidden metric tailored by peer reviews and successful citations. High trust scores unlock "Instant Publish" privileges (bypassing moderation queue).

### 2.6 Discovery & Search

*   **Engine**: PostgreSQL Full-Text Search (pg_search).
*   **Filters**: Advanced filtering by Date, Author, Tag, Discipline, and Content Type.
*   **Bias-Aware Recommendations**:
    *   **Algorithm**: Deliberately boosts content from diverse authors and opposing viewpoints based on the user's reading history to counter "filter bubbles".
    *   **Privacy**: Uses session-bounded context; recommendation history is not permanently stored.

---

## 3. Technical Architecture

### 3.1 Technology Stack
*   **Frontend**: Next.js 14 (App Router), React, TypeScript.
*   **Styling**: Tailwind CSS, Shadcn UI (Radix Primitives).
*   **Backend / DB**: Supabase (PostgreSQL 15), Edge Functions.
*   **State Management**: React Query (server state), Zustand (client state).
*   **AI**: OpenAI API (Moderation, Question Advisor).

### 3.2 Database Schema
The database works on a relational model enforced by Foreign Keys.

#### Core Tables
1.  `users`: Extends `auth.users`. Stores profile data, XP, and roles.
2.  `posts`: Stores content. Polymorphic `type` column handles Articles, Questions, and Events.
3.  `comments`: Threaded discussions (Adjacency List model).
4.  `reports`: Moderation queue linking to posts/comments + reporter ID.
5.  `roles`: JSONB-based permission definitions.
6.  `citations`: Many-to-Many link between posts (Source -> Target).
7.  `tags`: Categorization taxonomy.
8.  `feedback_tickets`: User-submitted issues and suggestions.

### 3.3 Security
*   **RLS (Row Level Security)**: strict policies enabled on ALL tables.
    *   *Example*: `posts` are viewable by `public`, but editable only by `auth.uid() == author_id`.
*   **Middleware**: Next.js Middleware verifies JWTs on protected routes (`/admin`, `/editor`).

### 3.4 Internationalization (i18n)
*   **Support**: Full English (`en`) and Arabic (`ar`) support.
*   **RTL**: Automatic layout mirroring for Arabic locale (CSS `dir="rtl"`).
*   **Dictionaries**: JSON-based key-value stores in `/messages`.

---

## 4. Advanced Systems

### 4.1 Moderation System
A hybrid AI + Human approach.

*   **Layer 1: AI Auto-Scan**:
    *   Every post/comment is sent to OpenAI Moderation API & Perspective API.
    *   **Flagged Content**: Automatically hidden and added to the `reports` queue with an "Auto-Flagged" status.
*   **Layer 2: User Reporting**:
    *   Users can flag content. Reason is required.
*   **Layer 3: Human Review**:
    *   Moderators access the Admin Panel to `Approve`, `Edit`, or `Delete` content.
    *   **Appeals**: Authors can appeal moderation decisions via a dedicated dashboard.
*   **Plagiarism Detection**:
    *   System computes vector embeddings of new content.
    *   Compares against existing database vectors (Supabase `pgvector`).
    *   Similarity > 85% triggers a "Potential Duplicate" warning to the author and moderators.

### 4.2 Feedback System
*   **Submission**: Users submit tickets via the Settings page or Footer.
*   **Types**: Bug Report, Feature Request, General Feedback.
*   **Admin View**: Kanban-style board to track ticket status (`Open`, `In Progress`, `Resolved`).

---

## 5. API Reference

**Base URL**: `/api`

### 5.1 Authentication
(Handled via Cookies/Supabase Client, but endpoints exist for programmatic access)
*   `POST /auth/signup`: Create account.
*   `POST /auth/login`: Exchange credentials for Session JWT.

### 5.2 Content Endpoints
*   `GET /posts`: List posts. Params: `limit`, `offset`, `tag`, `type`.
*   `POST /posts`: Create post. Req: `title`, `content`, `tags`.
*   `GET /posts/:id`: Get detail.
*   `DELETE /posts/:id`: Delete (Author/Admin only).

### 5.3 Moderation Endpoints
*   `POST /reports`: Create report. Req: `resource_id`, `reason`.
*   `GET /reports`: List reports (Admin only).
*   `PATCH /reports/:id`: Update status (`resolved`, `dismissed`).

### 5.4 Interactions
*   `POST /comments`: Add comment.
*   `POST /citations`: Add citation to a post.

### 5.5 Gamification Data
*   `GET /users/:id/stats`: Returns XP, Level, and Badge list.

*For full Request/Response JSON examples, refer to the codebase `API_DOCUMENTATION.md`.*

---

## 6. Development & Deployment

### 6.1 Setup Guide
1.  **Clone**: `git clone https://github.com/lAvArt/SyriaHub.git`
2.  **Install**: `npm install`
3.  **Environment**:
    *   Copy `.env.example` to `.env.local`.
    *   Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    *   Optional: `OPENAI_API_KEY`.
4.  **Database**:
    *   Run `supabase start` (Local) or link to remote project.
    *   Apply migrations: `supabase db push`.
5.  **Run**: `npm run dev` (Port 3000).

### 6.2 Testing
*   **Unit Tests**: Vitest (`npm run test:unit`). Mocks Supabase client.
*   **E2E Tests**: Playwright (`npm run test:e2e`). Tests critical flows (Signup, Posting).

### 6.3 Deployment
*   **Platform**: Vercel (recommended).
*   **Config**: `vercel.json` handles caching headers and redirects.
*   **CI/CD**: GitHub Actions workflow runs Linting + Type Checking on every push.

---

## 7. Upcoming Roadmap
*   **Real-time Collaboration**: WebSocket support for multi-user editing (Google Docs style).
*   **Mobile App**: Native wrappers (React Native) for iOS/Android.
*   **Offline syncing**: Enhanced Service Worker for full offline read/write (sync on reconnect).
