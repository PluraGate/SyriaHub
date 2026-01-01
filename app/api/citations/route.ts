// Citations API - Create and manage post citations (internal and external)
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

interface CreateInternalCitationInput {
  source_post_id: string
  target_post_id: string
  quote_content?: string
}

interface CreateExternalCitationInput {
  source_post_id: string
  external_url?: string
  external_doi?: string
  external_title?: string
  external_author?: string
  external_year?: number
  external_source?: string
}

type CreateCitationInput = (CreateInternalCitationInput | CreateExternalCitationInput) & {
  type?: 'internal' | 'external'
}

/**
 * GET /api/citations
 * Get citations for a post
 * Query params: source_post_id, target_post_id, type, limit, offset
 */
async function handleGetCitations(request: Request): Promise<NextResponse> {
  const supabase = await createServerClient()
  const params = getQueryParams(request)

  const sourcePostId = params.get('source_post_id')
  const targetPostId = params.get('target_post_id')
  const citationType = params.get('type') as 'internal' | 'external' | null
  const limit = parseInt(params.get('limit') || '50', 10)
  const offset = parseInt(params.get('offset') || '0', 10)

  if (!sourcePostId && !targetPostId) {
    return errorResponse('Either source_post_id or target_post_id is required', 422)
  }

  let query = supabase
    .from('citations')
    .select(`
      *,
      source_post:posts!citations_source_post_id_fkey(id, title, author_id, created_at, author:users(name, email)),
      target_post:posts!citations_target_post_id_fkey(id, title, author_id, created_at, author:users(name, email)),
      creator:users!citations_created_by_fkey(id, name, email)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (sourcePostId) {
    query = query.eq('source_post_id', sourcePostId)
  }

  if (targetPostId) {
    query = query.eq('target_post_id', targetPostId)
  }

  if (citationType) {
    query = query.eq('type', citationType)
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
 * Supports both internal (SyriaHub post) and external (DOI/URL) citations
 */
async function handleCreateCitation(request: Request): Promise<NextResponse> {
  // Verify authentication
  const user = await verifyAuth()

  const supabase = await createServerClient()

  // Parse request body
  const body = await parseRequestBody<CreateCitationInput>(request)

  // Validate source_post_id is always required
  validateRequiredFields(body, ['source_post_id'])

  const {
    source_post_id,
    type = 'internal',
  } = body

  // Verify source post exists
  const { data: sourcePost, error: sourceError } = await supabase
    .from('posts')
    .select('id')
    .eq('id', source_post_id)
    .single()

  if (sourceError || !sourcePost) {
    return errorResponse('Source post not found', 404)
  }

  // Handle internal citations
  if (type === 'internal') {
    const { target_post_id, quote_content } = body as CreateInternalCitationInput

    if (!target_post_id) {
      return errorResponse('target_post_id is required for internal citations', 422)
    }

    // Validate that posts are different
    if (source_post_id === target_post_id) {
      return errorResponse('A post cannot cite itself', 422)
    }

    // Verify target post exists
    const { data: targetPost, error: targetError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', target_post_id)
      .single()

    if (targetError || !targetPost) {
      return errorResponse('Target post not found', 404)
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

    // Create internal citation
    const { data, error } = await supabase
      .from('citations')
      .insert({
        source_post_id,
        target_post_id,
        quote_content: quote_content || null,
        type: 'internal',
        created_by: user.id,
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

  // Handle external citations
  if (type === 'external') {
    const {
      external_url,
      external_doi,
      external_title,
      external_author,
      external_year,
      external_source
    } = body as CreateExternalCitationInput

    // Require at least DOI or URL
    if (!external_doi && !external_url) {
      return errorResponse('External citations require either external_doi or external_url', 422)
    }

    // Check for duplicate external citation (same source post + DOI or URL)
    let duplicateQuery = supabase
      .from('citations')
      .select('id')
      .eq('source_post_id', source_post_id)
      .eq('type', 'external')

    if (external_doi) {
      // Note: DOI will be normalized by database trigger
      duplicateQuery = duplicateQuery.eq('external_doi', external_doi.toLowerCase().trim())
    } else if (external_url) {
      duplicateQuery = duplicateQuery.eq('external_url', external_url)
    }

    const { data: existingExternal } = await duplicateQuery.single()

    if (existingExternal) {
      return errorResponse('This external source is already cited in this post', 409)
    }

    // Create external citation
    const { data, error } = await supabase
      .from('citations')
      .insert({
        source_post_id,
        target_post_id: null, // External citations don't link to internal posts
        type: 'external',
        created_by: user.id,
        external_url: external_url || null,
        external_doi: external_doi || null, // Will be normalized by trigger
        external_title: external_title || null,
        external_author: external_author || null,
        external_year: external_year || null,
        external_source: external_source || null,
      })
      .select('*')
      .single()

    if (error) {
      return handleSupabaseError(error)
    }

    return successResponse(data, 201)
  }

  return errorResponse('Invalid citation type. Must be "internal" or "external"', 422)
}

export const GET = withErrorHandling(handleGetCitations, {
  cache: {
    maxAge: 300,
    staleWhileRevalidate: 900,
  },
})
export const POST = withErrorHandling(handleCreateCitation)
