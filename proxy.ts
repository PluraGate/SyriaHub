import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Proxy for Supabase Auth session management
 * Runs on all routes except static assets and API routes
 * 
 * Note: Renamed from middleware.ts to proxy.ts in Next.js 15+
 * The term "proxy" better represents the network boundary functionality.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

/**
 * Next.js 15+ proxy configuration
 * Excludes static files, images, and API routes from proxy processing
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
