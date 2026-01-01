# SyriaHub Setup Guide

This guide will help you set up the SyriaHub project from scratch.

## Prerequisites Checklist

- [ ] Node.js 20+ installed (`node --version`)
- [ ] Git installed (`git --version`)
- [ ] Supabase account created
- [ ] GitHub account (for deployment)
- [ ] Vercel account (for hosting)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14+
- React 19
- TypeScript
- Tailwind CSS
- Supabase JS Client
- Lucide React Icons
- Shadcn UI utilities

### 2. Configure Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully set up
3. Navigate to **Project Settings** → **API**
4. Copy your project URL and anon/public key
5. Create `.env.local` file in the root:

```bash
cp .env.example .env.local
```

6. Update `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 3. Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase/migrations/20250101000000_initial_schema.sql`
3. Copy the entire SQL content
4. Paste and run it in the SQL Editor
5. Verify tables are created in **Table Editor**

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Test Authentication

1. Click "Get Started" or "Sign Up"
2. Create a test account
3. Check your email for verification (if email auth is enabled)
4. Try logging in and creating a post

## Project Structure Overview

```
syrealize/
├── app/                    # Next.js App Router
│   ├── auth/              # Auth pages (login, signup, signout)
│   ├── editor/            # Post editor
│   ├── feed/              # Post feed
│   ├── post/[id]/         # Dynamic post pages
│   ├── profile/[id]/      # Dynamic profile pages
│   └── page.tsx           # Landing page
├── components/            # React components
│   └── ui/               # Shadcn UI components
├── lib/                  # Utilities
│   ├── supabase/        # Supabase clients
│   └── utils.ts         # Helper functions
├── styles/              # Additional styles
├── types/               # TypeScript definitions
└── supabase/           # Database migrations
```

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |

## Deployment to Vercel

### Method 1: GitHub Integration (Recommended)

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Click **New Project**
4. Import your GitHub repository
5. Vercel auto-detects Next.js
6. Add environment variables in Vercel dashboard
7. Click **Deploy**

### Method 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

Follow the prompts and add environment variables when asked.

## Adding Shadcn UI Components

The project is configured for Shadcn UI. Add components as needed:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add dialog
```

Components are added to `components/ui/` and are fully customizable.

## Using Lucide Icons

Icons are available from `lucide-react`:

```tsx
import { Home, User, Settings, LogOut } from 'lucide-react'

<Home className="w-5 h-5" />
<User className="w-6 h-6 text-blue-600" />
```

Browse all icons at [lucide.dev](https://lucide.dev)

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000 (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Supabase Connection Issues

- Verify `.env.local` has correct credentials
- Check Supabase project is not paused
- Ensure URL includes `https://`

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### TypeScript Errors

```bash
# Check TypeScript configuration
npx tsc --noEmit
```

## Next Steps

1. ✅ Set up the project
2. ✅ Configure Supabase
3. ✅ Run development server
4. 📝 Customize the landing page
5. 🎨 Add more Shadcn UI components
6. 🚀 Deploy to Vercel
7. 🔧 Set up custom domain

## Need Help?

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)

## License

MIT License - See LICENSE file for details
