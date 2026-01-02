// Posts API - Get, Update, Delete single post
import { NextResponse } from 'next/server'
import { createServerClient, verifyAuth, canModify } from '@/lib/supabaseClient'
import {
  successResponse,
  errorResponse,
  handleSupabaseError,
  parseRequestBody,
  extractIdFromParams,
  withErrorHandling,
  notFoundResponse,
  forbiddenResponse,
  validateOrigin,
} from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'
import type { UpdatePostInput } from '@/types'

/**
 * GET /api/posts/[id]
 * Get a single post by ID
 */
async function handleGetPost(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const postId = extractIdFromParams({ id })
  
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey(id, name, email, affiliation, role)
    `)
    .eq('id', postId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return notFoundResponse('Post not found')
    }
    return handleSupabaseError(error)
  }

  return successResponse(data)
}

/**
 * PUT /api/posts/[id]
 * Update a post (owner, moderator, or admin only)
 */
async function handleUpdatePost(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // CSRF protection
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const { id } = await params
  const postId = extractIdFromParams({ id })
  
  // Verify authentication
  const user = await verifyAuth()
  
  const supabase = await createServerClient()

  // Get the post to check ownership
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return notFoundResponse('Post not found')
    }
    return handleSupabaseError(fetchError)
  }

  // Check if user can modify this post
  if (!(await canModify(post.author_id))) {
    return forbiddenResponse('You do not have permission to edit this post')
  }

  // Parse request body
  const body = await parseRequestBody<UpdatePostInput>(request)
  
  const updateData: any = {}
  
  if (body.title !== undefined) {
    if (body.title.length < 3) {
      return errorResponse('Title must be at least 3 characters long', 422)
    }
    updateData.title = body.title
  }
  
  if (body.content !== undefined) {
    if (body.content.length < 10) {
      return errorResponse('Content must be at least 10 characters long', 422)
    }
    updateData.content = body.content
  }
  
  if (body.tags !== undefined) {
    updateData.tags = body.tags
  }

  // Update post
  const { data, error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', postId)
    .select(`
      *,
      author:users!posts_author_id_fkey(id, name, email, affiliation)
    `)
    .single()

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse(data)
}

/**
 * DELETE /api/posts/[id]
 * Delete a post (owner, moderator, or admin only)
 */
async function handleDeletePost(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // CSRF protection
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const { id } = await params
  const postId = extractIdFromParams({ id })
  
  // Verify authentication
  const user = await verifyAuth()
  
  const supabase = await createServerClient()

  // Get the post to check ownership
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return notFoundResponse('Post not found')
    }
    return handleSupabaseError(fetchError)
  }

  // Check if user can modify this post
  if (!(await canModify(post.author_id))) {
    return forbiddenResponse('You do not have permission to delete this post')
  }

  // Delete post (will cascade delete comments, reports, citations)
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse({ message: 'Post deleted successfully' })
}

export const GET = withErrorHandling(handleGetPost, {
  cache: {
    maxAge: 120,
    staleWhileRevalidate: 600,
  },
})
export const PUT = withRateLimit('write')(withErrorHandling(handleUpdatePost))
export const DELETE = withRateLimit('write')(withErrorHandling(handleDeletePost))
