# Syrealize

A minimalist, mobile-first research platform built with Next.js, Tailwind CSS, and Supabase.

## Features

- 🔐 **Email Authentication** - Secure user authentication with Supabase Auth
- 📝 **Post Creation** - Clean, distraction-free post editor
- 🏷️ **Tag System** - Organize and discover posts by tags
- 📱 **Mobile-First Design** - Responsive UI optimized for all devices
- ⚡ **Fast Load Times** - Optimized for performance with Next.js 14+
- ♿ **Accessible** - Built with accessibility best practices
- 🎨 **Minimalist UI** - Clean, focused interface for clarity

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Language**: TypeScript
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- npm or yarn package manager

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
```

4. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Copy and run the SQL from `supabase/migrations/20250101000000_initial_schema.sql`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The platform uses a simple schema with one main table:

### Posts Table
- `id`: UUID (Primary Key)
- `title`: Text
- `content`: Text
- `tags`: Text Array
- `author_id`: UUID (Foreign Key to auth.users)
- `author_email`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

Row Level Security (RLS) is enabled with policies for:
- Public read access
- Authenticated users can create posts
- Users can update/delete their own posts

## Deployment on Vercel

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com) and import your repository

3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy! Vercel will automatically build and deploy your app

## Project Structure

```
├── app/
│   ├── auth/           # Authentication pages
│   ├── feed/           # Post feed page
│   ├── editor/         # Post editor page
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing page
├── components/         # Reusable components (future)
├── lib/
│   └── supabase/      # Supabase client configuration
├── supabase/
│   └── migrations/    # Database migrations
└── public/            # Static assets
```

## Features Roadmap

- [x] Landing page with hero section
- [x] Email authentication (login/signup)
- [x] Post feed with tag filtering
- [x] Post editor with tag support
- [x] Mobile-first responsive design
- [x] Vercel deployment ready
- [ ] Post editing functionality
- [ ] User profiles
- [ ] Search functionality
- [ ] Comments on posts
- [ ] Bookmarking posts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
