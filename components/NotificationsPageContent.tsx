'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    Bell,
    Check,
    CheckCheck,
    MessageSquare,
    AtSign,
    UserPlus,
    Award,
    CheckCircle,
    Trash2,
    Filter,
    Loader2,
    ArrowLeft,
    Reply
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { NoNotificationsIllustration } from '@/components/ui/EmptyState'

interface Notification {
    id: string
    type: 'badge' | 'solution' | 'reply' | 'mention' | 'system' | 'follow'
    title: string
    message: string | null
    url: string | null
    is_read: boolean
    created_at: string
    post_id?: string | null
    comment_id?: string | null
    actor_id?: string | null
    metadata?: any
}

type FilterType = 'all' | 'unread' | 'reply' | 'mention' | 'badge' | 'system'

const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'reply', label: 'Replies' },
    { value: 'mention', label: 'Mentions' },
    { value: 'badge', label: 'Badges' },
    { value: 'system', label: 'System' },
]

const typeIcons: Record<string, typeof Bell> = {
    badge: Award,
    solution: CheckCircle,
    reply: MessageSquare,
    mention: AtSign,
    follow: UserPlus,
    system: Bell,
}

const typeColors: Record<string, string> = {
    badge: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    solution: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    reply: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    mention: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    follow: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
    system: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20',
}

interface NotificationsPageContentProps {
    userId: string
}

export function NotificationsPageContent({ userId }: NotificationsPageContentProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<FilterType>('all')
    const [markingAll, setMarkingAll] = useState(false)
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState('')
    const [submittingReply, setSubmittingReply] = useState(false)

    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()
    const { showToast } = useToast()

    const fetchNotifications = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(100)

            if (error) throw error
            setNotifications(data || [])
        } catch (error) {
            console.error('Error fetching notifications:', error)
            showToast('Failed to load notifications.', 'error')
        } finally {
            setLoading(false)
        }
    }, [userId, supabase, showToast])

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    const filteredNotifications = useMemo(() => {
        if (filter === 'all') return notifications
        if (filter === 'unread') return notifications.filter(n => !n.is_read)
        return notifications.filter(n => n.type === filter)
    }, [notifications, filter])

    const unreadCount = useMemo(() =>
        notifications.filter(n => !n.is_read).length,
        [notifications])

    const markAsRead = async (notificationId: string) => {
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId)

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            )
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    const markAllAsRead = async () => {
        setMarkingAll(true)
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false)

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            showToast('All notifications marked as read.', 'success')
        } catch (error) {
            console.error('Error marking all as read:', error)
            showToast('Failed to mark all as read.', 'error')
        } finally {
            setMarkingAll(false)
        }
    }

    const deleteNotification = async (notificationId: string) => {
        try {
            await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId)

            setNotifications(prev => prev.filter(n => n.id !== notificationId))
            showToast('Notification deleted.', 'success')
        } catch (error) {
            console.error('Error deleting notification:', error)
            showToast('Failed to delete notification.', 'error')
        }
    }

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id)
        }
        if (notification.url) {
            router.push(notification.url)
        }
    }

    const handleReply = async (notification: Notification) => {
        if (!replyContent.trim() || !notification.post_id) return

        setSubmittingReply(true)
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: replyContent.trim(),
                    post_id: notification.post_id,
                    parent_id: notification.comment_id || null,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to post reply')
            }

            showToast('Reply posted successfully!', 'success')
            setReplyContent('')
            setReplyingTo(null)
        } catch (error) {
            console.error('Error posting reply:', error)
            showToast('Failed to post reply.', 'error')
        } finally {
            setSubmittingReply(false)
        }
    }

    const getIcon = (type: string) => {
        const Icon = typeIcons[type] || Bell
        return <Icon className="w-5 h-5" />
    }

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-text-light dark:text-dark-text-muted" />
                    <span className="ml-2 text-text-light dark:text-dark-text-muted">Loading notifications...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Link
                        href="/feed"
                        className="p-1 -ml-1 rounded-md hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    </Link>
                    <h1 className="text-2xl font-display font-bold text-text dark:text-dark-text">
                        Notifications
                    </h1>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-white">
                            {unreadCount} unread
                        </span>
                    )}
                </div>
                <p className="text-sm text-text-light dark:text-dark-text-muted">
                    Stay updated on comments, mentions, and activity
                </p>
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setFilter(option.value)}
                            className={cn(
                                'px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
                                filter === option.value
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 dark:bg-dark-surface text-text-light dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border'
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                        disabled={markingAll}
                    >
                        {markingAll ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <CheckCheck className="w-4 h-4 mr-2" />
                        )}
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <div className="card p-8 text-center">
                    <NoNotificationsIllustration className="w-32 h-32 mx-auto mb-4 opacity-80" />
                    <p className="text-sm font-medium text-text dark:text-dark-text mb-1">
                        {filter === 'all' ? 'All caught up!' : `No ${filter} notifications`}
                    </p>
                    <p className="text-xs text-text-light dark:text-dark-text-muted">
                        {filter === 'all'
                            ? "We'll let you know when something happens."
                            : 'Try changing the filter to see other notifications.'}
                    </p>
                </div>
            ) : (
                <div className="card overflow-hidden divide-y divide-gray-100 dark:divide-dark-border">
                    {filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={cn(
                                'p-4 transition-colors',
                                !notification.is_read && 'bg-primary/5 dark:bg-primary/10'
                            )}
                        >
                            <div className="flex gap-3">
                                {/* Icon */}
                                <div className={cn(
                                    'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                                    typeColors[notification.type] || typeColors.system
                                )}>
                                    {getIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div
                                        onClick={() => handleNotificationClick(notification)}
                                        className="cursor-pointer"
                                    >
                                        <p className={cn(
                                            'text-sm text-text dark:text-dark-text',
                                            !notification.is_read && 'font-semibold'
                                        )}>
                                            {notification.title}
                                        </p>
                                        {notification.message && (
                                            <p className="text-sm text-text-light dark:text-dark-text-muted line-clamp-2 mt-0.5">
                                                {notification.message}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </p>
                                    </div>

                                    {/* Inline Reply */}
                                    {notification.type === 'reply' && notification.post_id && (
                                        <div className="mt-2">
                                            {replyingTo === notification.id ? (
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={replyContent}
                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                        placeholder="Write your reply..."
                                                        rows={2}
                                                        className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleReply(notification)}
                                                            disabled={submittingReply || !replyContent.trim()}
                                                        >
                                                            {submittingReply ? (
                                                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                                            ) : (
                                                                <Reply className="w-3 h-3 mr-1" />
                                                            )}
                                                            Reply
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setReplyingTo(null)
                                                                setReplyContent('')
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setReplyingTo(notification.id)}
                                                    className="text-xs text-primary hover:text-primary-dark dark:hover:text-primary-light flex items-center gap-1"
                                                >
                                                    <Reply className="w-3 h-3" />
                                                    Quick Reply
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex-shrink-0 flex items-start gap-1">
                                    {!notification.is_read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="p-1.5 rounded-full text-text-light dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="p-1.5 rounded-full text-text-light dark:text-dark-text-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
