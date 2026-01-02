// Roles API - Manage roles and permissions (admin only)
import { NextResponse } from 'next/server'
import { createServerClient, verifyRole } from '@/lib/supabaseClient'
import {
  successResponse,
  errorResponse,
  handleSupabaseError,
  parseRequestBody,
  validateRequiredFields,
  withErrorHandling,
  validateOrigin,
} from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

interface CreateRoleInput {
  name: string
  permissions: Record<string, any>
}

/**
 * GET /api/roles
 * List all roles (public)
 */
async function handleGetRoles(request: Request): Promise<NextResponse> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse({ roles: data || [] })
}

/**
 * POST /api/roles
 * Create a new role (admin only)
 */
async function handleCreateRole(request: Request): Promise<NextResponse> {
  // CSRF protection
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  // Verify user is admin
  await verifyRole('admin')

  const supabase = await createServerClient()
  
  // Parse request body
  const body = await parseRequestBody<CreateRoleInput>(request)
  
  // Validate required fields
  validateRequiredFields(body, ['name', 'permissions'])
  
  const { name, permissions } = body

  // Validate name
  if (name.length < 2) {
    return errorResponse('Role name must be at least 2 characters', 422)
  }

  // Create role
  const { data, error } = await supabase
    .from('roles')
    .insert({ name, permissions })
    .select()
    .single()

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse(data, 201)
}

export const GET = withErrorHandling(handleGetRoles)
export const POST = withRateLimit('write')(withErrorHandling(handleCreateRole))
