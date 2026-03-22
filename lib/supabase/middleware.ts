import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, response?: NextResponse) {
  let finalResponse = response ?? NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check the "stay signed in" preference. When absent or '0',
  // downgrade Supabase cookies to session cookies (no maxAge) so
  // they are cleared automatically when the browser closes.
  const rememberMe = request.cookies.get('syriahub_remember_me')?.value === '1'

  function applyCookieOptions(options: CookieOptions): CookieOptions {
    if (rememberMe) return options
    // Strip maxAge / expires so the cookie becomes a session cookie
    const { maxAge: _maxAge, expires: _expires, ...rest } = options as CookieOptions & { maxAge?: number; expires?: Date }
    return rest
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          const opts = applyCookieOptions(options)
          request.cookies.set({
            name,
            value,
            ...opts,
          })
          finalResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          finalResponse.cookies.set({
            name,
            value,
            ...opts,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          finalResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          finalResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh the session — if the refresh token has expired this will
  // trigger the `remove` callbacks above, clearing stale cookies.
  const { data: { user }, error } = await supabase.auth.getUser()

  // If auth failed (expired/corrupt session), ensure all stale auth
  // cookies are explicitly removed so downstream code (login page,
  // protected-route check) doesn't see ghost sessions.
  if (error || !user) {
    const allCookies = request.cookies.getAll()
    for (const cookie of allCookies) {
      if (cookie.name.startsWith('sb-') && cookie.name.includes('-auth-')) {
        request.cookies.set({ name: cookie.name, value: '' })
        finalResponse.cookies.set({ name: cookie.name, value: '', path: '/', maxAge: 0 })
      }
    }
  }

  return finalResponse
}
