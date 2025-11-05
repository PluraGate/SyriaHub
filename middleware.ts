import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Middleware for Supabase Auth session management
 * Runs on all routes except static assets and API routes
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

/**
 * Next.js 15+ middleware configuration
 * Excludes static files, images, and API routes from middleware processing
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     * - api routes (handled by route handlers)
     * - static image files
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
