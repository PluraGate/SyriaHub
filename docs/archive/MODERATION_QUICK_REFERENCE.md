# AI Moderation Quick Reference

## Setup Checklist

- [ ] Add OpenAI API key to `.env.local` (or Perspective API key)
- [ ] Run database migration: `supabase db push`
- [ ] Test moderation with sample content
- [ ] Configure moderator accounts

## Key Files

### Core Moderation
- `lib/moderation.ts` - AI moderation logic
- `supabase/migrations/20250106000000_add_moderation_fields.sql` - Database schema

### API Routes
- `app/api/posts/route.ts` - Post creation with moderation
- `app/api/comments/route.ts` - Comment creation with moderation
- `app/api/report/route.ts` - Manual content reporting
- `app/api/reports/[id]/route.ts` - Admin moderation actions

### Types
- `types/index.ts` - TypeScript interfaces

## Common Tasks

### Check if Content Will Be Flagged
```typescript
import { checkContent } from '@/lib/moderation'

const result = await checkContent('Text to check')
console.log(result.shouldBlock) // true if content will be rejected
console.log(result.warnings) // Array of warning messages
```

### Manually Report Content
```bash
POST /api/report
{
  "content_type": "post",
  "content_id": "uuid",
  "reason": "Violates community guidelines"
}
```

### Review Pending Reports (Admin)
```bash
GET /api/reports?status=pending
```

### Resolve a Report (Admin)
```bash
PUT /api/reports/{report-id}
{
  "status": "resolved",
  "action": "delete_content"
}
```

## Moderation Response Codes

### Post/Comment Creation
- `201` - Content created successfully
- `422` - Content rejected (moderation flagged)
- `422` with warnings - Content allowed but flagged

### Report Creation
- `201` - Report submitted
- `422` - Invalid report (duplicate, own content, etc.)
- `404` - Content not found

### Report Management (Admin)
- `200` - Report updated
- `403` - Not authorized (not moderator/admin)
- `404` - Report not found

## Status Flow

```
pending → reviewing → resolved/dismissed
```

## Actions Available

- `none` - Update status only
- `delete_content` - Remove the reported post/comment
- `warn_user` - (Future: send warning to user)

## Environment Variables

```bash
# Required (at least one)
OPENAI_API_KEY=sk-...
PERSPECTIVE_API_KEY=...

# Future
COPYSCAPE_API_KEY=...
TURNITIN_API_KEY=...
```

## Thresholds

Current blocking triggers:
- Any category flagged by OpenAI Moderation API
- Perspective API score > 0.7 (customizable in `lib/moderation.ts`)
- Plagiarism score > 0.8 (when implemented)

## Testing

### Test Offensive Content
```typescript
// This will likely be flagged
const text = "I hate you"
```

### Test Clean Content
```typescript
// This should pass
const text = "Great research on Syrian archaeology"
```

## Troubleshooting

**Content not being moderated?**
- Check API keys in `.env.local`
- Look for errors in console
- Verify migration was applied

**False positives?**
- Review the report in admin panel
- Dismiss if incorrect
- Consider adjusting thresholds

**API errors?**
- Check API key validity
- Monitor rate limits
- Review API service status

## Next Steps

1. **Add UI Components**
   - Report button on posts/comments
   - Moderation queue UI for admins
   - User warning displays

2. **Implement Plagiarism Detection**
   - Choose service (Copyscape, Turnitin, custom)
   - Update `checkPlagiarism()` in `lib/moderation.ts`
   - Configure API keys

3. **User Warning System**
   - Track warnings per user
   - Implement escalation policies
   - Add notification system

4. **Analytics**
   - Track moderation metrics
   - False positive rate
   - Response times

## Support

See full documentation: `MODERATION_DOCUMENTATION.md`
