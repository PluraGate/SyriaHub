'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
    Loader2,
    ArrowLeft,
    Reply
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { NoNotificationsIllustration } from '@/components/ui/EmptyState'
import { useTranslations } from 'next-intl'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { useNotifications } from '@/components/NotificationsProvider'

type FilterType = 'all' | 'unread' | 'reply' | 'mention' | 'badge' | 'system'

const filterKeys: { value: FilterType; labelKey: string }[] = [
    { value: 'all', labelKey: 'types.all' },
    { value: 'unread', labelKey: 'types.unread' },
    { value: 'reply', labelKey: 'types.replies' },
    { value: 'mention', labelKey: 'types.mentions' },
    { value: 'badge', labelKey: 'types.badges' },
    { value: 'system', labelKey: 'types.system' },
]

const typeIcons: Record<string, any> = {
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

export function NotificationsPageContent({ userId }: { userId: string }) {
    const t = useTranslations('Notifications')
    const { formatSaved } = useDateFormatter()
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
    const [filter, setFilter] = useState<FilterType>('all')
    const [markingAll, setMarkingAll] = useState(false)
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState('')
    const [submittingReply, setSubmittingReply] = useState(false)

    const router = useRouter()
    const { showToast } = useToast()

    const handleMarkAllAsRead = async () => {
        setMarkingAll(true)
        await markAllAsRead()
        setMarkingAll(false)
        showToast('All notifications marked as read.', 'success')
    }

    const filteredNotifications = useMemo(() => {
        const list = notifications as any[]
        if (filter === 'all') return list
        if (filter === 'unread') return list.filter(n => !n.is_read)
        return list.filter(n => n.type === filter)
    }, [notifications, filter])

    const handleNotificationClick = (notification: any) => {
        if (!notification.is_read) {
            markAsRead(notification.id)
        }
        const url = notification.url || notification.link
        if (url) {
            router.push(url)
        }
    }

    const handleReply = async (notification: any) => {
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
            // Mark as read after replying
            if (!notification.is_read) {
                markAsRead(notification.id)
            }
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

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Link
                        href="/feed"
                        className="p-1 -ml-1 rounded-md hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    </Link>
                    <h1 className="text-2xl font-display font-bold text-text dark:text-dark-text">
                        {t('title')}
                    </h1>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-white">
                            {t('unreadCount', { count: unreadCount })}
                        </span>
                    )}
                </div>
                <p className="text-sm text-text-light dark:text-dark-text-muted">
                    {t('subtitle')}
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                    {filterKeys.map(option => (
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
                            {t(option.labelKey)}
                        </button>
                    ))}
                </div>

                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        disabled={markingAll}
                    >
                        {markingAll ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <CheckCheck className="w-4 h-4 mr-2" />
                        )}
                        {t('markAllAsRead')}
                    </Button>
                )}
            </div>

            {filteredNotifications.length === 0 ? (
                <div className="card p-8 text-center">
                    <NoNotificationsIllustration className="w-32 h-32 mx-auto mb-4 opacity-80" />
                    <p className="text-sm font-medium text-text dark:text-dark-text mb-1">
                        {filter === 'all' ? t('allCaughtUp') : t('noFilteredNotifications', { filter: t(filterKeys.find(f => f.value === filter)?.labelKey ?? 'types.all') })}
                    </p>
                    <p className="text-xs text-text-light dark:text-dark-text-muted">
                        {filter === 'all'
                            ? t('noNotificationsYet').split('.')[1]?.trim() || t('noNotificationsYet')
                            : t('tryChangingFilter')}
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
                                            {notification.title || notification.content}
                                        </p>
                                        {notification.message && (
                                            <p className="text-sm text-text-light dark:text-dark-text-muted line-clamp-2 mt-0.5">
                                                {notification.message}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {formatSaved(new Date(notification.created_at))}
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
                                                        placeholder={t('replyPlaceholder')}
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
                                                            {t('reply')}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setReplyingTo(null)
                                                                setReplyContent('')
                                                            }}
                                                        >
                                                            {t('cancel')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setReplyingTo(notification.id)}
                                                    className="text-xs text-primary hover:text-primary-dark dark:hover:text-primary-light flex items-center gap-1"
                                                >
                                                    <Reply className="w-3 h-3" />
                                                    {t('quickReply')}
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
                                            title={t('markAsRead')}
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
