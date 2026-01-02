// Citations API - Delete citation
import { NextResponse } from 'next/server'
import { createServerClient, verifyAuth, canModify } from '@/lib/supabaseClient'
import {
  successResponse,
  handleSupabaseError,
  extractIdFromParams,
  withErrorHandling,
  notFoundResponse,
  forbiddenResponse,
  validateOrigin,
} from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

/**
 * DELETE /api/citations/[id]
 * Delete a citation (source post owner, or moderator/admin)
 */
async function handleDeleteCitation(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // CSRF protection
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const { id } = await params
  const citationId = extractIdFromParams({ id })
  
  // Verify authentication
  const user = await verifyAuth()
  
  const supabase = await createServerClient()

  // Get the citation with source post info
  const { data: citation, error: fetchError } = await supabase
    .from('citations')
    .select(`
      *,
      source_post:posts!citations_source_post_id_fkey(id, author_id)
    `)
    .eq('id', citationId)
    .single()

  if (fetchError || !citation) {
    if (fetchError?.code === 'PGRST116') {
      return notFoundResponse('Citation not found')
    }
    return handleSupabaseError(fetchError)
  }

  // Check if user can delete (owner of source post, or moderator/admin)
  const sourcePost = citation.source_post as any
  if (!(await canModify(sourcePost.author_id))) {
    return forbiddenResponse('You can only delete citations from your own posts')
  }

  // Delete citation
  const { error } = await supabase
    .from('citations')
    .delete()
    .eq('id', citationId)

  if (error) {
    return handleSupabaseError(error)
  }

  return successResponse({ message: 'Citation deleted successfully' })
}

export const DELETE = withRateLimit('write')(withErrorHandling(handleDeleteCitation))
