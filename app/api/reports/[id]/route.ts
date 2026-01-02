// Reports API - Update report status (moderators only)
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
import type { ReportStatus } from '@/types'

interface UpdateReportInput {
  status: ReportStatus
  action?: 'delete_content' | 'warn_user' | 'none'
  notes?: string
}

/**
 * PUT /api/reports/[id]
 * Update report status (moderators and admins only)
 */
async function handleUpdateReport(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // CSRF protection
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const { id } = await params
  const reportId = extractIdFromParams({ id })
  
  // Verify user is moderator or admin
  const user = await verifyRole(['moderator', 'admin'])
  
  const supabase = await createServerClient()

  // Parse request body
  const body = await parseRequestBody<UpdateReportInput>(request)
  
  if (!body.status) {
    return errorResponse('Status is required', 422)
  }

  // Validate status value
  const validStatuses: ReportStatus[] = ['pending', 'reviewing', 'resolved', 'dismissed']
  if (!validStatuses.includes(body.status)) {
    return errorResponse('Invalid status value', 422)
  }

  // Check if report exists
  const { data: report, error: fetchError } = await supabase
    .from('reports')
    .select('*, post:posts(id, author_id), comment:comments(id, user_id)')
    .eq('id', reportId)
    .single()

  if (fetchError || !report) {
    if (fetchError?.code === 'PGRST116') {
      return notFoundResponse('Report not found')
    }
    return handleSupabaseError(fetchError)
  }

  // Handle actions if specified
  if (body.action === 'delete_content') {
    if (report.content_type === 'post' && report.post_id) {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', report.post_id)

      if (deleteError) {
        console.error('Failed to delete reported post:', deleteError)
      }
    } else if (report.content_type === 'comment' && report.comment_id) {
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', report.comment_id)

      if (deleteError) {
        console.error('Failed to delete reported comment:', deleteError)
      }
    }
  }

  // Update report status
  const { data, error } = await supabase
    .from('reports')
    .update({
      status: body.status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reportId)
    .select(`
      *,
      post:posts!reports_post_id_fkey(id, title),
      comment:comments!reports_comment_id_fkey(id, content),
      reporter:users!reports_reporter_id_fkey(id, name, email),
      reviewer:users!reports_reviewed_by_fkey(id, name, email)
    `)
    .single()

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse(data)
}

/**
 * DELETE /api/reports/[id]
 * Delete a report (moderators and admins only)
 */
async function handleDeleteReport(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // CSRF protection
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const { id } = await params
  const reportId = extractIdFromParams({ id })
  
  // Verify user is moderator or admin
  await verifyRole(['moderator', 'admin'])
  
  const supabase = await createServerClient()

  // Delete report
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId)

  if (error) {
    if (error.code === 'PGRST116') {
      return notFoundResponse('Report not found')
    }
    return handleSupabaseError(error)
  }

  return successResponse({ message: 'Report deleted successfully' })
}

export const PUT = withRateLimit('write')(withErrorHandling(handleUpdateReport))
export const DELETE = withRateLimit('write')(withErrorHandling(handleDeleteReport))
