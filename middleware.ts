import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Generate a cryptographic nonce for CSP
 * Uses Web Crypto API available in Edge runtime
 */
function createNonce(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes)).replace(/=+$/g, '');
}

const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'ar'],

    // Used when no locale matches
    defaultLocale: 'ar'
});

// Simple in-memory rate limiter for demo/local use
// LIMITATIONS:
// - Per-instance only (not shared across serverless instances)
// - Resets on deploy/cold-start
// - Does NOT apply to /api routes (excluded by matcher below)
// In production, use Upstash, Redis, or Vercel's built-in rate limiting
const requestCounts = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 100; // requests per minute
const WINDOW_MS = 60 * 1000;
const MAX_TRACKED_IPS = 10000; // Prevent unbounded memory growth

function isRateLimited(ip: string) {
    const now = Date.now();

    // Cleanup: Remove expired entries if map is getting large
    if (requestCounts.size > MAX_TRACKED_IPS) {
        for (const [key, value] of requestCounts.entries()) {
            if (now - value.lastReset > WINDOW_MS) {
                requestCounts.delete(key);
            }
        }
        // If still too large after cleanup, clear oldest half
        if (requestCounts.size > MAX_TRACKED_IPS) {
            const entries = Array.from(requestCounts.entries());
            entries.sort((a, b) => a[1].lastReset - b[1].lastReset);
            entries.slice(0, Math.floor(entries.length / 2)).forEach(([key]) => {
                requestCounts.delete(key);
            });
        }
    }

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
    const { pathname } = request.nextUrl;
    
    // Generate nonce for CSP
    const nonce = createNonce();
    
    // 0. Coming Soon Mode Gate
    // When SYRIAHUB_MODE=coming-soon, redirect ALL routes to /coming-soon
    // Exception: the coming-soon page itself, static assets, and API routes
    const isComingSoonMode = process.env.SYRIAHUB_MODE === 'coming-soon';
    const isComingSoonPage = pathname.includes('/coming-soon');
    
    if (isComingSoonMode && !isComingSoonPage) {
        // Extract locale from pathname or default to 'ar'
        const localeMatch = pathname.match(/^\/(en|ar)/);
        const locale = localeMatch ? localeMatch[1] : 'ar';
        return NextResponse.redirect(new URL(`/${locale}/coming-soon`, request.url));
    }

    // 1. Run next-intl middleware to get the localized response (redirects, etc.)
    const response = intlMiddleware(request);

    // 2. Update session and get user
    const finalResponse = await updateSession(request, response);
    
    // 3. Protected routes check
    // SECURITY: Only allow test bypass in development environment
    const isTestBypass = process.env.NODE_ENV === 'development' && request.headers.get('x-test-bypass') === 'true';

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

    // 5. Apply Security Headers with nonce-based CSP
    // Nonce enables strict CSP without unsafe-inline
    // strict-dynamic allows trusted scripts to load additional scripts
    const csp = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com https://va.vercel-scripts.com`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' blob: data: https://*.supabase.co https://*.tile.openstreetmap.org https://*.openstreetmap.org https://cdnjs.cloudflare.com",
        "frame-src https://challenges.cloudflare.com",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.tile.openstreetmap.org https://*.openstreetmap.org",
        "object-src 'none'",
    ].join('; ');

    // Forward CSP + nonce to app rendering so Next can nonce internal scripts
    const existingRequestHeaders = finalResponse.headers.get('x-middleware-override-headers');
    const requestHeaderList = new Set(
        existingRequestHeaders
            ? existingRequestHeaders.split(',').map(header => header.trim()).filter(Boolean)
            : []
    );
    requestHeaderList.add('x-nonce');
    requestHeaderList.add('content-security-policy');
    finalResponse.headers.set('x-middleware-override-headers', Array.from(requestHeaderList).join(','));
    finalResponse.headers.set('x-middleware-request-x-nonce', nonce);
    finalResponse.headers.set('x-middleware-request-content-security-policy', csp);
    
    const securityHeaders = {
        'Content-Security-Policy': csp,
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
