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

## Events

### GET /api/posts?type=event
List events (events are a type of post).

**Query Parameters:**
- `type` (string): Set to `event` to filter events
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
        "title": "Research Conference 2025",
        "content": "Event description...",
        "type": "event",
        "event_date": "2025-03-15T10:00:00Z",
        "event_end_date": "2025-03-15T18:00:00Z",
        "event_location": "Damascus University",
        "event_type": "conference",
        "author": { ...authorData },
        "created_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Event RSVP
RSVP functionality is managed through the `event_rsvps` table via Supabase client.

**RSVP Status Options:** `going`, `not_going`, `maybe`

---

## Plagiarism Check

### POST /api/plagiarism/check
Run a plagiarism check on a specific post version.

**Authorization:** Post author, Moderator, Admin

**How It Works:**
- The plagiarism check scans content against a database of sources to detect potential duplication
- Lower similarity scores indicate more original content
- Scores **below 20%** are considered clean ("Original Content")
- Scores **above 20%** are flagged for review ("Review Recommended")

> **Note:** Plagiarism detection uses semantic embeddings (OpenAI `text-embedding-3-small`) and pgvector similarity search. For matches above 85% similarity, GPT-4o-mini performs a detailed comparison.

**Request Body:**
```json
{
  "postVersionId": "uuid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "post_version_id": "uuid",
  "provider": "mock-detector-v1",
  "status": "completed",
  "score": 3,
  "flagged": false,
  "summary": "Content appears original.",
  "raw_response": { ... },
  "created_at": "2025-01-01T00:00:00Z"
}
```

**Understanding the Response:**
| Field | Description |
|-------|-------------|
| `score` | Similarity percentage (0-100). Lower is better. |
| `flagged` | `true` if score exceeds threshold (currently 20%) |
| `status` | `pending`, `completed`, or `failed` |
| `summary` | Human-readable interpretation of results |
| `provider` | Detection service used (currently `mock-detector-v1`) |

**Error Responses:**
- `400` - Missing `postVersionId`
- `401` - Not authenticated
- `403` - Not authorized (not post author or moderator)
- `500` - Database or service error

---

## Surveys


### GET /api/surveys
List surveys with optional filtering.

**Query Parameters:**
- `status` (string): Filter by status (draft, active, closed)
- `author_id` (uuid): Filter by author

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Research Survey",
    "description": "Survey description...",
    "author_id": "uuid",
    "author": { "name": "Author Name", "email": "author@example.com" },
    "is_anonymous": false,
    "allow_multiple_responses": false,
    "status": "active",
    "start_date": "2025-01-01T00:00:00Z",
    "end_date": "2025-02-01T00:00:00Z",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### POST /api/surveys
Create a new survey (authenticated).

**Authorization:** User, Moderator, Admin

**Request Body:**
```json
{
  "title": "Research Survey",
  "description": "Help us understand...",
  "questions": [
    {
      "question_text": "What is your experience?",
      "question_type": "text",
      "required": true
    },
    {
      "question_text": "Rate your satisfaction",
      "question_type": "rating",
      "options": [1, 2, 3, 4, 5],
      "required": true
    }
  ],
  "is_anonymous": true,
  "allow_multiple_responses": false,
  "start_date": "2025-01-01T00:00:00Z",
  "end_date": "2025-02-01T00:00:00Z",
  "status": "draft"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Research Survey",
  ...surveyData
}
```

### GET /api/surveys/[id]
Get a single survey with questions.

### PUT /api/surveys/[id]
Update a survey (owner only).

### DELETE /api/surveys/[id]
Delete a survey (owner, moderator, or admin).

---

## Polls

### GET /api/polls
Get all active polls.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "question": "Which topic needs more research?",
    "description": "Help prioritize...",
    "options": [
      { "id": "opt_0", "text": "Healthcare", "vote_count": 15 },
      { "id": "opt_1", "text": "Education", "vote_count": 23 }
    ],
    "is_multiple_choice": false,
    "is_active": true,
    "end_date": "2025-02-01T00:00:00Z",
    "author": { "name": "Author Name", "email": "author@example.com" },
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### POST /api/polls
Create a new poll (authenticated).

**Authorization:** User, Moderator, Admin

**Request Body:**
```json
{
  "question": "Which topic should we focus on?",
  "description": "Optional description...",
  "options": ["Option A", "Option B", "Option C"],
  "is_multiple_choice": false,
  "end_date": "2025-02-01T00:00:00Z"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "question": "Which topic should we focus on?",
  ...pollData
}
```

### POST /api/polls/[id]/vote
Submit a vote on a poll.

**Request Body:**
```json
{
  "optionId": "opt_0"
}
```

---

## Research Lab

### POST /api/question-advisor
Get AI-powered research question refinement.

**Authorization:** User, Moderator, Admin

**Request Body:**
```json
{
  "question": "How does climate change affect agriculture in Syria?"
}
```

**Response (200):**
```json
{
  "analysis": {
    "clarity_score": 8,
    "specificity_score": 7,
    "researchability_score": 9,
    "suggestions": [
      "Consider narrowing to specific crop types",
      "Add temporal scope (e.g., 2010-2024)"
    ],
    "refined_questions": [
      "How has climate change affected wheat production in northeastern Syria between 2010-2024?",
      "What adaptation strategies have Syrian farmers employed in response to changing precipitation patterns?"
    ],
    "methodology_hints": [
      "Consider mixed-methods approach combining satellite data with farmer interviews"
    ]
  }
}
```

---

## Coordination (Admin/Moderator Only)

### GET /api/coordination
List coordination threads for internal moderation discussions.

**Authorization:** Admin, Moderator

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `pageSize` (number): Items per page (default: 20)
- `objectType` (string): Filter by object type (post, comment, user)
- `objectState` (string): Filter by state
- `priority` (string): Filter by priority (low, normal, high, urgent)
- `includeArchived` (boolean): Include archived threads

**Response (200):**
```json
{
  "threads": [...],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

### POST /api/coordination
Create a new coordination thread.

**Authorization:** Admin, Moderator

**Request Body:**
```json
{
  "objectType": "post",
  "objectId": "uuid",
  "title": "Review needed for flagged content",
  "description": "Multiple reports received...",
  "priority": "high",
  "initialMessage": "Starting review process...",
  "initialMessageType": "NOTE"
}
```

### POST /api/coordination/[id]/messages
Add a message to a coordination thread.

---

## Appeals

### GET /api/appeals
List content appeals (moderators and admins only).

**Authorization:** Moderator, Admin

### POST /api/appeals
Submit an appeal for moderated content.

**Authorization:** Content owner

**Request Body:**
```json
{
  "post_id": "uuid",
  "reason": "I believe this content was incorrectly flagged because..."
}
```

---

## Role-Based Access Control (RBAC)

### User Roles

1. **Member** (basic)
   - View public content
   - Create limited comments
   - Request promotion to Researcher

2. **Researcher** (default for invited users)
   - Create and manage own posts
   - Create and manage own comments
   - Create reports, polls, and surveys
   - View all public content

3. **Moderator**
   - All Researcher permissions
   - View and manage all reports
   - Delete any post or comment
   - Create and manage tags
   - Access coordination center

4. **Admin**
   - All Moderator permissions
   - Manage users (view, update roles, delete)
   - Manage roles and permissions
   - Full system access

### Permission Matrix

| Action | Member | Researcher | Moderator | Admin |
|--------|--------|------------|-----------|-------|
| Create post | ✗ | ✓ | ✓ | ✓ |
| Edit own post | ✗ | ✓ | ✓ | ✓ |
| Delete own post | ✗ | ✓ | ✓ | ✓ |
| Delete any post | ✗ | ✗ | ✓ | ✓ |
| Create comment | ✓ | ✓ | ✓ | ✓ |
| Edit own comment | ✓ | ✓ | ✓ | ✓ |
| Delete any comment | ✗ | ✗ | ✓ | ✓ |
| Create report | ✓ | ✓ | ✓ | ✓ |
| View all reports | ✗ | ✗ | ✓ | ✓ |
| Manage reports | ✗ | ✗ | ✓ | ✓ |
| Create tags | ✗ | ✗ | ✓ | ✓ |
| Create polls/surveys | ✗ | ✓ | ✓ | ✓ |
| Access coordination | ✗ | ✗ | ✓ | ✓ |
| View users | ✗ | ✗ | ✗ | ✓ |
| Update user roles | ✗ | ✗ | ✗ | ✓ |
| Delete users | ✗ | ✗ | ✗ | ✓ |
| Manage roles | ✗ | ✗ | ✗ | ✓ |

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

// Create a poll
const pollResponse = await fetch('/api/polls', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'Which research area matters most?',
    options: ['Healthcare', 'Education', 'Infrastructure']
  })
})

// Get AI question advice
const advisorResponse = await fetch('/api/question-advisor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'How does education affect economic development?'
  })
})
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

# Create poll
curl -X POST http://localhost:3000/api/polls \
  -H "Content-Type: application/json" \
  -d '{"question":"Best approach?","options":["A","B","C"]}'

# Get surveys
curl http://localhost:3000/api/surveys?status=active
```

---

For more information, see:
- Database Schema: `DATABASE_SCHEMA.md`
- Quick Reference: `QUICK_REFERENCE.md`
- Setup Guide: `supabase/README.md`

