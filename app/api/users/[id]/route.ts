// Users API - Update user role and profile (admin only)
import { NextResponse } from 'next/server'
import { createServerClient, verifyRole, getCurrentUser } from '@/lib/supabaseClient'
import {
  successResponse,
  errorResponse,
  handleSupabaseError,
  parseRequestBody,
  extractIdFromParams,
  withErrorHandling,
  notFoundResponse,
  validateOrigin,
} from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'
import type { UserRole, UpdateUserProfileInput } from '@/types'

interface UpdateUserInput extends UpdateUserProfileInput {
  role?: UserRole
}

/**
 * GET /api/users/[id]
 * Get user profile (authenticated users only)
 * Returns only public fields to prevent PII exposure
 */
async function handleGetUser(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const userId = extractIdFromParams({ id })
  
  // SECURITY: Require authentication to view profiles
  const { user: currentUser } = await getCurrentUser()
  if (!currentUser) {
    return errorResponse('Authentication required', 401)
  }
  
  const supabase = await createServerClient()

  // SECURITY: Only select public fields, never expose email or sensitive data
  // Admins can see additional fields
  const isAdmin = currentUser.role === 'admin'
  const isSelf = currentUser.id === userId
  
  const { data, error } = await supabase
    .from('users')
    .select('id, name, bio, affiliation, role, created_at')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return notFoundResponse('User not found')
    }
    return handleSupabaseError(error)
  }

  // Include email only for self or admin
  if (isSelf || isAdmin) {
    const { data: fullData } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()
    
    return successResponse({ ...data, email: fullData?.email })
  }

  return successResponse(data)
}

/**
 * PUT /api/users/[id]
 * Update user profile and role
 * - Users can update their own profile (except role)
 * - Admins can update any user's profile and role
 */
async function handleUpdateUser(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // CSRF protection
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const { id } = await params
  const userId = extractIdFromParams({ id })
  
  const { user: currentUser } = await getCurrentUser()
  
  if (!currentUser) {
    return errorResponse('Unauthorized', 401)
  }

  const supabase = await createServerClient()
  
  // Parse request body
  const body = await parseRequestBody<UpdateUserInput>(request)
  
  const updateData: any = {}
  
  // Check if trying to update role
  if (body.role !== undefined) {
    // Only admins can change roles
    if (currentUser.role !== 'admin') {
      return errorResponse('Only admins can change user roles', 403)
    }
    
    const validRoles: UserRole[] = ['researcher', 'moderator', 'admin']
    if (!validRoles.includes(body.role)) {
      return errorResponse('Invalid role value', 422)
    }
    
    updateData.role = body.role
  }
  
  // Users can update their own profile, admins can update any profile
  if (currentUser.id !== userId && currentUser.role !== 'admin') {
    return errorResponse('You can only edit your own profile', 403)
  }
  
  // Add other fields to update
  if (body.name !== undefined) updateData.name = body.name
  if (body.bio !== undefined) updateData.bio = body.bio
  if (body.affiliation !== undefined) updateData.affiliation = body.affiliation

  if (Object.keys(updateData).length === 0) {
    return errorResponse('No fields to update', 422)
  }

  // Update user
  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse(data)
}

/**
 * DELETE /api/users/[id]
 * Delete user account (admin only)
 */
async function handleDeleteUser(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // CSRF protection
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const { id } = await params
  const userId = extractIdFromParams({ id })
  
  // Verify user is admin
  await verifyRole('admin')
  
  const supabase = await createServerClient()

  // Delete user from auth (will cascade delete user profile and related data)
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse({ message: 'User deleted successfully' })
}

export const GET = withErrorHandling(handleGetUser)
export const PUT = withRateLimit('write')(withErrorHandling(handleUpdateUser))
export const DELETE = withRateLimit('write')(withErrorHandling(handleDeleteUser))
