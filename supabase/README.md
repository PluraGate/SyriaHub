# SyriaHub Database Schema

## Overview

This directory contains the PostgreSQL database schema for SyriaHub, a research collaboration platform.

## Database Structure

### Tables

1. **users** - Extended user profiles (linked to `auth.users`)
   - `id` (PK, FK to auth.users)
   - `name`, `email`, `role`, `bio`, `affiliation`
   - Roles: researcher (default), moderator, admin

2. **posts** - Research posts and articles
   - `id` (PK), `title`, `content`, `tags[]`
   - `author_id` (FK to users)
   - Timestamps: `created_at`, `updated_at`

3. **comments** - Comments on posts
   - `id` (PK), `content`
   - `post_id` (FK to posts), `user_id` (FK to users)

4. **reports** - Content moderation reports
   - `id` (PK), `reason`, `status`
   - `post_id` (FK to posts), `reporter_id` (FK to users)
   - Status: pending, reviewing, resolved, dismissed

5. **roles** - Role definitions with JSONB permissions
   - `id` (PK), `name`, `permissions` (JSONB)

6. **citations** - Post-to-post citations
   - `id` (PK)
   - `source_post_id`, `target_post_id` (both FK to posts)

7. **tags** - Content categorization tags
   - `id` (PK), `label`, `discipline`, `color`

### Views

- **post_stats** - Aggregated statistics for posts (comment count, citation count)

## Row Level Security (RLS)

All tables have RLS enabled with the following general policies:

- **Public read access**: users, posts, comments, citations, tags
- **Authenticated write**: Users can create their own content
- **Owner access**: Users can edit/delete their own content
- **Moderator/Admin access**: Extended permissions for moderation

## Triggers & Functions

1. **update_updated_at_column()** - Auto-updates `updated_at` timestamp on posts
2. **handle_new_user()** - Automatically creates user profile when auth user signs up

## Setup Instructions

### 1. Initialize Supabase

First, install the Supabase CLI:

**Windows (PowerShell)**:
```powershell
# Using Scoop (recommended)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or download directly from GitHub releases
# Visit: https://github.com/supabase/cli/releases
```

**macOS**:
```bash
brew install supabase/tap/supabase
```

**Linux**:
```bash
# Using Homebrew on Linux
brew install supabase/tap/supabase

# Or download binary from GitHub releases
```

For other installation methods, visit: https://github.com/supabase/cli#install-the-cli

Then, initialize your project:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Or start local development
supabase start
```

### 2. Run Migrations

```bash
# Apply migrations
supabase db push

# Or for local development
supabase db reset
```

### 3. Enable Auth

In your Supabase dashboard:
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set up password requirements

### 4. Create Test Users

You can create test users through:

**Option A: Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Enter email and password

**Option B: Using the API**

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'researcher@example.com',
  password: 'securepassword',
  options: {
    data: {
      name: 'Dr. Ahmed Al-Rashid'
    }
  }
})
```

### 5. Seed Sample Data (Optional)

After creating users through Auth:

1. Get user IDs:
```sql
SELECT id, email FROM auth.users;
```

2. Update `20250101000001_seed_data.sql` with actual user IDs

3. Uncomment the INSERT statements

4. Run:
```bash
supabase db push
```

## Testing the Schema

### Check Tables

```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Test Queries

```sql
-- Get all posts with author info
SELECT p.*, u.name as author_name, u.affiliation
FROM posts p
JOIN users u ON p.author_id = u.id
ORDER BY p.created_at DESC;

-- Get post statistics
SELECT * FROM post_stats;

-- Get all tags by discipline
SELECT discipline, array_agg(label) as tags
FROM tags
GROUP BY discipline;
```

## Security Notes

1. **Never expose service role key** - Only use anon/authenticated keys in client
2. **RLS is mandatory** - All tables have RLS enabled
3. **Auth required for writes** - Only authenticated users can create content
4. **Role-based access** - Moderators and admins have elevated permissions

## Useful Commands

```bash
# View migration status
supabase migration list

# Create new migration
supabase migration new migration_name

# Reset database (⚠️ destroys all data)
supabase db reset

# View database diff
supabase db diff

# Generate TypeScript types
supabase gen types typescript --local > ../types/supabase.ts
```

## TypeScript Types

Generate TypeScript types for your schema:

```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > ../types/supabase.ts
```

## Backup & Recovery

```bash
# Backup database
pg_dump -h db.your-project-ref.supabase.co -U postgres -d postgres > backup.sql

# Restore database
psql -h db.your-project-ref.supabase.co -U postgres -d postgres < backup.sql
```

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
