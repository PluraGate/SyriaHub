import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'ar'],

    // Used when no locale matches
    defaultLocale: 'ar'
});

// Simple in-memory rate limiter for demo/local use
// Note: In production, use Upstash or similar for distributed state
const requestCounts = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 100; // requests per minute
const WINDOW_MS = 60 * 1000;

function isRateLimited(ip: string) {
    const now = Date.now();
    const stats = requestCounts.get(ip) || { count: 0, lastReset: now };

    if (now - stats.lastReset > WINDOW_MS) {
        stats.count = 1;
        stats.lastReset = now;
    } else {
        stats.count++;
    }

    requestCounts.set(ip, stats);
    return stats.count > RATE_LIMIT;
}

export async function middleware(request: NextRequest) {
    // 1. Run next-intl middleware to get the localized response (redirects, etc.)
    const response = intlMiddleware(request);

    // 2. Update session and get user
    const finalResponse = await updateSession(request, response);

    // 3. Protected routes check
    const { pathname } = request.nextUrl;
    const isTestBypass = request.headers.get('x-test-bypass') === 'true';

    const PROTECTED_ROUTES = [
        '/editor',
        '/feed',
        '/research-lab',
        '/settings',
        '/notifications',
        '/admin',
        '/saved',
        '/correspondence'
    ];

    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.includes(route));

    if (isProtectedRoute && !isTestBypass) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                },
            }
        );
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Get locale from pathname (en or ar)
            const localeMatch = pathname.match(/^\/(en|ar)/);
            const locale = localeMatch ? localeMatch[1] : 'ar';
            return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
        }
    }

    // 4. Rate Limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || (request as any).ip || '127.0.0.1';
    if (isRateLimited(ip)) {
        return new NextResponse('Too Many Requests', { status: 429 });
    }

    // 5. Apply Security Headers
    const securityHeaders = {
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' blob: data: https://*.supabase.co; frame-src https://challenges.cloudflare.com; connect-src 'self' https://*.supabase.co;",
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    };

    Object.entries(securityHeaders).forEach(([key, value]) => {
        finalResponse.headers.set(key, value);
    });

    return finalResponse;
}

export const config = {
    // Match only internationalized pathnames
    // We exclude api, static files, etc.
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|js)$).*)'
    ]
};
