# SyriaHub - Quick Start

Get up and running with SyriaHub in 5 minutes!

## Prerequisites

✅ Node.js 20+ installed  
✅ Supabase account created  

## Quick Setup

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

### 3️⃣ Set Up Database
1. Open Supabase Dashboard → SQL Editor
2. Run `supabase/migrations/20250101000000_initial_schema.sql`

### 4️⃣ Start Development Server
```bash
npm run dev
```

Visit **http://localhost:3000** 🎉

## Next Steps

- 📖 Read [SETUP.md](./SETUP.md) for detailed instructions
- 🚀 Deploy to [Vercel](https://vercel.com)
- 🎨 Add Shadcn UI components: `npx shadcn@latest add button`
- 📝 Check [CONTRIBUTING.md](./CONTRIBUTING.md) to contribute

## Project Overview

```
/app           → Pages (landing, auth, feed, editor, profiles)
/components    → Reusable UI components
/lib           → Utilities and Supabase clients
/types         → TypeScript type definitions
/styles        → Additional stylesheets
```

## Key Features

✨ Next.js 14 App Router  
✨ TypeScript  
✨ Tailwind CSS  
✨ Shadcn UI  
✨ Lucide Icons  
✨ Supabase Auth & Database  
✨ Dynamic Routes (`/post/[id]`, `/profile/[id]`)  
✨ Vercel-Ready  

## Helpful Commands

```bash
npm run dev     # Start dev server
npm run build   # Build for production
npm run lint    # Run linter
```

## Need Help?

Check out the detailed [SETUP.md](./SETUP.md) guide!
