# API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## Authentication

All authenticated endpoints require a valid JWT token from Supabase Auth. The token is automatically handled by Supabase client in cookies.

### Auth Endpoints

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "affiliation": "University of Damascus" // optional
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "researcher",
      "affiliation": "University of Damascus",
      "created_at": "2025-01-01T00:00:00Z"
    },
    "session": { ...sessionData },
    "message": "Account created successfully"
  }
}
```

#### POST /api/auth/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ...userData },
    "session": { ...sessionData }
  }
}
```

#### POST /api/auth/logout
Log out the current user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

#### GET /api/auth/user
Get current authenticated user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ...userData }
  }
}
```

---

## Posts

### GET /api/posts
List posts with optional filtering.

**Query Parameters:**
- `tag` (string): Filter by tag
- `author_id` (uuid): Filter by author
- `search` (string): Search in title and content
- `limit` (number): Items per page (default: 10)
- `offset` (number): Pagination offset (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "title": "Post Title",
        "content": "Post content...",
        "tags": ["Tag1", "Tag2"],
        "author_id": "uuid",
        "author": {
          "id": "uuid",
          "name": "Author Name",
          "email": "author@example.com",
          "affiliation": "Institution"
        },
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 42
    }
  }
}
```

### POST /api/posts
Create a new post (authenticated).

**Authorization:** User, Moderator, Admin

**Request Body:**
```json
{
  "title": "My Research Post",
  "content": "# Introduction\n\nThis is my research...",
  "tags": ["Public Health", "Education"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "My Research Post",
    "content": "# Introduction...",
    "tags": ["Public Health", "Education"],
    "author_id": "uuid",
    "author": { ...authorData },
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

### GET /api/posts/[id]
Get a single post by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Post Title",
    "content": "Post content...",
    "tags": ["Tag1"],
    "author_id": "uuid",
    "author": { ...authorData },
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

### PUT /api/posts/[id]
Update a post (owner, moderator, or admin).

**Authorization:** Owner, Moderator, Admin

**Request Body:**
```json
{
  "title": "Updated Title", // optional
  "content": "Updated content...", // optional
  "tags": ["NewTag"] // optional
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ...updatedPost }
}
```

### DELETE /api/posts/[id]
Delete a post (owner, moderator, or admin).

**Authorization:** Owner, Moderator, Admin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Post deleted successfully"
  }
}
```

---

## Comments

### GET /api/comments
List comments with optional filtering.

**Query Parameters:**
- `post_id` (uuid): Filter by post
- `user_id` (uuid): Filter by user
- `limit` (number): Items per page (default: 50)
- `offset` (number): Pagination offset (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "uuid",
        "content": "Great post!",
        "post_id": "uuid",
        "user_id": "uuid",
        "user": {
          "id": "uuid",
          "name": "Commenter Name",
          "email": "commenter@example.com",
          "role": "researcher"
        },
        "post": {
          "id": "uuid",
          "title": "Post Title"
        },
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### POST /api/comments
Create a comment (authenticated).

**Authorization:** User, Moderator, Admin

**Request Body:**
```json
{
  "content": "Great research! I agree with your findings.",
  "post_id": "uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "Great research!...",
    "post_id": "uuid",
    "user_id": "uuid",
    "user": { ...userData },
    "post": { ...postData },
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### PUT /api/comments/[id]
Update a comment (owner only).

**Authorization:** Owner only

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ...updatedComment }
}
```

### DELETE /api/comments/[id]
Delete a comment (owner, moderator, or admin).

**Authorization:** Owner, Moderator, Admin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Comment deleted successfully"
  }
}
```

---

## Reports

### GET /api/reports
List reports (moderators and admins only).

**Authorization:** Moderator, Admin

**Query Parameters:**
- `status` (string): Filter by status (pending, reviewing, resolved, dismissed)
- `post_id` (uuid): Filter by post
- `limit` (number): Items per page (default: 20)
- `offset` (number): Pagination offset (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "uuid",
        "post_id": "uuid",
        "reporter_id": "uuid",
        "reason": "Inappropriate content",
        "status": "pending",
        "post": {
          "id": "uuid",
          "title": "Post Title",
          "content": "Post content..."
        },
        "reporter": {
          "id": "uuid",
          "name": "Reporter Name",
          "email": "reporter@example.com"
        },
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### POST /api/reports
Create a report (authenticated).

**Authorization:** User, Moderator, Admin

**Request Body:**
```json
{
  "post_id": "uuid",
  "reason": "This post contains inappropriate content that violates community guidelines."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "post_id": "uuid",
    "reporter_id": "uuid",
    "reason": "This post contains...",
    "status": "pending",
    "post": { ...postData },
    "reporter": { ...userData },
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### PUT /api/reports/[id]
Update report status (moderators and admins only).

**Authorization:** Moderator, Admin

**Request Body:**
```json
{
  "status": "resolved"
}
```

**Valid statuses:** pending, reviewing, resolved, dismissed

**Response (200):**
```json
{
  "success": true,
  "data": { ...updatedReport }
}
```

### DELETE /api/reports/[id]
Delete a report (moderators and admins only).

**Authorization:** Moderator, Admin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Report deleted successfully"
  }
}
```

---

## Users

### GET /api/users
List users (admin only).

**Authorization:** Admin

**Query Parameters:**
- `role` (string): Filter by role
- `search` (string): Search in name, email, affiliation
- `limit` (number): Items per page (default: 20)
- `offset` (number): Pagination offset (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [ ...userData ],
    "pagination": { ... }
  }
}
```

### GET /api/users/[id]
Get user profile (public).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "role": "researcher",
    "bio": "Research interests...",
    "affiliation": "Institution",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### PUT /api/users/[id]
Update user profile.

**Authorization:** 
- Users can update their own profile (except role)
- Admins can update any profile including role

**Request Body:**
```json
{
  "name": "New Name", // optional
  "bio": "Updated bio...", // optional
  "affiliation": "New Institution", // optional
  "role": "moderator" // optional, admin only
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ...updatedUser }
}
```

### DELETE /api/users/[id]
Delete user account (admin only).

**Authorization:** Admin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  }
}
```

---

## Roles

### GET /api/roles
List all roles (public).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": "uuid",
        "name": "researcher",
        "permissions": {
          "can_post": true,
          "can_comment": true,
          "can_report": true
        }
      }
    ]
  }
}
```

### POST /api/roles
Create a role (admin only).

**Authorization:** Admin

**Request Body:**
```json
{
  "name": "reviewer",
  "permissions": {
    "can_post": true,
    "can_comment": true,
    "can_review": true
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ...createdRole }
}
```

---

## Tags

### GET /api/tags
List all tags (public).

**Query Parameters:**
- `discipline` (string): Filter by discipline
- `search` (string): Search in label

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "id": "uuid",
        "label": "Public Health",
        "discipline": "Medicine",
        "color": "#10B981"
      }
    ]
  }
}
```

### POST /api/tags
Create a tag (moderators and admins only).

**Authorization:** Moderator, Admin

**Request Body:**
```json
{
  "label": "Climate Change",
  "discipline": "Environmental Science", // optional
  "color": "#14B8A6" // optional, defaults to #3B82F6
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ...createdTag }
}
```

---

## Citations

### GET /api/citations
Get citations for posts.

**Query Parameters:**
- `source_post_id` (uuid): Get citations FROM this post
- `target_post_id` (uuid): Get citations TO this post
- `limit` (number): Items per page (default: 50)
- `offset` (number): Pagination offset (default: 0)

*Note: Either source_post_id or target_post_id is required*

**Response (200):**
```json
{
  "success": true,
  "data": {
    "citations": [
      {
        "id": "uuid",
        "source_post_id": "uuid",
        "target_post_id": "uuid",
        "source_post": {
          "id": "uuid",
          "title": "Citing Post",
          "author_id": "uuid"
        },
        "target_post": {
          "id": "uuid",
          "title": "Cited Post",
          "author_id": "uuid"
        },
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

### POST /api/citations
Create a citation (authenticated).

**Authorization:** User, Moderator, Admin

**Request Body:**
```json
{
  "source_post_id": "uuid",
  "target_post_id": "uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ...createdCitation }
}
```

### DELETE /api/citations/[id]
Delete a citation (source post owner, or moderator/admin).

**Authorization:** Source post owner, Moderator, Admin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Citation deleted successfully"
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Validation Error
- `500` - Internal Server Error

---

## Role-Based Access Control (RBAC)

### User Roles
1. **Researcher** (default)
   - Create and manage own posts
   - Create and manage own comments
   - Create reports
   - View all public content

2. **Moderator**
   - All Researcher permissions
   - View and manage all reports
   - Delete any post or comment
   - Create and manage tags

3. **Admin**
   - All Moderator permissions
   - Manage users (view, update roles, delete)
   - Manage roles and permissions
   - Full system access

### Permission Matrix

| Action | User | Moderator | Admin |
|--------|------|-----------|-------|
| Create post | ✓ | ✓ | ✓ |
| Edit own post | ✓ | ✓ | ✓ |
| Delete own post | ✓ | ✓ | ✓ |
| Delete any post | ✗ | ✓ | ✓ |
| Create comment | ✓ | ✓ | ✓ |
| Edit own comment | ✓ | ✓ | ✓ |
| Delete any comment | ✗ | ✓ | ✓ |
| Create report | ✓ | ✓ | ✓ |
| View all reports | ✗ | ✓ | ✓ |
| Manage reports | ✗ | ✓ | ✓ |
| Create tags | ✗ | ✓ | ✓ |
| View users | ✗ | ✗ | ✓ |
| Update user roles | ✗ | ✗ | ✓ |
| Delete users | ✗ | ✗ | ✓ |
| Manage roles | ✗ | ✗ | ✓ |

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider implementing rate limiting using:
- Supabase Edge Functions rate limiting
- Vercel Edge Config
- Redis-based rate limiting

---

## Examples

### JavaScript/TypeScript (Next.js Client)

```typescript
import { createClient } from '@/lib/supabase/client'

// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})
const data = await response.json()

// Create post
const postResponse = await fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My Research',
    content: '# Introduction...',
    tags: ['Research', 'Science']
  })
})

// Get posts with filtering
const postsResponse = await fetch(
  '/api/posts?tag=Public+Health&limit=20&offset=0'
)
const posts = await postsResponse.json()
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get posts
curl http://localhost:3000/api/posts?limit=10&tag=Education

# Create comment
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{"content":"Great post!","post_id":"uuid-here"}'
```

---

For more information, see:
- Database Schema: `DATABASE_SCHEMA.md`
- Quick Reference: `QUICK_REFERENCE.md`
- Setup Guide: `supabase/README.md`
