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
   - `post_id` (FK to posts, nullable), `comment_id` (FK to comments, nullable)
   - `content_type` (enum: 'post', 'comment')
   - `reporter_id` (FK to users), `reviewed_by` (FK to users, nullable)
   - `content_snapshot` (JSONB), `moderation_data` (JSONB)
   - Status: pending, reviewing, resolved, dismissed
   - Timestamps: `created_at`, `reviewed_at`

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

**Automated (Recommended)**:
```bash
# Windows
.\migrate-moderation.ps1

# macOS/Linux
chmod +x migrate-moderation.sh
./migrate-moderation.sh
```

**Manual**:
```bash
# Apply migrations
supabase db push

# Or for local development
supabase db reset
```

**Migration Files**:
- `20250101000000_initial_schema.sql` - Base schema
- `20250101000001_seed_data.sql` - Sample data
- `20250106000000_add_moderation_fields.sql` - AI moderation fields

### 3. Enable Auth

In your Supabase dashboard:
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set up password requirements

### 4. Configure Auth URLs (CRITICAL for Production)

⚠️ **This is essential for email confirmation links to redirect correctly!**

In your Supabase dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Set the following:

   | Setting | Development | Production |
   |---------|-------------|------------|
   | **Site URL** | `http://localhost:3000` | `https://syriahub.org` |
   | **Redirect URLs** | `http://localhost:3000/**` | `https://syriahub.org/**` |

3. Add additional redirect URLs if needed:
   - `https://syriahub.org/auth/callback`
   - `https://syriahub.org/onboarding`
   - `https://www.syriahub.org/**` (if using www subdomain)

### 5. Customize Email Templates (CRITICAL for Branding)

To customize Supabase's confirmation emails:

1. Go to **Authentication** → **Email Templates**
2. Edit the **Confirm signup** template:
   - Subject: `Confirm your SyriaHub account`
   - HTML body (example):
   ```html
   <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111827;padding:40px 20px;">
     <tr>
       <td>
         <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#1f2937;border-radius:12px;overflow:hidden;">
           <!-- Header with PluraGate branding -->
           <tr>
             <td style="padding:32px 40px 24px;border-bottom:1px solid #374151;">
               <span style="color:#1e7a6e;font-size:28px;font-weight:700;">PluraGate</span>
             </td>
           </tr>
           <!-- Content -->
           <tr>
             <td style="padding:32px 40px;">
               <p style="font-size:16px;color:#e5e7eb;line-height:1.6;margin:0 0 24px;">Hello,</p>
               
               <p style="font-size:16px;color:#e5e7eb;line-height:1.6;margin:0 0 24px;">
                 Thank you for signing up for <strong style="color:#fff;">SyriaHub</strong>. Please confirm your email address to complete your registration.
               </p>

               <div style="background-color:#374151;border:1px solid #4b5563;padding:20px;border-radius:8px;margin-bottom:24px;">
                 <p style="font-size:16px;color:#e5e7eb;line-height:1.6;margin:0 0 16px;">
                   SyriaHub is part of the <strong style="color:#fff;">PluraGate</strong> network, a shared infrastructure for independent knowledge initiatives.
                 </p>
                 <p style="font-size:15px;color:#9ca3af;line-height:1.6;margin:0;">
                   The network provides governance and technical continuity, allowing initiatives like SyriaHub to retain their specific scope and autonomy.
                 </p>
               </div>

               <!-- CTA Button - Table-based for email client compatibility -->
               <table cellpadding="0" cellspacing="0" border="0" style="margin:32px auto;text-align:center;">
                 <tr>
                   <td style="border-radius:8px;background-color:#1e7a6e;" bgcolor="#1e7a6e">
                     <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;">Confirm Email</a>
                   </td>
                 </tr>
               </table>

               <p style="font-size:13px;color:#6b7280;text-align:center;margin:24px 0 0;">
                 If the button does not work, copy and paste the following link into your browser:
               </p>
               <p style="font-size:12px;color:#1e7a6e;word-break:break-all;text-align:center;background-color:#374151;padding:12px;border-radius:6px;margin-top:8px;">
                 {{ .ConfirmationURL }}
               </p>
             </td>
           </tr>
           <!-- Footer -->
           <tr>
             <td style="padding:24px 40px;background-color:#111827;border-top:1px solid #374151;text-align:center;">
               <p style="margin:0;font-size:12px;color:#6b7280;">© 2025 PluraGate Network</p>
               <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">A network of independent knowledge initiatives</p>
             </td>
           </tr>
         </table>
       </td>
     </tr>
   </table>
   ```

3. **Important**: The `{{ .ConfirmationURL }}` variable is provided by Supabase and includes the redirect back to your site based on the Site URL setting above.

4. **Other Email Templates** - Apply the same dark theme pattern to these:

#### Reset Password Template
- Subject: `Reset your SyriaHub password`
```html
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111827;padding:40px 20px;">
  <tr>
    <td>
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#1f2937;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid #374151;">
            <span style="color:#1e7a6e;font-size:28px;font-weight:700;">PluraGate</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="font-size:16px;color:#e5e7eb;line-height:1.6;margin:0 0 24px;">Hello,</p>
            <p style="font-size:16px;color:#e5e7eb;line-height:1.6;margin:0 0 24px;">
              We received a request to reset your password for your <strong style="color:#fff;">SyriaHub</strong> account. Click the button below to set a new password.
            </p>
            <table cellpadding="0" cellspacing="0" border="0" style="margin:32px auto;text-align:center;">
              <tr>
                <td style="border-radius:8px;background-color:#1e7a6e;" bgcolor="#1e7a6e">
                  <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;">Reset Password</a>
                </td>
              </tr>
            </table>
            <p style="font-size:13px;color:#9ca3af;text-align:center;margin:24px 0 0;">
              If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;background-color:#111827;border-top:1px solid #374151;text-align:center;">
            <p style="margin:0;font-size:12px;color:#6b7280;">© 2025 PluraGate Network</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

#### Magic Link Template
- Subject: `Sign in to SyriaHub`
```html
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111827;padding:40px 20px;">
  <tr>
    <td>
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#1f2937;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid #374151;">
            <span style="color:#1e7a6e;font-size:28px;font-weight:700;">PluraGate</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="font-size:16px;color:#e5e7eb;line-height:1.6;margin:0 0 24px;">Hello,</p>
            <p style="font-size:16px;color:#e5e7eb;line-height:1.6;margin:0 0 24px;">
              Click the button below to sign in to your <strong style="color:#fff;">SyriaHub</strong> account. This link expires in 1 hour.
            </p>
            <table cellpadding="0" cellspacing="0" border="0" style="margin:32px auto;text-align:center;">
              <tr>
                <td style="border-radius:8px;background-color:#1e7a6e;" bgcolor="#1e7a6e">
                  <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;">Sign In</a>
                </td>
              </tr>
            </table>
            <p style="font-size:13px;color:#9ca3af;text-align:center;margin:24px 0 0;">
              If you didn't request this link, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;background-color:#111827;border-top:1px solid #374151;text-align:center;">
            <p style="margin:0;font-size:12px;color:#6b7280;">© 2025 PluraGate Network</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

#### Change Email Template
- Subject: `Confirm your new email address`
```html
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111827;padding:40px 20px;">
  <tr>
    <td>
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#1f2937;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid #374151;">
            <span style="color:#1e7a6e;font-size:28px;font-weight:700;">PluraGate</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="font-size:16px;color:#e5e7eb;line-height:1.6;margin:0 0 24px;">Hello,</p>
            <p style="font-size:16px;color:#e5e7eb;line-height:1.6;margin:0 0 24px;">
              Please confirm your new email address for your <strong style="color:#fff;">SyriaHub</strong> account by clicking the button below.
            </p>
            <table cellpadding="0" cellspacing="0" border="0" style="margin:32px auto;text-align:center;">
              <tr>
                <td style="border-radius:8px;background-color:#1e7a6e;" bgcolor="#1e7a6e">
                  <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;">Confirm Email</a>
                </td>
              </tr>
            </table>
            <p style="font-size:13px;color:#9ca3af;text-align:center;margin:24px 0 0;">
              If you didn't make this change, please contact support immediately.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;background-color:#111827;border-top:1px solid #374151;text-align:center;">
            <p style="margin:0;font-size:12px;color:#6b7280;">© 2025 PluraGate Network</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

#### Invite User Template
- Subject: `You're invited to join SyriaHub`
```html
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111827;padding:40px 20px;">
  <tr>
    <td>
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#1f2937;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid #374151;">
            <span style="color:#1e7a6e;font-size:28px;font-weight:700;">PluraGate</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="font-size:16px;color:#e5e7eb;line-height:1.6;margin:0 0 24px;">Hello,</p>
            <p style="font-size:16px;color:#e5e7eb;line-height:1.6;margin:0 0 24px;">
              You've been invited to join <strong style="color:#fff;">SyriaHub</strong>, a platform for research, documentation, and collaborative knowledge focused on Syria.
            </p>
            <div style="background-color:#374151;border:1px solid #4b5563;padding:20px;border-radius:8px;margin-bottom:24px;">
              <p style="font-size:16px;color:#e5e7eb;line-height:1.6;margin:0;">
                SyriaHub is part of the <strong style="color:#fff;">PluraGate</strong> network, a shared infrastructure for independent knowledge initiatives.
              </p>
            </div>
            <table cellpadding="0" cellspacing="0" border="0" style="margin:32px auto;text-align:center;">
              <tr>
                <td style="border-radius:8px;background-color:#1e7a6e;" bgcolor="#1e7a6e">
                  <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;">Accept Invitation</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;background-color:#111827;border-top:1px solid #374151;text-align:center;">
            <p style="margin:0;font-size:12px;color:#6b7280;">© 2025 PluraGate Network</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

### 6. Create Test Users

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

### 7. Seed Sample Data (Optional)

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
