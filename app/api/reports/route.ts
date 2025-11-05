// Reports API - Create and list reports
import { NextResponse } from 'next/server'
import { createServerClient, verifyAuth, isModerator } from '@/lib/supabaseClient'
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
import type { CreateReportInput } from '@/types'

/**
 * GET /api/reports
 * List reports (moderators and admins only)
 * Query params: status, post_id, limit, offset
 */
async function handleGetReports(request: Request): Promise<NextResponse> {
  // Verify user is moderator or admin
  const user = await verifyAuth()
  
  if (!(await isModerator())) {
    return forbiddenResponse('Only moderators and admins can view reports')
  }

  const supabase = await createServerClient()
  const params = getQueryParams(request)
  
  // Get query parameters
  const status = params.get('status')
  const postId = params.get('post_id')
  const limit = parseInt(params.get('limit') || '20', 10)
  const offset = parseInt(params.get('offset') || '0', 10)

  // Build query
  let query = supabase
    .from('reports')
    .select(`
      *,
      post:posts!reports_post_id_fkey(id, title, content),
      reporter:users!reports_reporter_id_fkey(id, name, email)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (status) {
    query = query.eq('status', status)
  }

  if (postId) {
    query = query.eq('post_id', postId)
  }

  const { data, error, count } = await query

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse({
    reports: data || [],
    pagination: {
      limit,
      offset,
      total: count || data?.length || 0,
    },
  })
}

/**
 * POST /api/reports
 * Create a new report (authenticated users only)
 */
async function handleCreateReport(request: Request): Promise<NextResponse> {
  // Verify authentication
  const user = await verifyAuth()

  const supabase = await createServerClient()
  
  // Parse request body
  const body = await parseRequestBody<CreateReportInput>(request)
  
  // Validate required fields
  validateRequiredFields(body, ['post_id', 'reason'])
  
  const { post_id, reason } = body

  // Validate reason length
  if (reason.length < 10) {
    return errorResponse('Report reason must be at least 10 characters', 422)
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

  // Check if user already reported this post
  const { data: existingReport } = await supabase
    .from('reports')
    .select('id')
    .eq('post_id', post_id)
    .eq('reporter_id', user.id)
    .single()

  if (existingReport) {
    return errorResponse('You have already reported this post', 409)
  }

  // Create report
  const { data, error } = await supabase
    .from('reports')
    .insert({
      post_id,
      reporter_id: user.id,
      reason,
      status: 'pending',
    })
    .select(`
      *,
      post:posts!reports_post_id_fkey(id, title),
      reporter:users!reports_reporter_id_fkey(id, name, email)
    `)
    .single()

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse(data, 201)
}

export const GET = withErrorHandling(handleGetReports)
export const POST = withErrorHandling(handleCreateReport)
