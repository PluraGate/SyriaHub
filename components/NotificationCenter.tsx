'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    MessageSquare,
    AtSign,
    UserPlus,
    GitFork,
    Quote,
    ThumbsUp,
    AlertTriangle,
    X,
    Settings,
    Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { useNotifications } from '@/components/NotificationsProvider'

const CLEARED_NOTIFICATIONS_KEY = 'syriahub_cleared_notifications'

interface Notification {
    id: string
    type: 'mention' | 'reply' | 'follow' | 'fork' | 'citation' | 'like' | 'system' | 'moderation'
    title: string
    message: string
    url?: string
    is_read: boolean
    created_at: string
    metadata?: {
        actor_name?: string
        actor_avatar?: string
        post_title?: string
        [key: string]: any
    }
}

type NotificationFilter = 'all' | 'unread' | 'mentions' | 'social' | 'system'

const notificationIcons: Record<string, any> = {
    mention: AtSign,
    reply: MessageSquare,
    follow: UserPlus,
    fork: GitFork,
    citation: Quote,
    like: ThumbsUp,
    system: Bell,
    moderation: AlertTriangle,
}

const notificationColors: Record<string, string> = {
    mention: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    reply: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    follow: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    fork: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
    citation: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
    like: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20',
    system: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20',
    moderation: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
}

// Helper to load cleared IDs from localStorage
function loadClearedIds(): Set<string> {
    if (typeof window === 'undefined') return new Set()
    try {
        const stored = localStorage.getItem(CLEARED_NOTIFICATIONS_KEY)
        if (stored) {
            return new Set(JSON.parse(stored))
        }
    } catch (e) {
        console.error('Failed to load cleared notifications:', e)
    }
    return new Set()
}

// Helper to save cleared IDs to localStorage
function saveClearedIds(ids: Set<string>) {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(CLEARED_NOTIFICATIONS_KEY, JSON.stringify([...ids]))
    } catch (e) {
        console.error('Failed to save cleared notifications:', e)
    }
}

export function NotificationCenter({ userId }: { userId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
    const [filter, setFilter] = useState<NotificationFilter>('all')
    const [markingAll, setMarkingAll] = useState(false)
    const [clearedIds, setClearedIds] = useState<Set<string>>(() => {
        // Initialize from localStorage (only runs on client)
        if (typeof window !== 'undefined') {
            return loadClearedIds()
        }
        return new Set()
    })

    const handleMarkAllAsRead = async () => {
        setMarkingAll(true)
        // Mark as read AND hide from dropdown (persisted to localStorage)
        const allIds = notifications.map(n => n.id)
        const newClearedIds = new Set([...clearedIds, ...allIds])
        setClearedIds(newClearedIds)
        saveClearedIds(newClearedIds)
        await markAllAsRead()
        setMarkingAll(false)
    }

    const filteredNotifications = useMemo(() => {
        // Filter out cleared notifications
        const visibleList = (notifications as any[]).filter(n => !clearedIds.has(n.id))
        
        switch (filter) {
            case 'unread':
                return visibleList.filter(n => !n.is_read)
            case 'mentions':
                return visibleList.filter(n => n.type === 'mention' || n.type === 'reply')
            case 'social':
                return visibleList.filter(n => ['follow', 'like', 'fork', 'citation'].includes(n.type))
            case 'system':
                return visibleList.filter(n => n.type === 'system' || n.type === 'moderation')
            default:
                return visibleList
        }
    }, [notifications, filter, clearedIds])

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <Bell className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white dark:border-dark-bg transition-all animate-in zoom-in">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Panel */}
                    <div
                        className="absolute right-0 top-full mt-2 w-96 max-h-[70vh] bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-gray-200 dark:border-dark-border overflow-hidden z-50 flex flex-col"
                        role="dialog"
                        aria-label="Notifications"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-border flex-shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-text dark:text-dark-text">Notifications</h3>
                                <div className="flex items-center gap-1">
                                    {unreadCount > 0 && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={handleMarkAllAsRead}
                                            disabled={markingAll}
                                            className="text-xs gap-1"
                                        >
                                            {markingAll ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <CheckCheck className="w-3.5 h-3.5" />
                                            )}
                                            Mark all as read
                                        </Button>
                                    )}
                                    <Link href="/settings/notifications">
                                        <Button size="sm" variant="ghost" className="p-1.5">
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex gap-1">
                                {(['all', 'unread', 'mentions', 'social', 'system'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-2.5 py-1 text-xs rounded-full capitalize transition-colors ${filter === f
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-dark-bg text-text-light dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <BellOff className="w-10 h-10 text-text-light dark:text-dark-text-muted opacity-50 mb-3" />
                                    <p className="text-sm text-text-light dark:text-dark-text-muted">
                                        {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-dark-border">
                                    {filteredNotifications.map(notification => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onRead={markAsRead}
                                            onDelete={deleteNotification}
                                            onClose={() => setIsOpen(false)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t border-gray-100 dark:border-dark-border flex-shrink-0">
                                <Link
                                    href="/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    View all notifications →
                                </Link>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

interface NotificationItemProps {
    notification: any
    onRead: (id: string) => void
    onDelete: (id: string) => void
    onClose: () => void
}

function NotificationItem({ notification, onRead, onDelete, onClose }: NotificationItemProps) {
    const Icon = notificationIcons[notification.type] || Bell
    const colorClass = notificationColors[notification.type] || 'text-gray-500 bg-gray-50 dark:bg-gray-900/20'

    const handleClick = () => {
        if (!notification.is_read) {
            onRead(notification.id)
        }
        if (notification.url || notification.link) {
            onClose()
        }
    }

    const content = (
        <div
            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
        >
            <div className="flex gap-3">
                {/* Icon */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''} text-text dark:text-dark-text line-clamp-2`}>
                        {notification.title || notification.content}
                    </p>
                    {notification.message && (
                        <p className="text-xs text-text-light dark:text-dark-text-muted mt-0.5 line-clamp-2">
                            {notification.message}
                        </p>
                    )}
                    <span className="text-xs text-text-light dark:text-dark-text-muted mt-1 block">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-start gap-1 flex-shrink-0">
                    {!notification.is_read && (
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onRead(notification.id)
                            }}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-surface transition-colors"
                            title="Mark as read"
                        >
                            <Check className="w-3.5 h-3.5 text-text-light" />
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onDelete(notification.id)
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-surface transition-colors"
                        title="Delete"
                    >
                        <X className="w-3.5 h-3.5 text-text-light" />
                    </button>
                </div>
            </div>
        </div>
    )

    const url = notification.url || notification.link

    if (url) {
        return (
            <Link href={url} onClick={handleClick}>
                {content}
            </Link>
        )
    }

    return <div onClick={handleClick}>{content}</div>
}

export function NotificationBell({ userId }: { userId: string }) {
    return <NotificationCenter userId={userId} />
}
