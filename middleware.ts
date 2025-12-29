import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'ar'],

    // Used when no locale matches
    defaultLocale: 'ar'
});

export async function middleware(request: NextRequest) {
    // 1. Run next-intl middleware to get the localized response (redirects, etc.)
    const response = intlMiddleware(request);

    // 2. Pass the response to Supabase middleware to handle auth session
    // Note: updateSession now accepts an optional response object
    return await updateSession(request, response);
}

export const config = {
    // Match only internationalized pathnames
    // We exclude api, static files, etc.
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|js)$).*)'
    ]
};
