// Comments API - List and Create comments
import { NextResponse } from 'next/server'
import { createServerClient, verifyAuth } from '@/lib/supabaseClient'
import {
  successResponse,
  errorResponse,
  handleSupabaseError,
  parseRequestBody,
  validateRequiredFields,
  getQueryParams,
  withErrorHandling,
} from '@/lib/apiUtils'
import type { CreateCommentInput } from '@/types'

/**
 * GET /api/comments
 * List comments with optional filtering
 * Query params: post_id, user_id, limit, offset
 */
async function handleGetComments(request: Request): Promise<NextResponse> {
  const supabase = await createServerClient()
  const params = getQueryParams(request)
  
  // Get query parameters
  const postId = params.get('post_id')
  const userId = params.get('user_id')
  const limit = parseInt(params.get('limit') || '50', 10)
  const offset = parseInt(params.get('offset') || '0', 10)

  // Build query
  let query = supabase
    .from('comments')
    .select(`
      *,
      user:users!comments_user_id_fkey(id, name, email, role),
      post:posts!comments_post_id_fkey(id, title)
    `)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (postId) {
    query = query.eq('post_id', postId)
  }

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error, count } = await query

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse({
    comments: data || [],
    pagination: {
      limit,
      offset,
      total: count || data?.length || 0,
    },
  })
}

/**
 * POST /api/comments
 * Create a new comment (authenticated users only)
 */
async function handleCreateComment(request: Request): Promise<NextResponse> {
  // Verify authentication
  const user = await verifyAuth()

  const supabase = await createServerClient()
  
  // Parse request body
  const body = await parseRequestBody<CreateCommentInput>(request)
  
  // Validate required fields
  validateRequiredFields(body, ['content', 'post_id'])
  
  const { content, post_id } = body

  // Validate content length
  if (content.length < 1) {
    return errorResponse('Comment content cannot be empty', 422)
  }

  if (content.length > 5000) {
    return errorResponse('Comment content is too long (max 5000 characters)', 422)
  }

  // Verify that the post exists
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id')
    .eq('id', post_id)
    .single()

  if (postError || !post) {
    return errorResponse('Post not found', 404)
  }

  // Create comment
  const { data, error } = await supabase
    .from('comments')
    .insert({
      content,
      post_id,
      user_id: user.id,
    })
    .select(`
      *,
      user:users!comments_user_id_fkey(id, name, email, role),
      post:posts!comments_post_id_fkey(id, title)
    `)
    .single()

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse(data, 201)
}

export const GET = withErrorHandling(handleGetComments)
export const POST = withErrorHandling(handleCreateComment)
