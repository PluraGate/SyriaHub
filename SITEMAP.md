# SyriaHub - Site Map

## Application Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         SyriaHub Platform                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     PUBLIC PAGES (No Auth)                        │
├─────────────────────────────────────────────────────────────────┤
│ /                 → Home/Landing Page                            │
│                     - Hero section                                │
│                     - Features overview                           │
│                     - CTA to sign up                             │
│                                                                   │
│ /auth/login       → Login Page                                   │
│ /auth/signup      → Sign Up Page                                 │
│                                                                   │
│ /explore          → Browse/Explore Page (Public)                 │
│                     - Filter by tag/discipline                   │
│                     - Search functionality                        │
│                     - All published posts                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                AUTHENTICATED PAGES (Requires Login)               │
├─────────────────────────────────────────────────────────────────┤
│ /                 → Home/Feed (when logged in)                   │
│                     - Global search bar                          │
│                     - Popular tags cloud                         │
│                     - Recent posts preview                        │
│                     - Link to full feed                          │
│                                                                   │
│ /feed             → Main Feed                                     │
│                     - All posts chronologically                  │
│                     - Tag filtering                              │
│                     - Post cards grid                            │
│                                                                   │
│ /explore          → Explore Page (Enhanced)                       │
│                     - Advanced filtering                         │
│                     - Discipline categories                      │
│                     - Tag selection                              │
│                     - Search integration                         │
│                                                                   │
│ /post/[id]        → Post Detail Page                             │
│                     - Full post content                          │
│                     - Author information                         │
│                     - Tags                                       │
│                     - Related posts (via tags)                   │
│                     - Citation backlinks                         │
│                                                                   │
│ /editor           → Create/Edit Post                             │
│                     - Markdown editor                            │
│                     - Live preview toggle                        │
│                     - Tag input                                  │
│                     - Save draft / Publish                       │
│                                                                   │
│ /profile/[id]     → User Profile                                 │
│                     - User info & bio                            │
│                     - Stats (posts, followers, etc.)             │
│                     - Published posts grid                       │
│                     - Edit profile (own profile)                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN PAGES (Admin/Moderator Only)            │
├─────────────────────────────────────────────────────────────────┤
│ /admin            → Admin Dashboard                              │
│                     - Platform statistics                        │
│                     - User management                            │
│                     - Content moderation                         │
│                     - Report review & actions                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          API ROUTES                               │
├─────────────────────────────────────────────────────────────────┤
│ /api/auth/*       → Authentication endpoints                     │
│ /api/posts/*      → Post CRUD operations                         │
│ /api/comments/*   → Comment operations                           │
│ /api/users/*      → User profile operations                      │
│ /api/tags/*       → Tag management                               │
│ /api/reports/*    → Content reporting                            │
│ /api/citations/*  → Citation management                          │
└─────────────────────────────────────────────────────────────────┘
```

## Navigation Flow

### Unauthenticated User Journey
```
Landing (/) 
    ↓
    ├─→ Sign Up (/auth/signup) → Feed (/feed)
    ├─→ Login (/auth/login) → Feed (/feed)
    └─→ Explore (/explore) → Post Detail (/post/[id])
```

### Authenticated User Journey
```
Home (/) [Feed Preview]
    ↓
    ├─→ Feed (/feed)
    │       ↓
    │       ├─→ Post Detail (/post/[id])
    │       │       ↓
    │       │       ├─→ Related Posts
    │       │       ├─→ Author Profile (/profile/[id])
    │       │       └─→ Tag Search (/explore?tag=...)
    │       │
    │       └─→ Create Post (/editor)
    │
    ├─→ Explore (/explore)
    │       ↓
    │       └─→ Filter by Tag/Discipline
    │
    ├─→ Profile (/profile/[id])
    │       ↓
    │       ├─→ Edit Profile (/settings)
    │       └─→ View Posts
    │
    └─→ Write (/editor)
            ↓
            └─→ Publish → Post Detail
```

### Admin User Journey
```
Admin Panel (/admin)
    ↓
    ├─→ View Reports
    ├─→ Resolve/Dismiss Reports
    ├─→ View User Stats
    └─→ Manage Content
```

## Key Features by Page

### Home (/)
- ✅ Search bar with filters
- ✅ Tags cloud (top 20)
- ✅ Recent posts (6)
- ✅ Conditional rendering (auth/non-auth)

### Explore (/explore)
- ✅ Filter by discipline
- ✅ Filter by tag
- ✅ Search integration
- ✅ Mobile-responsive filters

### Post Detail (/post/[id])
- ✅ Full content display
- ✅ Related posts (via tags)
- ✅ Citation backlinks
- ✅ Author card

### Editor (/editor)
- ✅ Markdown support
- ✅ Preview mode
- ✅ Draft saving
- ✅ Toast feedback

### Profile (/profile/[id])
- ✅ User info display
- ✅ Posts grid
- ✅ Stats display
- ✅ Own profile detection

### Admin (/admin)
- ✅ Dashboard stats
- ✅ Reports management
- ✅ Access control
- ✅ Quick actions

## Component Hierarchy

```
App Layout
├── ToastProvider (Global)
└── Pages
    ├── Navbar (All pages)
    │   ├── Logo
    │   ├── Navigation Links
    │   ├── Dark Mode Toggle
    │   └── Mobile Menu
    │
    ├── Page Content
    │   ├── SearchBar (Home, Explore)
    │   ├── TagsCloud (Home)
    │   ├── PostCard (Feed, Profile, Explore)
    │   ├── RelatedPosts (Post Detail)
    │   ├── CitationBacklinks (Post Detail)
    │   └── Skeleton Loaders (Loading states)
    │
    └── Footer (Most pages)
```

## Data Flow

```
User Action
    ↓
Component State Update
    ↓
Supabase API Call
    ↓
Database Query
    ↓
Response
    ↓
State Update
    ↓
UI Update + Toast (if applicable)
```

## Mobile Responsiveness

All pages implement:
- ✅ Responsive grid layouts
- ✅ Collapsible navigation
- ✅ Touch-friendly tap targets
- ✅ Optimized content stacking
- ✅ Mobile-first design approach

## Performance Optimizations

- Server-side rendering (Next.js App Router)
- Debounced search (300ms)
- Lazy loading ready
- Optimized database queries
- Skeleton loading states
- Toast notification pooling
