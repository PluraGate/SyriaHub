// Reports API - Update report status (moderators only)
import { NextResponse } from 'next/server'
import { createServerClient, verifyRole } from '@/lib/supabaseClient'
import {
  successResponse,
  errorResponse,
  handleSupabaseError,
  parseRequestBody,
  extractIdFromParams,
  withErrorHandling,
  notFoundResponse,
} from '@/lib/apiUtils'
import type { ReportStatus } from '@/types'

interface UpdateReportInput {
  status: ReportStatus
}

/**
 * PUT /api/reports/[id]
 * Update report status (moderators and admins only)
 */
async function handleUpdateReport(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params
  const reportId = extractIdFromParams({ id })
  
  // Verify user is moderator or admin
  await verifyRole(['moderator', 'admin'])
  
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
    .select('id')
    .eq('id', reportId)
    .single()

  if (fetchError || !report) {
    if (fetchError?.code === 'PGRST116') {
      return notFoundResponse('Report not found')
    }
    return handleSupabaseError(fetchError)
  }

  // Update report status
  const { data, error } = await supabase
    .from('reports')
    .update({ status: body.status })
    .eq('id', reportId)
    .select(`
      *,
      post:posts!reports_post_id_fkey(id, title),
      reporter:users!reports_reporter_id_fkey(id, name, email)
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

export const PUT = withErrorHandling(handleUpdateReport)
export const DELETE = withErrorHandling(handleDeleteReport)
