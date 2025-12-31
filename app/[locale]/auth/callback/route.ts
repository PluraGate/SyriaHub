import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/feed'

  if (code) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=Unable to verify email`
      )
    }

    // Check if this is a new user (just verified their email for the first time)
    if (data.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('bio, affiliation')
        .eq('id', data.user.id)
        .single()

      // If user has no bio or affiliation, they're a new user - redirect to onboarding
      const isNewUser = !userData?.bio && !userData?.affiliation
      if (isNewUser) {
        return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
