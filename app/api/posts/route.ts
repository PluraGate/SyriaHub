// Posts API - List and Create posts
import { NextResponse } from 'next/server'
import { createServerClient, getCurrentUser, verifyAuth } from '@/lib/supabaseClient'
import {
  successResponse,
  errorResponse,
  handleSupabaseError,
  parseRequestBody,
  validateRequiredFields,
  getQueryParams,
  withErrorHandling,
  unauthorizedResponse,
  sanitizePaginationParams,
  withOriginValidation,
} from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'
import { checkContent } from '@/lib/moderation'
import { analyzePostForRecommendations } from '@/lib/recommendationAnalysis'
import type { CreatePostInput } from '@/types'

/**
 * GET /api/posts
 * List posts with optional filtering
 * Query params: tag, author_id, limit, offset
 */
async function handleGetPosts(request: Request): Promise<NextResponse> {
  const supabase = await createServerClient()
  const params = getQueryParams(request)

  // Get query parameters
  const tag = params.get('tag')
  const authorId = params.get('author_id')
  // SECURITY: Use sanitized pagination to prevent DoS
  const { limit, offset } = sanitizePaginationParams(params, { maxLimit: 50, defaultLimit: 10 })
  const search = params.get('search')

  // Build query
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey(id, name, affiliation)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (tag) {
    query = query.contains('tags', [tag])
  }

  if (authorId) {
    query = query.eq('author_id', authorId)
  }

  if (search) {
    // SECURITY: Escape LIKE pattern special characters to prevent pattern injection
    const sanitizedSearch = search.replace(/[%_\\]/g, '\\$&')
    query = query.or(`title.ilike.%${sanitizedSearch}%,content.ilike.%${sanitizedSearch}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse({
    posts: data || [],
    pagination: {
      limit,
      offset,
      total: count || data?.length || 0,
    },
  })
}

/**
 * POST /api/posts
 * Create a new post (authenticated users only)
 */
async function handleCreatePost(request: Request): Promise<NextResponse> {
  // Verify authentication
  const user = await verifyAuth()

  const supabase = await createServerClient()

  // Parse request body
  const body = await parseRequestBody<CreatePostInput>(request)

  // Validate required fields
  validateRequiredFields(body, ['title', 'content'])

  const { title, content, tags } = body

  // Validate title and content length
  if (title.length < 3) {
    return errorResponse('Title must be at least 3 characters long', 422)
  }

  if (content.length < 10) {
    return errorResponse('Content must be at least 10 characters long', 422)
  }

  // Run AI moderation on the content
  const contentCheck = await checkContent(`${title}\n\n${content}`, title)

  // If content is flagged, create a report and reject the post
  if (contentCheck.shouldBlock) {
    // Create a report for moderation review
    const { error: reportError } = await supabase.from('reports').insert({
      post_id: null, // No post ID yet since we're blocking creation
      reporter_id: user.id,
      reason: `AI Moderation Auto-Report: ${contentCheck.warnings.join('; ')}`,
      status: 'pending',
      content_type: 'post',
      content_snapshot: JSON.stringify({ title, content, tags }),
      moderation_data: JSON.stringify({
        moderation: contentCheck.moderation,
        plagiarism: contentCheck.plagiarism,
      }),
    })

    if (reportError) {
      console.error('Failed to create auto-report:', reportError)
    }

    return NextResponse.json(
      {
        success: false,
        error: contentCheck.warnings[0] || 'Content violates community guidelines',
        warnings: contentCheck.warnings,
        categories: contentCheck.moderation.details,
      },
      { status: 422 }
    )
  }

  // If flagged but not severe enough to block, show warnings but allow
  const hasWarnings = contentCheck.warnings.length > 0

  // Create post
  const { data, error } = await supabase
    .from('posts')
    .insert({
      title,
      content,
      tags: tags || [],
      author_id: user.id,
    })
    .select(`
      *,
      author:users!posts_author_id_fkey(id, name, affiliation)
    `)
    .single()

  if (error) {
    return handleSupabaseError(error)
  }

  // Trigger AI recommendation analysis with timeout protection for serverless
  // Uses Promise.race to ensure the analysis has at least 10s to attempt completion
  const analysisTimeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Analysis timeout')), 10000)
  )

  Promise.race([
    analyzePostForRecommendations(data.id, data.title, data.content, data.tags || []),
    analysisTimeout
  ]).catch(err => {
    if (err.message === 'Analysis timeout') {
      console.warn('[Posts API] AI analysis timed out - may continue in background')
    } else {
      console.error('[Posts API] Failed to analyze post for recommendations:', err)
    }
  })

  // Return success with optional warnings
  if (hasWarnings) {
    return NextResponse.json(
      {
        success: true,
        data,
        warnings: contentCheck.warnings,
      },
      { status: 201 }
    )
  }

  return successResponse(data, 201)
}

export const GET = withErrorHandling(handleGetPosts, {
  cache: {
    maxAge: 60,
    staleWhileRevalidate: 300,
  },
})
// SECURITY: Apply rate limiting and origin validation for CSRF protection
export const POST = withRateLimit('write')(withOriginValidation(withErrorHandling(handleCreatePost)))
