'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { MessageSquare, ChevronDown, ChevronUp, CornerDownRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useDateFormatter } from '@/hooks/useDateFormatter'

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
    children?: Comment[]
}

interface CommentTreeProps {
    postId: string
    comments: Comment[]
    onCommentAdded?: () => void
}

interface CommentNodeProps {
    comment: Comment
    depth: number
    postId: string
    onReply: (parentId: string, content: string) => Promise<void>
}

function CommentNode({ comment, depth, postId, onReply }: CommentNodeProps) {
    const t = useTranslations('Comments')
    const tForms = useTranslations('Forms')
    const tCommon = useTranslations('Common')
    const { formatDate } = useDateFormatter()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isReplying, setIsReplying] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmitReply = async () => {
        if (!replyContent.trim()) return
        setSubmitting(true)
        try {
            await onReply(comment.id, replyContent)
            setReplyContent('')
            setIsReplying(false)
        } finally {
            setSubmitting(false)
        }
    }

    const hasChildren = comment.children && comment.children.length > 0
    const maxDepth = 4 // Max visual nesting depth

    return (
        <div className={cn('relative', depth > 0 && 'ms-4 ps-4 border-s border-gray-200 dark:border-dark-border')}>
            <div className="py-3">
                {/* Comment Header */}
                <div className="flex items-start gap-3">
                    {comment.user?.id ? (
                        <Link href={`/profile/${comment.user.id}`} className="shrink-0 hover:opacity-80 transition-opacity">
                            <UserAvatar
                                name={comment.user?.name}
                                email={comment.user?.email}
                                avatarUrl={comment.user?.avatar_url}
                                size="sm"
                            />
                        </Link>
                    ) : (
                        <UserAvatar
                            name={comment.user?.name}
                            email={comment.user?.email}
                            avatarUrl={comment.user?.avatar_url}
                            size="sm"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            {comment.user?.id ? (
                                <Link href={`/profile/${comment.user.id}`} className="text-sm font-medium text-text dark:text-dark-text hover:text-primary dark:hover:text-accent-light transition-colors">
                                    {comment.user?.name || t('anonymous')}
                                </Link>
                            ) : (
                                <span className="text-sm font-medium text-text dark:text-dark-text">
                                    {comment.user?.name || t('anonymous')}
                                </span>
                            )}
                            <span className="text-xs text-text-light dark:text-dark-text-muted">
                                {formatDate(comment.created_at, 'distance')}
                            </span>
                        </div>

                        {/* Comment Content */}
                        <p className="mt-1 text-sm text-text dark:text-dark-text whitespace-pre-wrap">
                            {comment.content}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-2">
                            {depth < maxDepth && (
                                <button
                                    onClick={() => setIsReplying(!isReplying)}
                                    className="text-xs text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text flex items-center gap-1"
                                >
                                    <CornerDownRight className="w-3 h-3" />
                                    {t('reply')}
                                </button>
                            )}

                            {hasChildren && (
                                <button
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                    className="text-xs text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text flex items-center gap-1"
                                >
                                    {isCollapsed ? (
                                        <>
                                            <ChevronDown className="w-3 h-3" />
                                            {t('showReplies', { count: comment.children!.length })}
                                        </>
                                    ) : (
                                        <>
                                            <ChevronUp className="w-3 h-3" />
                                            {t('hideReplies')}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Reply Form */}
                        {isReplying && (
                            <div className="mt-3 space-y-2">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder={tForms('writeReply')}
                                    rows={2}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSubmitReply}
                                        disabled={submitting || !replyContent.trim()}
                                        className="px-3 py-1 text-xs font-medium rounded-md bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            t('reply')
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setIsReplying(false)}
                                        className="px-3 py-1 text-xs text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text"
                                    >
                                        {tCommon('cancel')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Children */}
            {
                hasChildren && !isCollapsed && (
                    <div>
                        {comment.children!.map((child) => (
                            <CommentNode
                                key={child.id}
                                comment={child}
                                depth={depth + 1}
                                postId={postId}
                                onReply={onReply}
                            />
                        ))}
                    </div>
                )}
        </div>
    )
}

export function CommentTree({ postId, comments, onCommentAdded }: CommentTreeProps) {
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [newComment, setNewComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const t = useTranslations('Comments')

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
        })
    }, [supabase])

    // Build tree structure from flat comments
    const buildTree = (flatComments: Comment[]): Comment[] => {
        const map = new Map<string, Comment>()
        const roots: Comment[] = []

        // First pass: create map
        flatComments.forEach(comment => {
            map.set(comment.id, { ...comment, children: [] })
        })

        // Second pass: build tree
        flatComments.forEach(comment => {
            const node = map.get(comment.id)!
            if (comment.parent_id && map.has(comment.parent_id)) {
                map.get(comment.parent_id)!.children!.push(node)
            } else {
                roots.push(node)
            }
        })

        return roots
    }

    const commentTree = buildTree(comments)

    const handleAddComment = async (parentId: string | null, content: string) => {
        if (!user) {
            router.push('/login')
            return
        }

        try {
            const { error } = await supabase.from('comments').insert({
                post_id: postId,
                user_id: user.id,
                content,
                parent_id: parentId,
            })

            if (error) {
                console.error('Supabase error adding comment:', error.message, error.code, error.details)
                throw error
            }
            onCommentAdded?.()
        } catch (error: any) {
            console.error('Error adding comment:', error?.message || error?.code || JSON.stringify(error))
        }
    }

    const handleNewComment = async () => {
        if (!newComment.trim()) return
        setSubmitting(true)
        try {
            await handleAddComment(null, newComment)
            setNewComment('')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* New Comment Form */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-text dark:text-dark-text flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {comments.length === 1 ? t('commentsCount', { count: comments.length }) : t('commentsCountPlural', { count: comments.length })}
                </h3>

                {user ? (
                    <div className="flex gap-3">
                        <UserAvatar
                            name={user.user_metadata?.name}
                            email={user.email}
                            avatarUrl={user.user_metadata?.avatar_url}
                            size="sm"
                        />
                        <div className="flex-1 space-y-2">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={t('writeComment')}
                                rows={3}
                                className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button
                                onClick={handleNewComment}
                                disabled={submitting || !newComment.trim()}
                                className="px-4 py-1.5 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                                ) : null}
                                {t('postComment')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-sm text-text-light dark:text-dark-text-muted">
                        <Link href="/login" className="text-primary dark:text-accent-light hover:underline">
                            Sign in
                        </Link>{' '}
                        to join the discussion.
                    </div>
                )}
            </div>

            {/* Comments Tree */}
            {commentTree.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-dark-border">
                    {commentTree.map((comment) => (
                        <CommentNode
                            key={comment.id}
                            comment={comment}
                            depth={0}
                            postId={postId}
                            onReply={(parentId, content) => handleAddComment(parentId, content)}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center py-8 text-sm text-text-light dark:text-dark-text-muted">
                    {t('noCommentsDesc')}
                </p>
            )}
        </div>
    )
}
