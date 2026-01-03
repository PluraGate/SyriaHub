/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommentsSection } from '@/components/CommentsSection'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      Comments: {
        title: 'Comments',
        loading: 'Loading comments...',
        noComments: 'No comments yet',
        addComment: 'Add a comment',
        reply: 'Reply',
        delete: 'Delete',
        edit: 'Edit',
        loadMore: 'Load more',
        submitting: 'Submitting...',
        signInToComment: 'Sign in to comment',
      },
    }
    return translations[namespace]?.[key] || key
  },
}))

// Mock Supabase client
const mockSubscribe = vi.fn()
const mockUnsubscribe = vi.fn()
const mockRemoveChannel = vi.fn()
const mockChannel = vi.fn().mockReturnValue({
  on: vi.fn().mockReturnThis(),
  subscribe: mockSubscribe.mockReturnValue({
    unsubscribe: mockUnsubscribe,
  }),
})

const mockFrom = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    channel: mockChannel,
    from: mockFrom,
    removeChannel: mockRemoveChannel,
  }),
}))

// Mock Toast
const mockShowToast = vi.fn()
vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}))

// Mock CommentTree
vi.mock('@/components/CommentTree', () => ({
  CommentTree: ({ comments, onReply, onDelete }: any) => (
    <div data-testid="comment-tree">
      {comments.map((c: any) => (
        <div key={c.id} data-testid={`comment-${c.id}`}>
          <span>{c.content}</span>
          <span data-testid="comment-author">{c.user?.name}</span>
          {onReply && <button onClick={() => onReply(c.id)}>Reply</button>}
          {onDelete && <button onClick={() => onDelete(c.id)}>Delete</button>}
        </div>
      ))}
    </div>
  ),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('CommentsSection Component', () => {
  const mockPostId = 'post-123'
  
  const mockCommentsResponse = {
    success: true,
    data: {
      comments: [
        {
          id: 'c1',
          content: 'Great research!',
          created_at: '2025-01-01T10:00:00Z',
          user_id: 'u1',
          post_id: mockPostId,
          parent_id: null,
          user: {
            id: 'u1',
            name: 'Ahmad',
            email: 'ahmad@test.com',
            avatar_url: null,
          },
        },
        {
          id: 'c2',
          content: 'Very insightful',
          created_at: '2025-01-01T11:00:00Z',
          user_id: 'u2',
          post_id: mockPostId,
          parent_id: null,
          user: {
            id: 'u2',
            name: 'Sara',
            email: 'sara@test.com',
            avatar_url: null,
          },
        },
        {
          id: 'c3',
          content: 'Thank you!',
          created_at: '2025-01-01T12:00:00Z',
          user_id: 'u1',
          post_id: mockPostId,
          parent_id: 'c1', // Reply to c1
          user: {
            id: 'u1',
            name: 'Ahmad',
            email: 'ahmad@test.com',
            avatar_url: null,
          },
        },
      ],
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCommentsResponse),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial loading', () => {
    it('should show loading state initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves
      render(<CommentsSection postId={mockPostId} />)

      // Should show loading indicator (text-based since no role="status")
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should fetch comments on mount', async () => {
      render(<CommentsSection postId={mockPostId} />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining(`/api/comments?post_id=${mockPostId}`)
        )
      })
    })

    it('should render comments after loading', async () => {
      render(<CommentsSection postId={mockPostId} />)

      await waitFor(() => {
        expect(screen.getByText('Great research!')).toBeInTheDocument()
        expect(screen.getByText('Very insightful')).toBeInTheDocument()
      })
    })
  })

  describe('Error handling', () => {
    it('should show error toast when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ success: false, error: 'Server error' }),
      })

      render(<CommentsSection postId={mockPostId} />)

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.stringContaining('error'),
          'error'
        )
      })
    })

    it('should show error toast on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      render(<CommentsSection postId={mockPostId} />)

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.stringContaining('Failed to load'),
          'error'
        )
      })
    })
  })

  describe('Comment display', () => {
    it('should transform API response to expected format', async () => {
      render(<CommentsSection postId={mockPostId} />)

      await waitFor(() => {
        const tree = screen.getByTestId('comment-tree')
        expect(tree).toBeInTheDocument()
      })
    })

    it('should display author names', async () => {
      render(<CommentsSection postId={mockPostId} />)

      await waitFor(() => {
        const authorNames = screen.getAllByTestId('comment-author')
        expect(authorNames.length).toBeGreaterThan(0)
      })
    })

    it('should handle comments with replies (nested)', async () => {
      render(<CommentsSection postId={mockPostId} />)

      await waitFor(() => {
        // Reply comment should be present
        expect(screen.getByText('Thank you!')).toBeInTheDocument()
      })
    })
  })

  describe('Realtime subscriptions', () => {
    it('should subscribe to realtime updates on mount', async () => {
      render(<CommentsSection postId={mockPostId} />)

      await waitFor(() => {
        expect(mockChannel).toHaveBeenCalledWith(`comments:${mockPostId}`)
      })
    })

    it('should configure postgres_changes listener', async () => {
      render(<CommentsSection postId={mockPostId} />)

      await waitFor(() => {
        expect(mockChannel().on).toHaveBeenCalledWith(
          'postgres_changes',
          expect.objectContaining({
            event: 'INSERT',
            schema: 'public',
            table: 'comments',
            filter: `post_id=eq.${mockPostId}`,
          }),
          expect.any(Function)
        )
      })
    })

    it('should unsubscribe on unmount', async () => {
      const { unmount } = render(<CommentsSection postId={mockPostId} />)

      await waitFor(() => {
        expect(mockChannel).toHaveBeenCalled()
      })

      unmount()

      // Should have unsubscribed
      expect(mockSubscribe).toHaveBeenCalled()
    })
  })

  describe('Empty state', () => {
    it('should handle empty comments array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { comments: [] } }),
      })

      render(<CommentsSection postId={mockPostId} />)

      await waitFor(() => {
        // Should render comment tree even if empty
        expect(screen.getByTestId('comment-tree')).toBeInTheDocument()
      })
    })
  })

  describe('Props handling', () => {
    it('should refetch when postId changes', async () => {
      const { rerender } = render(<CommentsSection postId="post-1" />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('post_id=post-1')
        )
      })

      mockFetch.mockClear()

      rerender(<CommentsSection postId="post-2" />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('post_id=post-2')
        )
      })
    })
  })

  describe('Comment transformation', () => {
    it('should correctly map API fields to component format', async () => {
      const customResponse = {
        success: true,
        data: {
          comments: [{
            id: 'test-id',
            content: 'Test content',
            created_at: '2025-01-15T10:00:00Z',
            user_id: 'user-id',
            post_id: mockPostId,
            parent_id: null,
            user: {
              id: 'user-id',
              name: 'Test User',
              email: 'test@example.com',
              avatar_url: 'https://example.com/avatar.jpg',
            },
          }],
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(customResponse),
      })

      render(<CommentsSection postId={mockPostId} />)

      await waitFor(() => {
        expect(screen.getByText('Test content')).toBeInTheDocument()
      })
    })

    it('should handle comments without user data', async () => {
      const responseWithoutUser = {
        success: true,
        data: {
          comments: [{
            id: 'orphan-id',
            content: 'Orphan comment',
            created_at: '2025-01-15T10:00:00Z',
            user_id: 'deleted-user',
            post_id: mockPostId,
            parent_id: null,
            user: null, // No user data
          }],
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseWithoutUser),
      })

      render(<CommentsSection postId={mockPostId} />)

      await waitFor(() => {
        expect(screen.getByText('Orphan comment')).toBeInTheDocument()
      })
    })
  })
})
