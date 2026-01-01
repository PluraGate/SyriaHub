// Authentication API - Get current user
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabaseClient'
import {
  successResponse,
  unauthorizedResponse,
  withErrorHandling,
} from '@/lib/apiUtils'

async function handleGetUser(request: Request): Promise<NextResponse> {
  const { user, error } = await getCurrentUser()

  if (error || !user) {
    return unauthorizedResponse()
  }

  return successResponse({ user })
}

export const GET = withErrorHandling(handleGetUser)
