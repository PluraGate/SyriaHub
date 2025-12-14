'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { CommentTree } from '@/components/CommentTree'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  post_id: string
  parent_id: string | null
  user?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
}

interface CommentsSectionProps {
  postId: string
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { showToast } = useToast()
  const supabase = useMemo(() => createClient(), [])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/comments?post_id=${postId}`)
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        showToast(payload.error || 'Unable to load comments.', 'error')
        return
      }

      // Transform the API response to match CommentTree's expected format
      const transformedComments = (payload.data?.comments || []).map((c: any) => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        user_id: c.user_id,
        post_id: c.post_id,
        parent_id: c.parent_id,
        user: c.user ? {
          id: c.user.id,
          name: c.user.name,
          email: c.user.email,
          avatar_url: c.user.avatar_url,
        } : undefined,
      }))

      setComments(transformedComments)
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

  // Realtime subscription for new comments on this post
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          // Fetch the full comment with user data
          const { data: newComment } = await supabase
            .from('comments')
            .select(`
              *,
              user:users!comments_user_id_fkey(id, name, email, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single()

          if (newComment) {
            const transformedComment: Comment = {
              id: newComment.id,
              content: newComment.content,
              created_at: newComment.created_at,
              user_id: newComment.user_id,
              post_id: newComment.post_id,
              parent_id: newComment.parent_id,
              user: newComment.user ? {
                id: newComment.user.id,
                name: newComment.user.name,
                email: newComment.user.email,
                avatar_url: newComment.user.avatar_url,
              } : undefined,
            }

            setComments((prev) => {
              // Avoid duplicates (in case we also did a manual refresh)
              if (prev.some(c => c.id === transformedComment.id)) {
                return prev
              }
              return [...prev, transformedComment]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, supabase])

  if (loading) {
    return (
      <section className="mt-10">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-5 h-5 text-primary dark:text-accent-light" />
          <h2 className="text-xl font-display font-semibold text-primary dark:text-dark-text">
            Discussion
          </h2>
        </div>
        <div className="flex items-center justify-center py-8 text-text-light dark:text-dark-text-muted">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading comments...
        </div>
      </section>
    )
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

      <div className="card p-6">
        <CommentTree
          postId={postId}
          comments={comments}
          onCommentAdded={fetchComments}
        />
      </div>
    </section>
  )
}

