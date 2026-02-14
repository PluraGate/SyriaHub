# AI Moderation System Documentation

## Overview

The SyriaHub platform now includes comprehensive AI-powered content moderation to ensure community safety and maintain quality standards. The system automatically scans all new posts and comments before they are published.

## Features

### 1. **Automated Content Moderation**
- **OpenAI Moderation API**: Primary moderation service
- **Perspective API**: Fallback option (Google's comment analyzer)
- **Real-time scanning**: All posts and comments are checked before insertion
- **Auto-reporting**: Flagged content automatically creates moderation reports

### 2. **Manual Reporting**
- Users can flag inappropriate content
- Prevents duplicate reports
- Users cannot report their own content

### 3. **Admin Moderation Controls**
- Review pending reports
- Update report status (pending → reviewing → resolved/dismissed)
- Delete flagged content
- Track reviewer and review timestamp

### 4. **Plagiarism Detection (Placeholder)**
- Infrastructure ready for future integration
- Supports services like Copyscape, Turnitin, iThenticate
- Can be extended with custom embedding-based solutions

## Setup

### Environment Variables

Add the following to your `.env.local` file:

```bash
# OpenAI Moderation API (recommended)
OPENAI_API_KEY=sk-your-api-key-here

# Perspective API (optional fallback)
PERSPECTIVE_API_KEY=your-perspective-api-key
```

**Note**: At least one API key should be configured. If neither is set, content will be allowed by default with warnings logged.

### Getting API Keys

#### OpenAI Moderation API
1. Sign up at https://platform.openai.com/
2. Navigate to API Keys section
3. Create a new API key
4. Add to `.env.local` as `OPENAI_API_KEY`

**Pricing**: Free tier available, very low cost for moderation endpoint

#### Perspective API (Google)
1. Enable the API at https://console.cloud.google.com/
2. Visit https://perspectiveapi.com/
3. Request API access
4. Add to `.env.local` as `PERSPECTIVE_API_KEY`

**Pricing**: Free tier available with quota limits

### Database Migration

Run the migration to add moderation fields to the reports table:

```bash
# Using Supabase CLI
supabase db push

# Or apply the migration directly
psql -d your_database -f supabase/migrations/20250106000000_add_moderation_fields.sql
```

## API Endpoints

### POST /api/posts
Create a new post with automatic moderation.

**Request:**
```json
{
  "title": "Research on Syria's Historical Sites",
  "content": "Detailed research content...",
  "tags": ["history", "archaeology"]
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "...",
    "content": "...",
    // ... post data
  }
}
```

**Response (Content Flagged):**
```json
{
  "success": false,
  "error": "Your content was flagged for: Harassment. Please review our community guidelines...",
  "warnings": ["Detailed warning message"],
  "categories": ["harassment", "hate"]
}
```

**Response (With Warnings):**
```json
{
  "success": true,
  "data": { /* post data */ },
  "warnings": ["Minor content concerns detected"]
}
```

### POST /api/comments
Create a new comment with automatic moderation.

**Request:**
```json
{
  "content": "Great research! I'd like to add...",
  "post_id": "post-uuid"
}
```

**Responses**: Same structure as posts endpoint

### POST /api/report
Manually report a post or comment.

**Request:**
```json
{
  "content_type": "post",  // or "comment"
  "content_id": "uuid",
  "reason": "This content contains misleading information about historical events."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "report-uuid",
    "message": "Report submitted successfully. Our moderation team will review it."
  }
}
```

**Validation Rules:**
- `reason` must be at least 10 characters
- `reason` max 1000 characters
- Cannot report your own content
- Cannot submit duplicate reports for the same content

### GET /api/reports
List all reports (moderators/admins only).

**Query Parameters:**
- `status`: Filter by status (pending, reviewing, resolved, dismissed)
- `post_id`: Filter by post
- `limit`: Results per page (default: 20)
- `offset`: Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": "uuid",
        "post_id": "uuid",
        "comment_id": null,
        "content_type": "post",
        "reporter_id": "uuid",
        "reason": "...",
        "status": "pending",
        "moderation_data": { /* AI results */ },
        "content_snapshot": { /* original content */ },
        "created_at": "2025-01-06T12:00:00Z",
        "post": { /* post details */ },
        "reporter": { /* user details */ }
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 5
    }
  }
}
```

### PUT /api/reports/[id]
Update report status (moderators/admins only).

**Request:**
```json
{
  "status": "resolved",  // pending, reviewing, resolved, dismissed
  "action": "delete_content",  // optional: delete_content, warn_user, none
  "notes": "Content removed for violating guidelines"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "resolved",
    "reviewed_by": "moderator-uuid",
    "reviewed_at": "2025-01-06T13:00:00Z",
    // ... complete report data
  }
}
```

**Actions:**
- `delete_content`: Deletes the reported post/comment
- `warn_user`: (Reserved for future implementation)
- `none`: Just update status without action

## Moderation Categories

The OpenAI Moderation API checks for the following categories:

- **hate**: Content that promotes hate based on identity
- **hate/threatening**: Hateful content with violence or serious harm
- **harassment**: Content that harasses, bullies, or intimidates
- **harassment/threatening**: Harassment with violence or serious harm
- **self-harm**: Content that promotes or encourages self-harm
- **self-harm/intent**: Content where someone expresses intent to self-harm
- **self-harm/instructions**: Content with self-harm instructions
- **sexual**: Sexual content
- **sexual/minors**: Sexual content involving minors
- **violence**: Content depicting violence
- **violence/graphic**: Graphic violent content

## Workflow

### Automatic Moderation Flow

```
User submits post/comment
         ↓
AI moderation check
         ↓
    [Flagged?]
    /        \
  Yes        No
   ↓          ↓
Create      Post
auto-       content
report      (may show
   ↓        warnings)
Reject
submission
```

### Manual Report Flow

```
User reports content
         ↓
Report created (pending)
         ↓
Moderator reviews
         ↓
Update status + take action
         ↓
[resolved/dismissed]
```

## Database Schema Updates

### Reports Table

```sql
reports
  - id (uuid)
  - post_id (uuid, nullable)
  - comment_id (uuid, nullable)
  - reporter_id (uuid)
  - content_type (enum: 'post', 'comment')
  - reason (text)
  - status (enum: 'pending', 'reviewing', 'resolved', 'dismissed')
  - content_snapshot (jsonb) -- Original content at time of report
  - moderation_data (jsonb) -- AI moderation results
  - reviewed_by (uuid, nullable)
  - reviewed_at (timestamp, nullable)
  - created_at (timestamp)
```

## Future Enhancements

### Plagiarism Detection

The system includes placeholder functions for plagiarism detection in `/lib/moderation.ts`:

```typescript
checkPlagiarism(text: string, title?: string): Promise<PlagiarismCheckResult>
```

**Integration Options:**
1. **Copyscape API**: Web content plagiarism detection
2. **Turnitin API**: Academic plagiarism detection
3. **iThenticate**: Professional plagiarism checking
4. **Custom Solution**: Vector embeddings + similarity search using Supabase pgvector

**Implementation Steps:**
1. Choose a plagiarism detection service
2. Add API credentials to environment variables
3. Implement the API calls in `checkPlagiarism()` function
4. Update threshold settings in `checkContent()` function
5. Add UI for plagiarism warnings

### User Warning System

Reserved database field and API parameter for warning users:

```typescript
// In PUT /api/reports/[id]
{
  "action": "warn_user"  // Future implementation
}
```

**Planned Features:**
- Track warnings per user
- Escalating consequences (warning → temp ban → permanent ban)
- User notification system
- Warning history in user profile

### AI Model Fine-tuning

- Train custom models on platform-specific content
- Adjust sensitivity thresholds per category
- Context-aware moderation (e.g., academic discussion vs. harassment)

## Testing

### Test Moderation Endpoint

```bash
# Test with flagged content
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Post",
    "content": "I hate everyone",
    "tags": ["test"]
  }'
```

### Test Manual Reporting

```bash
curl -X POST http://localhost:3000/api/report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content_type": "post",
    "content_id": "POST_UUID",
    "reason": "This content violates community guidelines"
  }'
```

## Best Practices

1. **Configure at least one moderation API** - Don't rely on fail-open behavior
2. **Monitor moderation logs** - Check console for API errors
3. **Review auto-reports regularly** - Some flagged content may be false positives
4. **Adjust thresholds as needed** - Balance safety with false positive rate
5. **Document moderation decisions** - Use the notes field when updating reports
6. **Communicate with users** - Explain why content was flagged
7. **Appeal process** - Allow users to contest moderation decisions

## Troubleshooting

### Content not being moderated
- Check if API keys are configured correctly
- Review console logs for API errors
- Verify environment variables are loaded

### False positives
- Content flagged incorrectly by AI
- Review and dismiss reports as needed
- Consider adjusting thresholds in `/lib/moderation.ts`

### API rate limits
- OpenAI: Monitor usage at platform.openai.com
- Perspective: Check quota at Google Cloud Console
- Implement caching for repeated content checks

## Security Considerations

- **API keys**: Never commit to version control
- **RLS policies**: Ensure proper row-level security on reports table
- **Admin verification**: Always verify moderator/admin role before allowing actions
- **Content snapshots**: Store for audit trail but protect PII
- **Rate limiting**: Consider adding rate limits to report endpoint

## Support

For issues or questions:
- Check console logs for detailed error messages
- Review API documentation: [OpenAI](https://platform.openai.com/docs/guides/moderation) | [Perspective](https://perspectiveapi.com/)
- File an issue in the repository
