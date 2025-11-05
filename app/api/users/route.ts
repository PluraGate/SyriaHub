// Users API - List and manage users (admin only)
import { NextResponse } from 'next/server'
import { createServerClient, verifyRole } from '@/lib/supabaseClient'
import {
  successResponse,
  handleSupabaseError,
  getQueryParams,
  withErrorHandling,
} from '@/lib/apiUtils'

/**
 * GET /api/users
 * List users (admin only)
 * Query params: role, search, limit, offset
 */
async function handleGetUsers(request: Request): Promise<NextResponse> {
  // Verify user is admin
  await verifyRole('admin')

  const supabase = await createServerClient()
  const params = getQueryParams(request)
  
  // Get query parameters
  const role = params.get('role')
  const search = params.get('search')
  const limit = parseInt(params.get('limit') || '20', 10)
  const offset = parseInt(params.get('offset') || '0', 10)

  // Build query
  let query = supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (role) {
    query = query.eq('role', role)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,affiliation.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse({
    users: data || [],
    pagination: {
      limit,
      offset,
      total: count || data?.length || 0,
    },
  })
}

export const GET = withErrorHandling(handleGetUsers)
