// Report endpoint - Allow users to manually flag posts or comments
import { NextResponse } from 'next/server'
import { createServerClient, verifyAuth } from '@/lib/supabaseClient'
import {
  successResponse,
  errorResponse,
  handleSupabaseError,
  parseRequestBody,
  validateRequiredFields,
  withErrorHandling,
} from '@/lib/apiUtils'

interface CreateManualReportInput {
  content_type: 'post' | 'comment'
  content_id: string
  reason: string
}

/**
 * POST /api/report
 * Create a manual report for a post or comment
 */
async function handleCreateReport(request: Request): Promise<NextResponse> {
  // Verify authentication
  const user = await verifyAuth()

  const supabase = await createServerClient()

  // Parse request body
  const body = await parseRequestBody<CreateManualReportInput>(request)

  // Validate required fields
  validateRequiredFields(body, ['content_type', 'content_id', 'reason'])

  const { content_type, content_id, reason } = body

  // Validate content_type
  if (!['post', 'comment'].includes(content_type)) {
    return errorResponse('content_type must be either "post" or "comment"', 422)
  }

  // Validate reason length
  if (reason.length < 10) {
    return errorResponse('Report reason must be at least 10 characters', 422)
  }

  if (reason.length > 1000) {
    return errorResponse('Report reason is too long (max 1000 characters)', 422)
  }

  // Verify that the content exists
  if (content_type === 'post') {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, title, content, author_id')
      .eq('id', content_id)
      .single()

    if (postError || !post) {
      return errorResponse('Post not found', 404)
    }

    // Prevent users from reporting their own posts
    if (post.author_id === user.id) {
      return errorResponse('You cannot report your own post', 422)
    }

    // Check if user has already reported this post
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('post_id', content_id)
      .eq('reporter_id', user.id)
      .eq('status', 'pending')
      .single()

    if (existingReport) {
      return errorResponse('You have already reported this post', 422)
    }

    // Create report
    const { data, error } = await supabase
      .from('reports')
      .insert({
        post_id: content_id,
        comment_id: null,
        reporter_id: user.id,
        reason,
        status: 'pending',
        content_type: 'post',
        content_snapshot: JSON.stringify({
          title: post.title,
          content: post.content,
        }),
      })
      .select()
      .single()

    if (error) {
      return handleSupabaseError(error)
    }

    return successResponse(
      {
        ...data,
        message: 'Report submitted successfully. Our moderation team will review it.',
      },
      201
    )
  } else {
    // content_type === 'comment'
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id, content, user_id, post_id')
      .eq('id', content_id)
      .single()

    if (commentError || !comment) {
      return errorResponse('Comment not found', 404)
    }

    // Prevent users from reporting their own comments
    if (comment.user_id === user.id) {
      return errorResponse('You cannot report your own comment', 422)
    }

    // Check if user has already reported this comment
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('comment_id', content_id)
      .eq('reporter_id', user.id)
      .eq('status', 'pending')
      .single()

    if (existingReport) {
      return errorResponse('You have already reported this comment', 422)
    }

    // Create report
    const { data, error } = await supabase
      .from('reports')
      .insert({
        post_id: comment.post_id,
        comment_id: content_id,
        reporter_id: user.id,
        reason,
        status: 'pending',
        content_type: 'comment',
        content_snapshot: JSON.stringify({
          content: comment.content,
        }),
      })
      .select()
      .single()

    if (error) {
      return handleSupabaseError(error)
    }

    return successResponse(
      {
        ...data,
        message: 'Report submitted successfully. Our moderation team will review it.',
      },
      201
    )
  }
}

export const POST = withErrorHandling(handleCreateReport)
