// Authentication API - Signup endpoint
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'
import {
  successResponse,
  errorResponse,
  parseRequestBody,
  validateRequiredFields,
  withErrorHandling,
} from '@/lib/apiUtils'

interface SignupRequest {
  email: string
  password: string
  name: string
  affiliation?: string
}

async function handleSignup(request: Request): Promise<NextResponse> {
  const supabase = await createServerClient()
  
  // Parse request body
  const body = await parseRequestBody<SignupRequest>(request)
  
  // Validate required fields
  validateRequiredFields(body, ['email', 'password', 'name'])
  
  const { email, password, name, affiliation } = body

  // Validate password strength
  if (password.length < 8) {
    return errorResponse('Password must be at least 8 characters long', 422)
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        affiliation,
      },
    },
  })

  if (authError) {
    return errorResponse(authError.message, 400)
  }

  if (!authData.user) {
    return errorResponse('User creation failed', 500)
  }

  // Get the created profile (created by trigger)
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  if (profileError) {
    // Profile might not be created yet due to trigger timing
    // Return basic user info
    return successResponse(
      {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name,
        },
        session: authData.session,
        message: 'Please verify your email to continue',
      },
      201
    )
  }

  return successResponse(
    {
      user: profile,
      session: authData.session,
      message: authData.session 
        ? 'Account created successfully' 
        : 'Account created. Please verify your email to continue',
    },
    201
  )
}

export const POST = withErrorHandling(handleSignup)
