// Authentication API - Login endpoint
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'
import {
  successResponse,
  errorResponse,
  parseRequestBody,
  validateRequiredFields,
  withErrorHandling,
  validateOrigin,
} from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

interface LoginRequest {
  email: string
  password: string
}

async function handleLogin(request: Request): Promise<NextResponse> {
  // CSRF protection
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const supabase = await createServerClient()

  // Parse request body
  const body = await parseRequestBody<LoginRequest>(request)

  // Validate required fields
  validateRequiredFields(body, ['email', 'password'])

  const { email, password } = body

  // Authenticate user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return errorResponse(authError.message, 401)
  }

  if (!authData.user) {
    return errorResponse('Authentication failed', 401)
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  if (profileError) {
    return errorResponse('Failed to fetch user profile', 500)
  }

  return successResponse({
    user: profile,
    session: authData.session,
  })
}

export const POST = withRateLimit('auth')(withErrorHandling(handleLogin))
