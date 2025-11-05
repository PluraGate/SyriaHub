// Comments API - Update and Delete single comment
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
} from '@/lib/apiUtils'

interface UpdateCommentInput {
  content: string
}

/**
 * PUT /api/comments/[id]
 * Update a comment (owner only)
 */
async function handleUpdateComment(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const commentId = extractIdFromParams({ id })
  
  // Verify authentication
  const user = await verifyAuth()
  
  const supabase = await createServerClient()

  // Get the comment to check ownership
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return notFoundResponse('Comment not found')
    }
    return handleSupabaseError(fetchError)
  }

  // Only the comment owner can edit (not moderators)
  if (comment.user_id !== user.id) {
    return forbiddenResponse('You can only edit your own comments')
  }

  // Parse request body
  const body = await parseRequestBody<UpdateCommentInput>(request)
  
  if (!body.content || body.content.length < 1) {
    return errorResponse('Comment content cannot be empty', 422)
  }

  if (body.content.length > 5000) {
    return errorResponse('Comment content is too long (max 5000 characters)', 422)
  }

  // Update comment
  const { data, error } = await supabase
    .from('comments')
    .update({ content: body.content })
    .eq('id', commentId)
    .select(`
      *,
      user:users!comments_user_id_fkey(id, name, email, role)
    `)
    .single()

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse(data)
}

/**
 * DELETE /api/comments/[id]
 * Delete a comment (owner, moderator, or admin)
 */
async function handleDeleteComment(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const commentId = extractIdFromParams({ id })
  
  // Verify authentication
  const user = await verifyAuth()
  
  const supabase = await createServerClient()

  // Get the comment to check ownership
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return notFoundResponse('Comment not found')
    }
    return handleSupabaseError(fetchError)
  }

  // Check if user can delete this comment
  if (!(await canModify(comment.user_id))) {
    return forbiddenResponse('You do not have permission to delete this comment')
  }

  // Delete comment
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse({ message: 'Comment deleted successfully' })
}

export const PUT = withErrorHandling(handleUpdateComment)
export const DELETE = withErrorHandling(handleDeleteComment)
