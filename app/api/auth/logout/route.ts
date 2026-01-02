// Authentication API - Logout endpoint
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'
import {
  successResponse,
  errorResponse,
  withErrorHandling,
  validateOrigin,
} from '@/lib/apiUtils'

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

  return successResponse({ message: 'Logged out successfully' })
}

export const POST = withErrorHandling(handleLogout)
