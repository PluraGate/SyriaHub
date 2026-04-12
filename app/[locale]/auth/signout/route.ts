import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rateLimit'
import { validateOrigin } from '@/lib/apiUtils'

async function handlePost(request: NextRequest) {
  // CSRF protection
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const supabase = await createClient()
  await supabase.auth.signOut()

  // Explicitly clear the remember-me preference and any stale auth cookies
  // so the next page load starts with a clean slate.
  const cookieStore = await cookies()
  cookieStore.set('syriahub_remember_me', '', { path: '/', maxAge: 0 })
  const allCookies = cookieStore.getAll()
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-') && cookie.name.includes('-auth-')) {
      cookieStore.set(cookie.name, '', { path: '/', maxAge: 0 })
    }
  }

  redirect('/')
}

export const POST = withRateLimit('auth')(handlePost)
