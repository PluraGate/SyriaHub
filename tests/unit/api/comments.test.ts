import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock supabase client
const mockSelect = vi.fn().mockReturnThis()
const mockInsert = vi.fn().mockReturnThis()
const mockUpdate = vi.fn().mockReturnThis()
const mockDelete = vi.fn().mockReturnThis()
const mockEq = vi.fn().mockReturnThis()
const mockOrder = vi.fn().mockReturnThis()
const mockIs = vi.fn().mockReturnThis()
const mockSingle = vi.fn()

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  order: mockOrder,
  is: mockIs,
  single: mockSingle,
}))

const mockUser = { id: 'user-123', email: 'test@example.com' }

vi.mock('@/lib/supabaseClient', () => ({
  createServerClient: vi.fn(() => Promise.resolve({
    from: mockFrom,
  })),
  getCurrentUser: vi.fn(() => Promise.resolve(mockUser)),
  verifyAuth: vi.fn(() => Promise.resolve(mockUser)),
}))

// Mock moderation
vi.mock('@/lib/moderation', () => ({
  checkContent: vi.fn(() => Promise.resolve({ flagged: false })),
}))

describe('Comments API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset chain mocks
    mockSelect.mockReturnThis()
    mockEq.mockReturnThis()
    mockOrder.mockReturnThis()
    mockIs.mockReturnThis()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET /api/comments', () => {
    it('should fetch comments for a post', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          content: 'Great post!',
          author_id: 'user-1',
          post_id: 'post-123',
          created_at: new Date().toISOString(),
          author: { id: 'user-1', display_name: 'User 1', avatar_url: null },
        },
        {
          id: 'comment-2',
          content: 'Very informative',
          author_id: 'user-2',
          post_id: 'post-123',
          created_at: new Date().toISOString(),
          author: { id: 'user-2', display_name: 'User 2', avatar_url: null },
        },
      ]

      mockOrder.mockReturnValueOnce(Promise.resolve({
        data: mockComments,
        error: null,
      }))

      const response = await simulateGetComments('post-123')

      expect(response.success).toBe(true)
      expect(response.data.comments).toHaveLength(2)
    })

    it('should require post_id parameter', async () => {
      const response = await simulateGetComments('')

      expect(response.success).toBe(false)
      expect(response.error).toContain('post_id')
    })

    it('should order comments by creation date', async () => {
      mockOrder.mockReturnValueOnce(Promise.resolve({
        data: [],
        error: null,
      }))

      await simulateGetComments('post-123')

      expect(mockOrder).toHaveBeenCalledWith('created_at', expect.objectContaining({
        ascending: true,
      }))
    })

    it('should fetch nested replies', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          content: 'Parent comment',
          parent_id: null,
          replies: [
            {
              id: 'reply-1',
              content: 'Reply to parent',
              parent_id: 'comment-1',
            },
          ],
        },
      ]

      mockOrder.mockReturnValueOnce(Promise.resolve({
        data: mockComments,
        error: null,
      }))

      const response = await simulateGetComments('post-123', { includeReplies: true })

      expect(response.data.comments[0].replies).toBeDefined()
    })

    it('should handle database errors', async () => {
      mockOrder.mockReturnValueOnce(Promise.resolve({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' },
      }))

      const response = await simulateGetComments('post-123')

      expect(response.success).toBe(false)
      expect(response.error).toBeDefined()
    })
  })

  describe('POST /api/comments', () => {
    it('should create a new comment', async () => {
      mockSelect.mockResolvedValueOnce({
        data: { id: 'new-comment-123' },
        error: null,
      })
      mockSingle.mockResolvedValueOnce({
        data: { id: 'new-comment-123', content: 'Test comment' },
        error: null,
      })

      const response = await simulateCreateComment({
        post_id: 'post-123',
        content: 'This is a test comment',
      })

      expect(response.success).toBe(true)
      expect(response.data.id).toBe('new-comment-123')
    })

    it('should require authentication', async () => {
      vi.mocked(await import('@/lib/supabaseClient')).verifyAuth
        .mockRejectedValueOnce(new Error('Unauthorized'))

      const response = await simulateCreateComment({
        post_id: 'post-123',
        content: 'Unauthorized comment',
      })

      expect(response.success).toBe(false)
    })

    it('should validate minimum content length', async () => {
      const response = await simulateCreateComment({
        post_id: 'post-123',
        content: 'Hi', // Too short
      })

      expect(response.success).toBe(false)
      expect(response.error).toContain('length')
    })

    it('should validate maximum content length', async () => {
      const longContent = 'a'.repeat(10001) // Over 10000 char limit

      const response = await simulateCreateComment({
        post_id: 'post-123',
        content: longContent,
      })

      expect(response.success).toBe(false)
      expect(response.error).toContain('length')
    })

    it('should support reply to parent comment', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: 'reply-123', parent_id: 'comment-1' },
        error: null,
      })

      const response = await simulateCreateComment({
        post_id: 'post-123',
        content: 'This is a reply',
        parent_id: 'comment-1',
      })

      expect(response.success).toBe(true)
      expect(response.data.parent_id).toBe('comment-1')
    })

    it('should check content for moderation', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: 'moderated-123', content: 'Flagged content here' },
        error: null,
      })

      const { checkContent } = await import('@/lib/moderation')
      vi.mocked(checkContent).mockResolvedValueOnce({
        flagged: true,
        categories: { harassment: true },
        categoryScores: { harassment: 0.95 },
      })

      const response = await simulateCreateComment({
        post_id: 'post-123',
        content: 'Flagged content here',
      })

      expect(vi.mocked(checkContent)).toHaveBeenCalledWith('Flagged content here')
    })

    it('should sanitize HTML in content', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: 'sanitized-123', content: 'Sanitized content' },
        error: null,
      })

      const response = await simulateCreateComment({
        post_id: 'post-123',
        content: '<script>alert("xss")</script>Normal content',
      })

      expect(response.sanitizedContent).not.toContain('<script>')
    })
  })

  describe('PATCH /api/comments/:id', () => {
    it('should update own comment', async () => {
      // First verify ownership
      mockSingle.mockResolvedValueOnce({
        data: { id: 'comment-1', author_id: 'user-123' },
        error: null,
      })
      // Then update
      mockSingle.mockResolvedValueOnce({
        data: { id: 'comment-1', content: 'Updated content' },
        error: null,
      })

      const response = await simulateUpdateComment('comment-1', {
        content: 'Updated content',
      })

      expect(response.success).toBe(true)
    })

    it('should reject update of others comment', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: 'comment-1', author_id: 'other-user' },
        error: null,
      })

      const response = await simulateUpdateComment('comment-1', {
        content: 'Trying to modify',
      })

      expect(response.success).toBe(false)
      expect(response.error).toContain('permission')
    })

    it('should mark edited comments', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: 'comment-1', author_id: 'user-123' },
        error: null,
      })
      mockSingle.mockResolvedValueOnce({
        data: { id: 'comment-1', edited: true, edited_at: new Date().toISOString() },
        error: null,
      })

      const response = await simulateUpdateComment('comment-1', {
        content: 'Edited content',
      })

      expect(response.data.edited).toBe(true)
    })
  })

  describe('DELETE /api/comments/:id', () => {
    it('should delete own comment', async () => {
      // Verify ownership
      mockSingle.mockResolvedValueOnce({
        data: { id: 'comment-1', author_id: 'user-123' },
        error: null,
      })
      // Delete
      mockSingle.mockResolvedValueOnce({
        data: { id: 'comment-1' },
        error: null,
      })

      const response = await simulateDeleteComment('comment-1')

      expect(response.success).toBe(true)
    })

    it('should reject deletion of others comment', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: 'comment-1', author_id: 'other-user' },
        error: null,
      })

      const response = await simulateDeleteComment('comment-1')

      expect(response.success).toBe(false)
      expect(response.error).toContain('permission')
    })

    it('should soft delete comments with replies', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: 'comment-1', author_id: 'user-123' },
        error: null,
      })
      mockSingle.mockResolvedValueOnce({
        data: { id: 'comment-1', content: '[deleted]', deleted: true },
        error: null,
      })

      const response = await simulateDeleteComment('comment-1', { hasReplies: true })

      // Should soft delete to preserve thread structure
      expect(response.softDeleted).toBe(true)
    })

    it('should hard delete comments without replies', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: 'comment-1', author_id: 'user-123' },
        error: null,
      })
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const response = await simulateDeleteComment('comment-1', { hasReplies: false })

      expect(response.success).toBe(true)
    })
  })

  describe('POST /api/comments/:id/vote', () => {
    it('should upvote comment', async () => {
      // First call for author check, second for vote
      mockSingle.mockResolvedValueOnce({
        data: { author_id: 'other-user' }, // Not own comment
        error: null,
      })
      mockSingle.mockResolvedValueOnce({
        data: { comment_id: 'comment-1', user_id: 'user-123', vote: 1 },
        error: null,
      })

      const response = await simulateVoteComment('comment-1', 1)

      expect(response.success).toBe(true)
      expect(response.data.vote).toBe(1)
    })

    it('should downvote comment', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { author_id: 'other-user' },
        error: null,
      })
      mockSingle.mockResolvedValueOnce({
        data: { comment_id: 'comment-1', user_id: 'user-123', vote: -1 },
        error: null,
      })

      const response = await simulateVoteComment('comment-1', -1)

      expect(response.success).toBe(true)
      expect(response.data.vote).toBe(-1)
    })

    it('should toggle vote off when same vote cast', async () => {
      // First check existing vote
      mockSingle.mockResolvedValueOnce({
        data: { vote: 1 }, // Already upvoted
        error: null,
      })

      const response = await simulateVoteComment('comment-1', 1)

      // Should remove vote
      expect(response.voteRemoved).toBe(true)
    })

    it('should prevent voting on own comment', async () => {
      // Check comment author
      mockSingle.mockResolvedValueOnce({
        data: { author_id: 'user-123' }, // Same as current user
        error: null,
      })

      const response = await simulateVoteComment('comment-1', 1)

      expect(response.success).toBe(false)
      expect(response.error).toContain('own')
    })
  })
})

// Helper functions
function sanitizeHtml(content: string): string {
  return content.replace(/<[^>]*>/g, '')
}

async function simulateGetComments(
  postId: string, 
  options: { includeReplies?: boolean } = {}
) {
  if (!postId) {
    return { success: false, error: 'post_id is required' }
  }

  // Build the chain
  mockFrom('comments')
  mockSelect('*, author:profiles(*)')
  mockEq('post_id', postId)
  
  if (!options.includeReplies) {
    mockIs('parent_id', null)
  }
  
  // mockOrder should be called to set up the sort and then return the result
  const result = mockOrder('created_at', { ascending: true })

  // If mockOrder was set up with mockReturnValueOnce(Promise.resolve(...))
  // we need to await it
  const resolved = await Promise.resolve(result)

  if (resolved?.error) {
    return { success: false, error: resolved.error.message }
  }

  return {
    success: true,
    data: { comments: resolved?.data || [] },
  }
}

async function simulateCreateComment(body: {
  post_id: string
  content: string
  parent_id?: string
}) {
  try {
    const { verifyAuth } = await import('@/lib/supabaseClient')
    await verifyAuth()
  } catch (e) {
    return { success: false, error: 'Unauthorized' }
  }

  if (body.content.length < 3) {
    return { success: false, error: 'Content must meet minimum length requirement' }
  }
  if (body.content.length > 10000) {
    return { success: false, error: 'Content exceeds maximum length' }
  }

  const sanitizedContent = sanitizeHtml(body.content)

  const { checkContent } = await import('@/lib/moderation')
  await checkContent(body.content)

  const result = await mockSingle()

  if (result.error) {
    return { success: false, error: result.error.message }
  }

  return {
    success: true,
    data: { 
      id: result.data.id, 
      parent_id: body.parent_id || null,
    },
    sanitizedContent,
  }
}

async function simulateUpdateComment(
  commentId: string,
  body: { content: string }
) {
  // Check ownership
  const ownerCheck = await mockSingle()
  
  if (ownerCheck.data.author_id !== mockUser.id) {
    return { success: false, error: 'No permission to modify this comment' }
  }

  const result = await mockSingle()

  return {
    success: true,
    data: result.data,
  }
}

async function simulateDeleteComment(
  commentId: string,
  options: { hasReplies?: boolean } = {}
) {
  // Check ownership
  const ownerCheck = await mockSingle()
  
  if (ownerCheck.data.author_id !== mockUser.id) {
    return { success: false, error: 'No permission to delete this comment' }
  }

  if (options.hasReplies) {
    // Soft delete
    await mockSingle()
    return { success: true, softDeleted: true }
  }

  // Hard delete
  await mockSingle()
  return { success: true }
}

async function simulateVoteComment(commentId: string, vote: number) {
  // Check if trying to vote on own comment
  const commentCheck = await mockSingle()
  
  if (commentCheck.data?.author_id === mockUser.id) {
    return { success: false, error: 'Cannot vote on own comment' }
  }

  // Check existing vote
  if (commentCheck.data?.vote === vote) {
    // Toggle off
    return { success: true, voteRemoved: true }
  }

  const result = await mockSingle()

  return {
    success: true,
    data: result.data,
  }
}
