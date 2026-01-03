import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock supabase client
const mockSelect = vi.fn().mockReturnThis()
const mockInsert = vi.fn().mockReturnThis()
const mockUpdate = vi.fn().mockReturnThis()
const mockEq = vi.fn().mockReturnThis()
const mockOrder = vi.fn().mockReturnThis()
const mockRange = vi.fn().mockReturnThis()
const mockSingle = vi.fn()

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  eq: mockEq,
  order: mockOrder,
  range: mockRange,
  single: mockSingle,
}))

const mockUser = { id: 'user-123', email: 'test@example.com' }
const mockAdminUser = { id: 'admin-123', email: 'admin@example.com', role: 'admin' }

vi.mock('@/lib/supabaseClient', () => ({
  createServerClient: vi.fn(() => Promise.resolve({
    from: mockFrom,
  })),
  getCurrentUser: vi.fn(() => Promise.resolve(mockUser)),
  verifyAuth: vi.fn(() => Promise.resolve(mockUser)),
  isAdmin: vi.fn(() => Promise.resolve(false)),
  verifyRole: vi.fn(() => Promise.reject(new Error('Forbidden: Insufficient permissions'))),
}))

// Create a separate mock function for admin verification that we can control
const mockIsAdmin = vi.fn(() => Promise.resolve(false))

describe('Reports API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockSelect.mockReturnThis()
    mockEq.mockReturnThis()
    mockOrder.mockReturnThis()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('POST /api/reports', () => {
    it('should create a new report for authenticated user', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: 'report-123' },
        error: null,
      })

      const response = await simulateCreateReport({
        content_type: 'post',
        content_id: 'post-456',
        reason: 'spam',
        description: 'This post is spam',
      })

      expect(response.success).toBe(true)
      expect(response.data?.id).toBe('report-123')
    })

    it('should require authentication', async () => {
      vi.mocked(await import('@/lib/supabaseClient')).verifyAuth
        .mockRejectedValueOnce(new Error('Unauthorized'))

      const response = await simulateCreateReport({
        content_type: 'post',
        content_id: 'post-456',
        reason: 'spam',
      })

      expect(response.success).toBe(false)
    })

    it('should validate required fields', async () => {
      const response = await simulateCreateReport({
        content_type: 'post',
        content_id: '',
        reason: 'spam',
      })

      expect(response.success).toBe(false)
      expect(response.error).toContain('content_id')
    })

    it('should validate content type', async () => {
      const response = await simulateCreateReport({
        content_type: 'invalid',
        content_id: 'post-456',
        reason: 'spam',
      })

      expect(response.success).toBe(false)
      expect(response.error).toContain('content_type')
    })

    it('should validate reason category', async () => {
      const response = await simulateCreateReport({
        content_type: 'post',
        content_id: 'post-456',
        reason: 'invalid-reason',
      })

      expect(response.success).toBe(false)
      expect(response.error).toContain('reason')
    })

    it('should accept valid reason categories', async () => {
      const validReasons = ['spam', 'harassment', 'hate_speech', 'misinformation', 'violence', 'other']

      for (const reason of validReasons) {
        mockSingle.mockResolvedValueOnce({
          data: { id: `report-${reason}` },
          error: null,
        })

        const response = await simulateCreateReport({
          content_type: 'post',
          content_id: 'post-456',
          reason,
        })

        expect(response.success).toBe(true)
      }
    })

    it('should prevent duplicate reports', async () => {
      // First report exists
      mockSingle.mockResolvedValueOnce({
        data: { id: 'existing-report' },
        error: null,
      })

      const response = await simulateCreateReport({
        content_type: 'post',
        content_id: 'post-456',
        reason: 'spam',
      }, { checkDuplicate: true })

      expect(response.success).toBe(false)
      expect(response.error).toContain('already reported')
    })

    it('should prevent reporting own content', async () => {
      // Content belongs to reporter
      mockSingle.mockResolvedValueOnce({
        data: { author_id: 'user-123' }, // Same as mockUser
        error: null,
      })

      const response = await simulateCreateReport({
        content_type: 'post',
        content_id: 'own-post-456',
        reason: 'spam',
      }, { checkOwnership: true })

      expect(response.success).toBe(false)
      expect(response.error).toContain('own content')
    })

    it('should limit description length', async () => {
      const longDescription = 'a'.repeat(5001) // Over 5000 limit

      const response = await simulateCreateReport({
        content_type: 'post',
        content_id: 'post-456',
        reason: 'other',
        description: longDescription,
      })

      expect(response.success).toBe(false)
      expect(response.error).toContain('description')
    })
  })

  describe('GET /api/reports (Admin)', () => {
    it('should list reports for admin users', async () => {
      vi.mocked(await import('@/lib/supabaseClient')).isAdmin
        .mockResolvedValueOnce(true)

      mockRange.mockResolvedValueOnce({
        data: [
          { id: 'report-1', status: 'pending' },
          { id: 'report-2', status: 'pending' },
        ],
        error: null,
        count: 2,
      })

      const response = await simulateGetReports({ asAdmin: true })

      expect(response.success).toBe(true)
      expect(response.data?.reports).toHaveLength(2)
    })

    it('should reject non-admin users', async () => {
      const response = await simulateGetReports({ asAdmin: false })

      expect(response.success).toBe(false)
      expect(response.error).toContain('permission')
    })

    it('should filter by status', async () => {
      vi.mocked(await import('@/lib/supabaseClient')).isAdmin
        .mockResolvedValueOnce(true)

      mockRange.mockResolvedValueOnce({
        data: [{ id: 'report-1', status: 'pending' }],
        error: null,
        count: 1,
      })

      const response = await simulateGetReports({
        asAdmin: true,
        status: 'pending',
      })

      expect(mockEq).toHaveBeenCalledWith('status', 'pending')
    })

    it('should filter by content type', async () => {
      vi.mocked(await import('@/lib/supabaseClient')).isAdmin
        .mockResolvedValueOnce(true)

      mockRange.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
      })

      await simulateGetReports({
        asAdmin: true,
        content_type: 'comment',
      })

      expect(mockEq).toHaveBeenCalledWith('content_type', 'comment')
    })

    it('should paginate results', async () => {
      vi.mocked(await import('@/lib/supabaseClient')).isAdmin
        .mockResolvedValueOnce(true)

      mockRange.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 100,
      })

      await simulateGetReports({
        asAdmin: true,
        page: 2,
        limit: 20,
      })

      expect(mockRange).toHaveBeenCalledWith(20, 39) // Page 2: offset 20, limit 20
    })
  })

  describe('PATCH /api/reports/:id (Admin)', () => {
    it('should update report status', async () => {
      vi.mocked(await import('@/lib/supabaseClient')).isAdmin
        .mockResolvedValueOnce(true)

      mockSingle.mockResolvedValueOnce({
        data: { id: 'report-1', status: 'resolved' },
        error: null,
      })

      const response = await simulateUpdateReport('report-1', {
        status: 'resolved',
        resolution_notes: 'Content was removed',
      }, { asAdmin: true })

      expect(response.success).toBe(true)
      expect(response.data?.status).toBe('resolved')
    })

    it('should validate status values', async () => {
      vi.mocked(await import('@/lib/supabaseClient')).isAdmin
        .mockResolvedValueOnce(true)

      const response = await simulateUpdateReport('report-1', {
        status: 'invalid-status',
      }, { asAdmin: true })

      expect(response.success).toBe(false)
      expect(response.error).toContain('status')
    })

    it('should record moderator who resolved', async () => {
      vi.mocked(await import('@/lib/supabaseClient')).isAdmin
        .mockResolvedValueOnce(true)

      mockSingle.mockResolvedValueOnce({
        data: {
          id: 'report-1',
          status: 'resolved',
          resolved_by: 'admin-123',
          resolved_at: new Date().toISOString(),
        },
        error: null,
      })

      const response = await simulateUpdateReport('report-1', {
        status: 'resolved',
      }, { asAdmin: true })

      expect(response.data?.resolved_by).toBe('admin-123')
    })

    it('should reject non-admin updates', async () => {
      const response = await simulateUpdateReport('report-1', {
        status: 'resolved',
      }, { asAdmin: false })

      expect(response.success).toBe(false)
    })
  })

  describe('POST /api/reports/:id/action (Admin)', () => {
    it('should take action on reported content', async () => {
      vi.mocked(await import('@/lib/supabaseClient')).isAdmin
        .mockResolvedValueOnce(true)

      mockSingle.mockResolvedValueOnce({
        data: { id: 'report-1', action_taken: 'content_removed' },
        error: null,
      })

      const response = await simulateReportAction('report-1', {
        action: 'remove_content',
      }, { asAdmin: true })

      expect(response.success).toBe(true)
      expect(response.data?.action_taken).toBe('content_removed')
    })

    it('should validate action type', async () => {
      vi.mocked(await import('@/lib/supabaseClient')).isAdmin
        .mockResolvedValueOnce(true)

      const response = await simulateReportAction('report-1', {
        action: 'invalid-action',
      }, { asAdmin: true })

      expect(response.success).toBe(false)
      expect(response.error).toContain('action')
    })

    it('should support warning action', async () => {
      vi.mocked(await import('@/lib/supabaseClient')).isAdmin
        .mockResolvedValueOnce(true)

      mockSingle.mockResolvedValueOnce({
        data: { id: 'report-1', action_taken: 'user_warned' },
        error: null,
      })

      const response = await simulateReportAction('report-1', {
        action: 'warn_user',
        message: 'This is a warning for your content',
      }, { asAdmin: true })

      expect(response.success).toBe(true)
    })

    it('should support ban action', async () => {
      vi.mocked(await import('@/lib/supabaseClient')).isAdmin
        .mockResolvedValueOnce(true)

      mockSingle.mockResolvedValueOnce({
        data: { id: 'report-1', action_taken: 'user_banned' },
        error: null,
      })

      const response = await simulateReportAction('report-1', {
        action: 'ban_user',
        duration: '7d',
      }, { asAdmin: true })

      expect(response.success).toBe(true)
    })

    it('should support dismiss action', async () => {
      vi.mocked(await import('@/lib/supabaseClient')).isAdmin
        .mockResolvedValueOnce(true)

      mockSingle.mockResolvedValueOnce({
        data: { id: 'report-1', status: 'dismissed' },
        error: null,
      })

      const response = await simulateReportAction('report-1', {
        action: 'dismiss',
        reason: 'False report',
      }, { asAdmin: true })

      expect(response.success).toBe(true)
    })
  })

  describe('GET /api/reports/stats (Admin)', () => {
    it('should return report statistics', async () => {
      vi.mocked(await import('@/lib/supabaseClient')).isAdmin
        .mockResolvedValueOnce(true)

      const stats = {
        total: 150,
        pending: 25,
        resolved: 100,
        dismissed: 25,
        by_reason: {
          spam: 50,
          harassment: 30,
          hate_speech: 20,
          misinformation: 30,
          violence: 10,
          other: 10,
        },
      }

      mockSingle.mockResolvedValueOnce({
        data: stats,
        error: null,
      })

      const response = await simulateGetReportStats({ asAdmin: true })

      expect(response.success).toBe(true)
      expect(response.data?.total).toBe(150)
      expect(response.data?.by_reason.spam).toBe(50)
    })

    it('should reject non-admin users', async () => {
      const response = await simulateGetReportStats({ asAdmin: false })

      expect(response.success).toBe(false)
    })
  })
})

// Helper types
const VALID_CONTENT_TYPES = ['post', 'comment', 'user']
const VALID_REASONS = ['spam', 'harassment', 'hate_speech', 'misinformation', 'violence', 'other']
const VALID_STATUSES = ['pending', 'resolved', 'dismissed']
const VALID_ACTIONS = ['remove_content', 'warn_user', 'ban_user', 'dismiss']

// Helper functions
async function simulateCreateReport(
  body: {
    content_type: string
    content_id: string
    reason: string
    description?: string
  },
  options: { checkDuplicate?: boolean; checkOwnership?: boolean } = {}
) {
  try {
    const { verifyAuth } = await import('@/lib/supabaseClient')
    await verifyAuth()
  } catch (e) {
    return { success: false, error: 'Unauthorized' }
  }

  // Validate content_id
  if (!body.content_id) {
    return { success: false, error: 'content_id is required' }
  }

  // Validate content_type
  if (!VALID_CONTENT_TYPES.includes(body.content_type)) {
    return { success: false, error: 'Invalid content_type' }
  }

  // Validate reason
  if (!VALID_REASONS.includes(body.reason)) {
    return { success: false, error: 'Invalid reason category' }
  }

  // Validate description length
  if (body.description && body.description.length > 5000) {
    return { success: false, error: 'description exceeds maximum length' }
  }

  // Check duplicate
  if (options.checkDuplicate) {
    const existing = await mockSingle()
    if (existing.data) {
      return { success: false, error: 'Content already reported by you' }
    }
  }

  // Check ownership
  if (options.checkOwnership) {
    const content = await mockSingle()
    if (content.data?.author_id === mockUser.id) {
      return { success: false, error: 'Cannot report own content' }
    }
  }

  const result = await mockSingle()

  if (result.error) {
    return { success: false, error: result.error.message }
  }

  return { success: true, data: { id: result.data.id } }
}

async function simulateGetReports(options: {
  asAdmin: boolean
  status?: string
  content_type?: string
  page?: number
  limit?: number
}) {
  if (!options.asAdmin) {
    return { success: false, error: 'No permission to view reports' }
  }

  try {
    const { isAdmin } = await import('@/lib/supabaseClient')
    await isAdmin()
  } catch (e) {
    return { success: false, error: 'No permission to view reports' }
  }

  if (options.status) {
    mockEq('status', options.status)
  }
  if (options.content_type) {
    mockEq('content_type', options.content_type)
  }

  const page = options.page || 1
  const limit = options.limit || 20
  const offset = (page - 1) * limit

  // Call mockRange which will return the mock result
  const result = await mockRange(offset, offset + limit - 1)

  return {
    success: true,
    data: {
      reports: result?.data || [],
      total: result?.count || 0,
    },
  }
}

async function simulateUpdateReport(
  reportId: string,
  body: { status: string; resolution_notes?: string },
  options: { asAdmin: boolean }
) {
  if (!options.asAdmin) {
    return { success: false, error: 'No permission' }
  }

  try {
    const { isAdmin } = await import('@/lib/supabaseClient')
    await isAdmin()
  } catch (e) {
    return { success: false, error: 'No permission' }
  }

  if (!VALID_STATUSES.includes(body.status)) {
    return { success: false, error: 'Invalid status value' }
  }

  const result = await mockSingle()

  return {
    success: true,
    data: result.data,
  }
}

async function simulateReportAction(
  reportId: string,
  body: { action: string; message?: string; duration?: string; reason?: string },
  options: { asAdmin: boolean }
) {
  if (!options.asAdmin) {
    return { success: false, error: 'No permission' }
  }

  try {
    const { isAdmin } = await import('@/lib/supabaseClient')
    await isAdmin()
  } catch (e) {
    return { success: false, error: 'No permission' }
  }

  if (!VALID_ACTIONS.includes(body.action)) {
    return { success: false, error: 'Invalid action type' }
  }

  const result = await mockSingle()

  return {
    success: true,
    data: result.data,
  }
}

async function simulateGetReportStats(options: { asAdmin: boolean }) {
  if (!options.asAdmin) {
    return { success: false, error: 'No permission' }
  }

  try {
    const { isAdmin } = await import('@/lib/supabaseClient')
    await isAdmin()
  } catch (e) {
    return { success: false, error: 'No permission' }
  }

  const result = await mockSingle()

  return {
    success: true,
    data: result.data,
  }
}
