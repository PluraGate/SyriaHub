// Tags API - List and manage tags
import { NextResponse } from 'next/server'
import { createServerClient, verifyRole, isModerator } from '@/lib/supabaseClient'
import {
  successResponse,
  errorResponse,
  handleSupabaseError,
  parseRequestBody,
  validateRequiredFields,
  getQueryParams,
  withErrorHandling,
  forbiddenResponse,
  validateOrigin,
} from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

interface CreateTagInput {
  label: string
  discipline?: string
  color?: string
}

/**
 * GET /api/tags
 * List all tags (public)
 * Query params: discipline, search
 */
async function handleGetTags(request: Request): Promise<NextResponse> {
  const supabase = await createServerClient()
  const params = getQueryParams(request)
  
  const discipline = params.get('discipline')
  const search = params.get('search')

  let query = supabase
    .from('tags')
    .select('*')
    .order('label', { ascending: true })

  if (discipline) {
    query = query.eq('discipline', discipline)
  }

  if (search) {
    query = query.ilike('label', `%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse({ tags: data || [] })
}

/**
 * POST /api/tags
 * Create a new tag (authenticated users)
 */
async function handleCreateTag(request: Request): Promise<NextResponse> {
  // CSRF protection
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  // Check if user is moderator or admin
  const canManageTags = await isModerator()
  
  if (!canManageTags) {
    return forbiddenResponse('Only moderators and admins can create tags')
  }

  const supabase = await createServerClient()
  
  // Parse request body
  const body = await parseRequestBody<CreateTagInput>(request)
  
  // Validate required fields
  validateRequiredFields(body, ['label'])
  
  const { label, discipline, color } = body

  if (label.length < 2) {
    return errorResponse('Tag label must be at least 2 characters', 422)
  }

  // Create tag
  const { data, error } = await supabase
    .from('tags')
    .insert({
      label,
      discipline: discipline || null,
      color: color || '#3B82F6',
    })
    .select()
    .single()

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse(data, 201)
}

export const GET = withErrorHandling(handleGetTags, {
  cache: {
    maxAge: 300,
    staleWhileRevalidate: 900,
  },
})
export const POST = withRateLimit('write')(withErrorHandling(handleCreateTag))
