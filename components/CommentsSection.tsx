'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { ReportButton } from '@/components/ReportButton'

interface CommentUser {
  id: string
  name?: string | null
  email?: string | null
}

interface CommentItem {
  id: string
  content: string
  created_at: string
  user?: CommentUser | null
}

interface CommentsSectionProps {
  postId: string
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { showToast } = useToast()
  const supabase = useMemo(() => createClient(), [])
  const [viewerId, setViewerId] = useState<string | null>(null)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [content, setContent] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setViewerId(data.user?.id ?? null)
    })
  }, [supabase])

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/comments?post_id=${postId}`)
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        showToast(payload.error || 'Unable to load comments.', 'error')
        return
      }

      setComments(payload.data?.comments || [])
    } catch (error) {
      console.error('Comments fetch error:', error)
      showToast('Failed to load comments.', 'error')
    } finally {
      setLoading(false)
    }
  }, [postId, showToast])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = content.trim()

    if (!viewerId) {
      showToast('Please sign in to join the discussion.', 'warning')
      return
    }

    if (trimmed.length < 3) {
      showToast('Please share a bit more context.', 'warning')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed, post_id: postId }),
      })

      const payload = await response.json()

      if (!response.ok || !payload.success) {
        showToast(payload.error || 'Unable to post comment.', 'error')
        return
      }

      if (payload.warnings?.length) {
        showToast(payload.warnings[0], 'warning')
      } else {
        showToast('Comment posted.', 'success')
      }

      setContent('')
      fetchComments()
    } catch (error) {
      console.error('Comment submit error:', error)
      showToast('Failed to post comment.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-primary dark:text-accent-light" />
        <h2 className="text-xl font-display font-semibold text-primary dark:text-dark-text">
          Discussion
        </h2>
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 dark:bg-accent-light/20 text-primary dark:text-accent-light">
          {comments.length}
        </span>
      </div>

      {viewerId ? (
        <form onSubmit={handleSubmit} className="card p-4 mb-6 space-y-3">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Share insights, sources, or constructive feedback..."
            className="w-full rounded-lg border border-gray-200 dark:border-dark-border bg-background-white dark:bg-dark-bg text-text dark:text-dark-text p-3 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-accent-light/40"
            rows={4}
            maxLength={5000}
          />
          <div className="flex items-center justify-between text-xs text-text-light dark:text-dark-text-muted">
            <span>{content.length}/5000</span>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary px-4 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting…' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="card p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-text-light dark:text-dark-text-muted">
            Sign in to contribute to the conversation.
          </p>
          <Link href="/auth/login" className="btn btn-outline text-sm">
            Sign In
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-text-light dark:text-dark-text-muted">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="card p-6 text-center text-text-light dark:text-dark-text-muted">
            No comments yet. Start the discussion.
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="card p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-text dark:text-dark-text">
                    {comment.user?.name ||
                      comment.user?.email?.split('@')[0] ||
                      'Anonymous'}
                  </p>
                  <p className="text-xs text-text-light dark:text-dark-text-muted">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
                {viewerId && viewerId !== comment.user?.id && (
                  <ReportButton
                    commentId={comment.id}
                    className="text-right"
                  />
                )}
              </div>
              <p className="text-sm leading-relaxed text-text dark:text-dark-text whitespace-pre-line">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
