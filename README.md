# Syrealize (SyriaHub)

A minimalist, mobile-first research platform built with Next.js 14, Tailwind CSS, Shadcn UI, and Supabase.

## Features

- 🔐 **Email Authentication** - Secure user authentication with Supabase Auth
- 📝 **Post Creation** - Clean, distraction-free post editor
- 👤 **User Profiles** - Dynamic profile pages with user posts
- 🏷️ **Tag System** - Organize and discover posts by tags
- 📱 **Mobile-First Design** - Responsive UI optimized for all devices
- ⚡ **Fast Load Times** - Optimized for performance with Next.js 14+ App Router
- ♿ **Accessible** - Built with accessibility best practices
- 🎨 **Minimalist UI** - Clean, focused interface powered by Shadcn UI
- 🔍 **Dynamic Routes** - Post and profile pages with dynamic routing
- 🛡️ **Role-Based Access Control** - User, Moderator, and Admin roles (NEW!)
- 🔒 **Secure API** - RESTful API with JWT authentication and authorization (NEW!)
- 💬 **Comments System** - Threaded discussions on posts (NEW!)
- 🚩 **Content Moderation** - Report system for community safety (NEW!)
- 🤖 **AI Moderation** - Automated content scanning with OpenAI/Perspective API (NEW!)
- 🔗 **Citations** - Academic post-to-post referencing (NEW!)

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **API**: RESTful with RBAC middleware (NEW!)
- **Language**: TypeScript (strict mode)
- **Node Version**: 20+
- **Deployment**: Vercel-ready (Edge Runtime compatible)

## Environment Variables

Configure the same variables locally and in Vercel. The `.env.example` file lists every supported flag.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL (Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `OPENAI_API_KEY` | ⚠️ | Enables AI-powered moderation (leave unset to disable) |
| `PERSPECTIVE_API_KEY` | optional | Alternative moderation provider |

When deploying to Vercel, add the same variables in **Project Settings → Environment Variables** for the `Development`, `Preview`, and `Production` environments.

## Getting Started

### Prerequisites

- Node.js 20+ installed
- A Supabase account and project ([supabase.com](https://supabase.com))
- npm or pnpm package manager
- Git for version control

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lAvArt/SyriaHub.git
cd SyriaHub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=sk-your-openai-api-key  # For AI moderation
```

See `.env.example` for all available configuration options.

4. Set up the database:

**Option A: Automated Setup (Recommended)**
```bash
# Windows PowerShell
cd supabase
.\setup.ps1

# macOS/Linux
cd supabase
chmod +x setup.sh
./setup.sh
```

**Option B: Manual Setup**
   - Install Supabase CLI (see instructions below)
   - For local development: `supabase start`
   - For remote: `supabase link --project-ref YOUR_PROJECT_REF`
   - Apply migrations: `supabase db push` or `supabase db reset` (local)
   - See `supabase/README.md` for detailed instructions

### Installing Supabase CLI

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

5. Enable Supabase Auth:
   - Go to your Supabase project dashboard
   - Navigate to Authentication → Providers
   - Enable Email provider
   - Configure email templates (optional)

6. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## GitHub Repository Setup

If you need to set up a new GitHub repository named `syrealize-web`:

1. Create a new repository on GitHub:
   - Go to [github.com/new](https://github.com/new)
   - Repository name: `syrealize-web`
   - Description: "Syrealize - A minimalist research platform"
   - Choose Public or Private
   - Do NOT initialize with README (already exists)

2. Push your local repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/syrealize-web.git
   git branch -M main
   git push -u origin main
   ```

Replace `YOUR_USERNAME` with your GitHub username.

## Database Schema

The platform uses a comprehensive PostgreSQL schema with Row Level Security (RLS). See `supabase/README.md` for complete documentation.

### Core Tables

1. **users** - Extended user profiles (linked to `auth.users`)
   - Stores: name, email, role, bio, affiliation
   - Roles: researcher (default), moderator, admin

2. **posts** - Research posts and articles
   - Supports: title, content, tags array, author_id
   - Auto-updates: created_at, updated_at timestamps

3. **comments** - Comments on posts
   - Links: user_id, post_id

4. **reports** - Content moderation system
   - Status: pending, reviewing, resolved, dismissed
   - Links: post_id, reporter_id

5. **roles** - Role definitions with JSONB permissions

6. **citations** - Post-to-post citations/references

7. **tags** - Content categorization
   - Includes: label, discipline, color

### Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Automatic user profile creation on signup
- ✅ Auto-updating timestamps
- ✅ Role-based access control
- ✅ Pre-seeded tags and roles
- ✅ Helper views for statistics

For detailed schema documentation, migration instructions, and queries, see:
**📚 [supabase/README.md](supabase/README.md)**

## API Endpoints

Complete RESTful API with Role-Based Access Control (RBAC):

### Available Endpoints
- **Authentication**: `/api/auth/*` - Login, signup, logout, user info
- **Posts**: `/api/posts/*` - CRUD operations with filtering and search
- **Comments**: `/api/comments/*` - Create and manage comments
- **Reports**: `/api/reports/*` - Content moderation system (moderators)
- **Users**: `/api/users/*` - User management (admins)
- **Roles**: `/api/roles/*` - Role management (admins)
- **Tags**: `/api/tags/*` - Tag management
- **Citations**: `/api/citations/*` - Academic references

### Role Permissions
- **Researcher** (default): Create/manage own content
- **Moderator**: Review reports, moderate all content, manage tags
- **Admin**: Full system access, user management, role management

For complete API documentation with examples:
**📚 [API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

## Deployment on Vercel

### 1. Connect the GitHub repository
- Push your work to GitHub (`git remote add origin` if needed).
- In Vercel, click **New Project → Import Git Repository**, choose `lAvArt/SyriaHub`, and grant access.

### 2. Configure environment variables
- In **Settings → Environment Variables**, add the variables listed in the [Environment Variables](#environment-variables) table.
- Repeat the setup for `Development`, `Preview`, and `Production` scopes so preview builds behave the same way as production.

### 3. Enable preview deployments
- Vercel automatically builds a preview for every pull request/branch once the repo is linked.
- Branch protection tip: require the **CI** workflow (lint + typecheck) to pass before merging.

### 4. Enable analytics & caching
- Vercel Analytics runs automatically thanks to `@vercel/analytics` in `app/layout.tsx`.
- CDN caching headers are managed via `vercel.json` and API helpers so static assets and selected `/api` responses are cached safely.

### 5. Verify API routes
- The **API Smoke Test** workflow (`.github/workflows/api-smoke-test.yml`) runs whenever Vercel reports a successful deployment and pings `/api/health`.
- You can run the same check locally with PowerShell: `Invoke-WebRequest https://<your-domain>/api/health | Select-Object -Expand Content`.

### 6. Trigger a deployment
- Push to `main` for production or any branch for a preview deployment—Vercel handles the rest.
- Optional: attach a custom domain in **Settings → Domains** after the first deploy.

## Continuous Integration

- **Lint & Type Check**: `.github/workflows/ci.yml` runs `npm run lint` and `npm run typecheck` on pushes to `main` and `feature/**` branches and on every pull request.
- **API Smoke Test**: `.github/workflows/api-smoke-test.yml` curls the deployed `/api/health` endpoint after Vercel reports a successful deployment.
- Local parity: run `npm ci && npm run lint && npm run typecheck` before committing to match CI behaviour.

## Project Structure

```
├── app/
│   ├── auth/              # Authentication pages (login, signup, signout)
│   ├── editor/            # Post editor page
│   ├── feed/              # Post feed page
│   ├── post/
│   │   └── [id]/          # Dynamic post detail page
│   ├── profile/
│   │   └── [id]/          # Dynamic user profile page
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Landing page with hero section
├── components/
│   └── ui/                # Shadcn UI components (future additions)
├── lib/
│   ├── supabase/          # Supabase client configuration (server, client, middleware)
│   └── utils.ts           # Utility functions (cn helper for Tailwind)
├── styles/                # Additional stylesheets (if needed)
├── types/
│   └── index.ts           # TypeScript type definitions (User, Post, Profile)
├── supabase/
│   └── migrations/        # Database migrations
├── components.json        # Shadcn UI configuration
├── middleware.ts          # Next.js middleware for auth
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Features Roadmap

- [x] Landing page with hero section
- [x] Email authentication (login/signup)
- [x] Post feed with tag filtering
- [x] Post editor with tag support
- [x] Mobile-first responsive design
- [x] Vercel deployment ready
- [x] Dynamic post detail pages (`/post/[id]`)
- [x] Dynamic user profile pages (`/profile/[id]`)
- [x] Shadcn UI integration
- [x] Lucide Icons integration
- [x] TypeScript types for User, Post, Profile
- [ ] Post editing functionality
- [ ] User profile editing
- [ ] Search functionality
- [ ] Comments on posts
- [ ] Bookmarking posts
- [ ] Shadcn UI components (Button, Card, etc.)

## Adding Shadcn UI Components

To add Shadcn UI components to your project:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
# ... add other components as needed
```

Components will be added to `components/ui/` and are fully customizable.

## Troubleshooting

### Middleware/Proxy Deprecation Warning

**Note:** As of Next.js 15+, `middleware.ts` has been renamed to `proxy.ts`. This project uses the new `proxy.ts` convention.

If you see a warning about middleware:

```
⚠ The 'middleware' file convention is deprecated. Please use 'proxy' instead.
```

This means the migration is complete. Clear the cache to remove the warning:
1. Clear Next.js cache: `Remove-Item -Recurse -Force .next` (Windows) or `rm -rf .next` (macOS/Linux)
2. Restart dev server: `npm run dev`

### Common Issues

**Authentication not working:**
- Verify environment variables in `.env.local`
- Check Supabase Email provider is enabled
- Clear browser cookies and try again

**Database errors:**
- Run migrations: `cd supabase && .\setup.ps1` (Windows) or `./setup.sh` (macOS/Linux)
- Verify Supabase connection in dashboard
- Check RLS policies are applied

**API routes returning 401:**
- Ensure you're logged in (check session cookie)
- Verify JWT token is being sent in requests
- Check user role permissions match required role

**Build errors:**
- Clear `.next` folder: `Remove-Item -Recurse -Force .next`
- Delete `node_modules` and reinstall: `Remove-Item -Recurse -Force node_modules; npm install`
- Verify Next.js version: `npm list next` (should be 16.0.1+)

For more detailed troubleshooting, see the documentation files:
- `MIDDLEWARE_UPDATE.md` - Middleware configuration
- `API_DOCUMENTATION.md` - API usage and errors
- `MODERATION_DOCUMENTATION.md` - AI moderation setup and troubleshooting
- `supabase/README.md` - Database setup issues

## Contributing

- Read `CONTRIBUTING.md` for branching, commit, and code-style conventions.
- Run `npm run lint` and `npm run typecheck` before opening a pull request so CI succeeds on the first try.
- Use the provided `test-api.ps1` / `test-api.sh` scripts to spot-check critical endpoints against a deployed environment.
- Open an issue for larger changes so we can plan the database and Supabase migrations together.

## License

This project is open source and available under the [MIT License](LICENSE).
