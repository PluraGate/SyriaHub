// Authentication API - Logout endpoint
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  validateOrigin,
} from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

async function handleLogout(request: Request): Promise<NextResponse> {
  // CSRF protection
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const supabase = await createServerClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    return errorResponse(error.message, 500)
  }

  const response = successResponse({ message: 'Logged out successfully' })

  // Clear the stay-signed-in preference on logout
  response.cookies.set('syriahub_remember_me', '', { path: '/', maxAge: 0 })

  return response
}

export const POST = withRateLimit('auth')(withErrorHandling(handleLogout))
