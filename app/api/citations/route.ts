// Citations API - Create and manage post citations
import { NextResponse } from 'next/server'
import { createServerClient, verifyAuth, canModify } from '@/lib/supabaseClient'
import {
  successResponse,
  errorResponse,
  handleSupabaseError,
  parseRequestBody,
  validateRequiredFields,
  getQueryParams,
  withErrorHandling,
  forbiddenResponse,
} from '@/lib/apiUtils'

interface CreateCitationInput {
  source_post_id: string
  target_post_id: string
}

/**
 * GET /api/citations
 * Get citations for a post
 * Query params: source_post_id, target_post_id, limit, offset
 */
async function handleGetCitations(request: Request): Promise<NextResponse> {
  const supabase = await createServerClient()
  const params = getQueryParams(request)
  
  const sourcePostId = params.get('source_post_id')
  const targetPostId = params.get('target_post_id')
  const limit = parseInt(params.get('limit') || '50', 10)
  const offset = parseInt(params.get('offset') || '0', 10)

  if (!sourcePostId && !targetPostId) {
    return errorResponse('Either source_post_id or target_post_id is required', 422)
  }

  let query = supabase
    .from('citations')
    .select(`
      *,
      source_post:posts!citations_source_post_id_fkey(id, title, author_id),
      target_post:posts!citations_target_post_id_fkey(id, title, author_id)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (sourcePostId) {
    query = query.eq('source_post_id', sourcePostId)
  }

  if (targetPostId) {
    query = query.eq('target_post_id', targetPostId)
  }

  const { data, error } = await query

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse({
    citations: data || [],
    pagination: {
      limit,
      offset,
      total: data?.length || 0,
    },
  })
}

/**
 * POST /api/citations
 * Create a citation (authenticated users)
 */
async function handleCreateCitation(request: Request): Promise<NextResponse> {
  // Verify authentication
  const user = await verifyAuth()

  const supabase = await createServerClient()
  
  // Parse request body
  const body = await parseRequestBody<CreateCitationInput>(request)
  
  // Validate required fields
  validateRequiredFields(body, ['source_post_id', 'target_post_id'])
  
  const { source_post_id, target_post_id } = body

  // Validate that posts are different
  if (source_post_id === target_post_id) {
    return errorResponse('A post cannot cite itself', 422)
  }

  // Verify both posts exist
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id')
    .in('id', [source_post_id, target_post_id])

  if (postsError || !posts || posts.length !== 2) {
    return errorResponse('One or both posts not found', 404)
  }

  // Check if citation already exists
  const { data: existingCitation } = await supabase
    .from('citations')
    .select('id')
    .eq('source_post_id', source_post_id)
    .eq('target_post_id', target_post_id)
    .single()

  if (existingCitation) {
    return errorResponse('Citation already exists', 409)
  }

  // Create citation
  const { data, error } = await supabase
    .from('citations')
    .insert({
      source_post_id,
      target_post_id,
    })
    .select(`
      *,
      source_post:posts!citations_source_post_id_fkey(id, title),
      target_post:posts!citations_target_post_id_fkey(id, title)
    `)
    .single()

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse(data, 201)
}

export const GET = withErrorHandling(handleGetCitations)
export const POST = withErrorHandling(handleCreateCitation)
