# Changelog

All notable changes to the SyriaHub project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-05

### Added - Complete Database Schema

#### Tables
- **users** table with extended profile fields (name, role, bio, affiliation)
- **posts** table with tags array support and author relationships
- **comments** table for threaded discussions on posts
- **reports** table for content moderation system
- **roles** table with JSONB-based flexible permissions
- **citations** table for post-to-post references
- **tags** table for content categorization with disciplines and colors

#### Security
- Row Level Security (RLS) enabled on all tables
- Public read policies for open content
- Authenticated write policies with ownership checks
- Role-based access policies for moderators and admins
- Automatic user profile creation trigger
- Cascading delete constraints for data integrity

#### Database Features
- Auto-updating timestamps on posts (updated_at)
- Optimized indexes for common queries
- GIN indexes for efficient array searches (tags)
- Helper view for post statistics (comment_count, citation_count)
- Check constraints for enum validation
- Foreign key relationships with proper cascading

#### Seed Data
- 3 pre-defined roles with permissions (researcher, moderator, admin)
- 15 disciplinary tags with colors
- Sample post templates (ready for user IDs)
- Sample comment and citation templates

#### TypeScript Types
- Complete type definitions for all tables
- Extended types with relations (PostWithAuthor, etc.)
- Form input types for CRUD operations
- Type unions for roles and statuses

#### Documentation
- `supabase/README.md` - Complete database setup guide
- `DATABASE_SCHEMA.md` - Visual schema diagram and relationships
- `DATABASE_IMPLEMENTATION.md` - Detailed implementation summary
- `QUICK_REFERENCE.md` - Common SQL queries and TypeScript examples
- Updated main `README.md` with database setup instructions

#### Automation
- `supabase/setup.ps1` - Automated setup script for Windows
- `supabase/setup.sh` - Automated setup script for macOS/Linux
- Interactive environment selection (local/remote)
- Automatic migration application

#### Migration Files
- `20250101000000_initial_schema.sql` - Complete schema definition
- `20250101000001_seed_data.sql` - Sample data templates

### Changed
- Updated `types/index.ts` with all database types
- Enhanced `README.md` with database setup section
- Updated `PROJECT_SUMMARY.md` to reflect database implementation
- Removed `author_email` field from posts (redundant with user lookup)

### Technical Details
- PostgreSQL with Supabase
- 7 core tables with proper relationships
- 15+ indexes for query optimization
- 2 custom triggers (profile creation, timestamp updates)
- 20+ RLS policies for fine-grained access control
- UUID primary keys throughout
- JSONB for flexible permissions storage
- TEXT[] arrays for tags
- Timestamp fields with timezone support

---

## [1.0.0] - 2025-01-01

### Added - Initial Project Setup

#### Core Framework
- Next.js 14+ with App Router
- React 19
- TypeScript 5.9+ with strict mode
- Tailwind CSS 4.1
- Supabase JS Client

#### Pages & Routes
- Landing page with hero section (`/`)
- Authentication pages (`/auth/login`, `/auth/signup`, `/auth/signout`)
- Post feed page (`/feed`)
- Post editor page (`/editor`)
- Dynamic post detail pages (`/post/[id]`)
- Dynamic user profile pages (`/profile/[id]`)

#### Components
- Shadcn UI integration
  - Button component with variants
  - Card components (Card, CardHeader, CardTitle, CardContent)
- UI utilities (cn function for class merging)
- Lucide React icons

#### Configuration
- Tailwind CSS configuration
- TypeScript configuration with path aliases
- Supabase client setup (server, client, middleware)
- Auth middleware
- Vercel deployment configuration
- Environment variable template

#### Documentation
- `README.md` - Project overview
- `SETUP.md` - Detailed setup guide
- `QUICKSTART.md` - 5-minute quick start
- `CONTRIBUTING.md` - Contribution guidelines
- `PROJECT_SUMMARY.md` - Setup completion summary

#### Basic Database
- Initial posts table schema
- Basic RLS policies
- Auth integration

---

## Release Notes

### Version 1.1.0 Highlights

This release brings a complete, production-ready database schema to SyriaHub with:

- **7 interconnected tables** providing full platform functionality
- **Comprehensive security** with Row Level Security on all tables
- **Role-based access control** supporting researchers, moderators, and admins
- **Citation tracking** for building research networks
- **Moderation tools** with status-based report management
- **Automated setup** with cross-platform scripts
- **Extensive documentation** with examples and diagrams

The database is now ready for:
- Multi-user research collaboration
- Content moderation and reporting
- Academic citation networks
- Role-based permissions management
- Tag-based content organization

### Migration Path

If you have an existing installation:

1. Backup your current database
2. Run the new migration: `supabase db push`
3. Enable Email Auth in Supabase Dashboard
4. User profiles will be auto-created on signup
5. Optional: Add sample data from seed file

### Breaking Changes

- `posts.author_email` field removed (use join with `users` table)
- RLS policies updated (more restrictive, role-based)
- TypeScript types restructured (see `types/index.ts`)

---

**For questions or issues, please refer to the documentation or open an issue on GitHub.**
