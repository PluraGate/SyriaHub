# Quick Reference - Database Operations

## Common Supabase CLI Commands

```bash
# Start local development
supabase start

# Stop local instance
supabase stop

# View status
supabase status

# Link to remote project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push

# Reset database (⚠️ destroys data)
supabase db reset

# Create new migration
supabase migration new migration_name

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts

# View database diff
supabase db diff
```

## Common SQL Queries

### Users & Authentication

```sql
-- Get all users with profiles
SELECT u.id, u.email, p.name, p.role, p.affiliation
FROM auth.users u
JOIN users p ON u.id = p.id;

-- Count users by role
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Find users by affiliation
SELECT * FROM users WHERE affiliation ILIKE '%university%';
```

### Posts

```sql
-- Get recent posts with author info
SELECT p.*, u.name as author_name, u.affiliation
FROM posts p
JOIN users u ON p.author_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Get posts by tag
SELECT * FROM posts WHERE 'Public Health' = ANY(tags);

-- Get post with statistics
SELECT * FROM post_stats WHERE id = 'POST_UUID_HERE';

-- Count posts by author
SELECT author_id, COUNT(*) as post_count
FROM posts
GROUP BY author_id
ORDER BY post_count DESC;
```

### Comments

```sql
-- Get comments for a post
SELECT c.*, u.name as commenter_name
FROM comments c
JOIN users u ON c.user_id = u.id
WHERE c.post_id = 'POST_UUID_HERE'
ORDER BY c.created_at DESC;

-- Count comments by user
SELECT user_id, COUNT(*) as comment_count
FROM comments
GROUP BY user_id
ORDER BY comment_count DESC;
```

### Tags

```sql
-- Get all tags grouped by discipline
SELECT discipline, array_agg(label) as tags
FROM tags
GROUP BY discipline;

-- Find most used tags
SELECT unnest(tags) as tag, COUNT(*) as usage_count
FROM posts
GROUP BY tag
ORDER BY usage_count DESC;
```

### Reports & Moderation

```sql
-- Get pending reports (moderator view)
SELECT r.*, p.title, u.name as reporter_name
FROM reports r
JOIN posts p ON r.post_id = p.id
JOIN users u ON r.reporter_id = u.id
WHERE r.status = 'pending'
ORDER BY r.created_at DESC;

-- Update report status
UPDATE reports 
SET status = 'resolved' 
WHERE id = 'REPORT_UUID_HERE';
```

### Citations

```sql
-- Get citations for a post
SELECT 
  c.*,
  sp.title as source_title,
  tp.title as target_title
FROM citations c
JOIN posts sp ON c.source_post_id = sp.id
JOIN posts tp ON c.target_post_id = tp.id
WHERE c.source_post_id = 'POST_UUID_HERE';

-- Most cited posts
SELECT target_post_id, COUNT(*) as citation_count
FROM citations
GROUP BY target_post_id
ORDER BY citation_count DESC;
```

## Row Level Security Testing

```sql
-- Test RLS as anonymous user
SET ROLE anon;
SELECT * FROM posts; -- Should work
INSERT INTO posts (title, content, author_id) VALUES (...); -- Should fail

-- Test RLS as authenticated user
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "user-uuid-here"}';
SELECT * FROM posts; -- Should work
INSERT INTO posts (...) VALUES (...); -- Should work if user_id matches

-- Reset role
RESET ROLE;
```

## TypeScript Usage Examples

### Creating a Post

```typescript
import { createClient } from '@/lib/supabase/client'
import type { CreatePostInput } from '@/types'

const supabase = createClient()

const newPost: CreatePostInput = {
  title: 'My Research Post',
  content: '# Introduction\n\nThis is my research...',
  tags: ['Public Health', 'Data Analysis']
}

const { data, error } = await supabase
  .from('posts')
  .insert({
    ...newPost,
    author_id: user.id
  })
  .select()
  .single()
```

### Fetching Posts with Author

```typescript
import type { PostWithAuthor } from '@/types'

const { data: posts, error } = await supabase
  .from('posts')
  .select(`
    *,
    author:users(*)
  `)
  .order('created_at', { ascending: false })
  .limit(10)

// posts is typed as PostWithAuthor[]
```

### Creating a Comment

```typescript
import type { CreateCommentInput } from '@/types'

const newComment: CreateCommentInput = {
  content: 'Great research!',
  post_id: postId
}

const { data, error } = await supabase
  .from('comments')
  .insert({
    ...newComment,
    user_id: user.id
  })
  .select()
  .single()
```

### Updating User Profile

```typescript
import type { UpdateUserProfileInput } from '@/types'

const updates: UpdateUserProfileInput = {
  bio: 'Updated bio',
  affiliation: 'University of Damascus'
}

const { error } = await supabase
  .from('users')
  .update(updates)
  .eq('id', user.id)
```

### Creating a Report

```typescript
import type { CreateReportInput } from '@/types'

const report: CreateReportInput = {
  post_id: postId,
  reason: 'Inappropriate content'
}

const { error } = await supabase
  .from('reports')
  .insert({
    ...report,
    reporter_id: user.id
  })
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional (for admin operations only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Troubleshooting

### RLS Policy Debugging

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View all policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Test specific policy
EXPLAIN (ANALYZE, VERBOSE) 
SELECT * FROM posts WHERE author_id = 'some-uuid';
```

### Foreign Key Issues

```sql
-- Check foreign key constraints
SELECT
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public';
```

### Performance Analysis

```sql
-- Analyze slow queries
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM posts 
WHERE 'Education' = ANY(tags)
ORDER BY created_at DESC;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan;
```

## Useful Views

### User Statistics

```sql
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.name,
  u.role,
  COUNT(DISTINCT p.id) as post_count,
  COUNT(DISTINCT c.id) as comment_count,
  COUNT(DISTINCT r.id) as report_count
FROM users u
LEFT JOIN posts p ON u.id = p.author_id
LEFT JOIN comments c ON u.id = c.user_id
LEFT JOIN reports r ON u.id = r.reporter_id
GROUP BY u.id, u.name, u.role;
```

### Tag Statistics

```sql
CREATE OR REPLACE VIEW tag_stats AS
SELECT 
  unnest(p.tags) as tag,
  COUNT(*) as usage_count,
  COUNT(DISTINCT p.author_id) as unique_authors
FROM posts p
GROUP BY tag
ORDER BY usage_count DESC;
```

## Backup Commands

```bash
# Backup remote database
pg_dump -h db.PROJECT_REF.supabase.co -U postgres -d postgres > backup.sql

# Restore from backup
psql -h db.PROJECT_REF.supabase.co -U postgres -d postgres < backup.sql

# Backup migrations only
cp -r supabase/migrations backup/migrations-$(date +%Y%m%d)
```

---

For more detailed information, see:
- `supabase/README.md` - Complete documentation
- `DATABASE_IMPLEMENTATION.md` - Implementation details
- [Supabase Documentation](https://supabase.com/docs)
