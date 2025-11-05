# Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────┐
│    auth.users       │
│  (Supabase Auth)    │
└──────────┬──────────┘
           │ 1:1
           ↓
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ • id (PK, FK)       │
│ • name              │
│ • email             │
│ • role              │
│ • bio               │
│ • affiliation       │
│ • created_at        │
└──────────┬──────────┘
           │ 1:N
           ↓
┌─────────────────────┐         ┌─────────────────────┐
│       posts         │←────────│     citations       │
├─────────────────────┤  N:N    ├─────────────────────┤
│ • id (PK)           │         │ • id (PK)           │
│ • title             │         │ • source_post_id    │
│ • content           │         │ • target_post_id    │
│ • tags[]            │         │ • created_at        │
│ • author_id (FK)    │         └─────────────────────┘
│ • created_at        │
│ • updated_at        │
└──────┬──────┬───────┘
       │      │
       │ 1:N  │ 1:N
       ↓      ↓
┌──────────────────┐  ┌──────────────────┐
│    comments      │  │     reports      │
├──────────────────┤  ├──────────────────┤
│ • id (PK)        │  │ • id (PK)        │
│ • content        │  │ • post_id (FK)   │
│ • post_id (FK)   │  │ • reporter_id    │
│ • user_id (FK)   │  │   (FK → users)   │
│ • created_at     │  │ • reason         │
└──────────────────┘  │ • status         │
       ↑              │ • created_at     │
       │ N:1          └──────────────────┘
       │
   ┌───┴──────┐
   │  users   │
   └──────────┘


┌─────────────────────┐       ┌─────────────────────┐
│       roles         │       │        tags         │
├─────────────────────┤       ├─────────────────────┤
│ • id (PK)           │       │ • id (PK)           │
│ • name              │       │ • label             │
│ • permissions{}     │       │ • discipline        │
└─────────────────────┘       │ • color             │
                              └─────────────────────┘
      (Referenced by                (Referenced by
       user.role)                   post.tags[])
```

## Relationships

### Direct Foreign Keys
1. **users.id → auth.users.id** (1:1)
   - Extends Supabase Auth user with profile data
   - Cascading delete when auth user is removed

2. **posts.author_id → users.id** (N:1)
   - One user can have many posts
   - Cascading delete removes posts when user deleted

3. **comments.post_id → posts.id** (N:1)
   - One post can have many comments
   - Cascading delete removes comments when post deleted

4. **comments.user_id → users.id** (N:1)
   - One user can have many comments
   - Cascading delete removes comments when user deleted

5. **reports.post_id → posts.id** (N:1)
   - One post can have many reports
   - Cascading delete removes reports when post deleted

6. **reports.reporter_id → users.id** (N:1)
   - One user can create many reports
   - Cascading delete removes reports when user deleted

7. **citations.source_post_id → posts.id** (N:1)
   - Post that contains the citation
   - Cascading delete removes citations

8. **citations.target_post_id → posts.id** (N:1)
   - Post being cited/referenced
   - Cascading delete removes citations

### Array/Text References
- **posts.tags[]** → tags.label (text array)
- **users.role** → roles.name (text, with CHECK constraint)

## Data Flow

### User Signup Flow
```
1. User signs up via Supabase Auth
   ↓
2. auth.users record created
   ↓
3. Trigger: handle_new_user() fires
   ↓
4. users profile record auto-created
   ↓
5. User can now create posts, comments
```

### Post Creation Flow
```
1. Authenticated user creates post
   ↓
2. RLS checks: auth.uid() = author_id
   ↓
3. Post inserted with tags array
   ↓
4. updated_at trigger sets timestamp
   ↓
5. Post visible to all (public read)
```

### Citation Flow
```
1. User creates post A
   ↓
2. User creates post B referencing A
   ↓
3. Citation record links B → A
   ↓
4. Post A shows increased citation count
```

### Moderation Flow
```
1. User reports post
   ↓
2. Report created (status: pending)
   ↓
3. Only reporter + moderators see report
   ↓
4. Moderator reviews & updates status
   ↓
5. Moderator can delete post if needed
```

## Access Control Matrix

| Table      | Anonymous | Authenticated | Owner | Moderator | Admin |
|------------|-----------|---------------|-------|-----------|-------|
| users      | Read      | Read, Create* | Update| Read      | All   |
| posts      | Read      | Read, Create  | CRUD  | CRUD      | CRUD  |
| comments   | Read      | Read, Create  | CRU   | CRUD      | CRUD  |
| reports    | -         | Read*, Create*| Read* | CRUD      | CRUD  |
| roles      | Read      | Read          | -     | -         | CRUD  |
| citations  | Read      | Read, Create  | Del*  | Read      | CRUD  |
| tags       | Read      | Read, Create  | -     | CRUD      | CRUD  |

Legend:
- C: Create, R: Read, U: Update, D: Delete
- \*: Limited (e.g., only own records, specific conditions)

## Indexes

### Primary Indexes (Automatic)
- All `id` columns (Primary Keys)
- All Foreign Keys

### Custom Indexes
```sql
-- Users
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_role_idx ON users(role);

-- Posts
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX posts_author_id_idx ON posts(author_id);
CREATE INDEX posts_tags_idx ON posts USING GIN(tags);

-- Comments
CREATE INDEX comments_post_id_idx ON comments(post_id);
CREATE INDEX comments_user_id_idx ON comments(user_id);
CREATE INDEX comments_created_at_idx ON comments(created_at DESC);

-- Reports
CREATE INDEX reports_post_id_idx ON reports(post_id);
CREATE INDEX reports_reporter_id_idx ON reports(reporter_id);
CREATE INDEX reports_status_idx ON reports(status);

-- Citations
CREATE INDEX citations_source_post_id_idx ON citations(source_post_id);
CREATE INDEX citations_target_post_id_idx ON citations(target_post_id);

-- Tags
CREATE INDEX tags_label_idx ON tags(label);
CREATE INDEX tags_discipline_idx ON tags(discipline);
```

## Triggers

### 1. Auto-Create User Profile
```sql
-- Trigger: on_auth_user_created
-- Function: handle_new_user()
-- Fires: AFTER INSERT ON auth.users
-- Purpose: Create users profile when signing up
```

### 2. Auto-Update Timestamp
```sql
-- Trigger: update_posts_updated_at
-- Function: update_updated_at_column()
-- Fires: BEFORE UPDATE ON posts
-- Purpose: Keep updated_at current
```

## Constraints

### Check Constraints
```sql
-- User roles must be valid
users.role CHECK (role IN ('researcher', 'moderator', 'admin'))

-- Report status must be valid
reports.status CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed'))

-- Citations must reference different posts
citations CHECK (source_post_id != target_post_id)
```

### Uniqueness Constraints
```sql
-- Unique email for users
users.email UNIQUE

-- Unique role names
roles.name UNIQUE

-- Unique tag labels
tags.label UNIQUE
```

## Views

### post_stats
Aggregates statistics for each post:
```sql
SELECT 
  p.id,
  p.title,
  p.author_id,
  u.name as author_name,
  p.created_at,
  COUNT(DISTINCT c.id) as comment_count,
  COUNT(DISTINCT cit.id) as citation_count
FROM posts p
LEFT JOIN users u ON p.author_id = u.id
LEFT JOIN comments c ON p.id = c.post_id
LEFT JOIN citations cit ON p.id = cit.target_post_id
GROUP BY p.id, p.title, p.author_id, u.name, p.created_at;
```

## Storage Size Estimates

| Table      | Row Size | Expected Scale | Storage Notes |
|------------|----------|----------------|---------------|
| users      | ~500B    | Thousands      | Small, mostly text |
| posts      | ~5-50KB  | Thousands      | Large content field |
| comments   | ~500B    | Tens of thousands | Short text |
| reports    | ~300B    | Hundreds       | Moderation only |
| roles      | ~200B    | < 10           | System config |
| citations  | ~100B    | Thousands      | Just relationships |
| tags       | ~100B    | < 100          | Curated list |

## Performance Considerations

### Optimized Queries
- ✅ Indexes on frequently filtered columns
- ✅ GIN index for array operations (tags)
- ✅ Descending index on created_at for feeds
- ✅ Compound indexes considered for common joins

### Potential Bottlenecks
- ⚠️ Full-text search on posts.content (add pg_trgm if needed)
- ⚠️ Large result sets without pagination
- ⚠️ Complex tag filtering on large datasets

### Scaling Strategies
1. Partition posts table by created_at (if > 1M rows)
2. Add full-text search indexes (GIN on tsvector)
3. Cache frequently accessed statistics
4. Consider materialized views for analytics

---

This diagram represents the complete database schema for SyriaHub as of the initial implementation.
