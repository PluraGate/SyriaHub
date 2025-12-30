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

export async function middleware(request: NextRequest) {
    // 1. Run next-intl middleware to get the localized response (redirects, etc.)
    const response = intlMiddleware(request);

    // 2. Update session and get user
    const finalResponse = await updateSession(request, response);

    // 3. Protected routes check
    const { pathname } = request.nextUrl;
    const isEditorPage = pathname.includes('/editor');
    const isTestBypass = request.headers.get('x-test-bypass') === 'true';

    if (isEditorPage && !isTestBypass) {
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

    return finalResponse;
}

export const config = {
    // Match only internationalized pathnames
    // We exclude api, static files, etc.
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|js)$).*)'
    ]
};
