'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bell, Check, MessageSquare, Award, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { NotificationSkeleton } from '@/components/ui/skeleton'
import { NoNotificationsIllustration } from '@/components/ui/EmptyState'

interface Notification {
    id: string
    type: 'badge' | 'solution' | 'reply' | 'mention' | 'system'
    title: string
    message: string
    url: string | null
    is_read: boolean
    created_at: string
}

interface NotificationListProps {
    onClose?: () => void
}

export function NotificationList({ onClose }: NotificationListProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [hoveredId, setHoveredId] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20)

        if (data) setNotifications(data as Notification[])
        setLoading(false)
    }

    const markAsRead = async (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation()
        }
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        ))
    }

    const markAllAsRead = async () => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('is_read', false)

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id)
        }
        if (onClose) onClose()
        if (notification.url) {
            router.push(notification.url)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'badge': return <Award className="w-5 h-5 text-yellow-500" />
            case 'solution': return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'reply': return <MessageSquare className="w-5 h-5 text-blue-500" />
            default: return <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        }
    }

    // Loading state with skeletons
    if (loading) {
        return (
            <div className="w-full max-w-sm bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-200 dark:border-dark-border overflow-hidden animate-fade-in-up">
                <div className="p-4 border-b border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50">
                    <div className="h-5 w-24 skeleton rounded" />
                </div>
                <div>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <NotificationSkeleton key={i} />
                    ))}
                </div>
            </div>
        )
    }

    // Empty state with illustration
    if (notifications.length === 0) {
        return (
            <div className="w-full max-w-sm bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-200 dark:border-dark-border overflow-hidden animate-fade-in-up">
                <div className="p-4 border-b border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50">
                    <h3 className="font-semibold text-sm text-text dark:text-dark-text">Notifications</h3>
                </div>
                <div className="py-8 px-4 text-center">
                    <NoNotificationsIllustration className="w-32 h-32 mx-auto mb-4 opacity-80" />
                    <p className="text-sm font-medium text-text dark:text-dark-text mb-1">All caught up!</p>
                    <p className="text-xs text-text-light dark:text-dark-text-muted">
                        No notifications yet. We&apos;ll let you know when something happens.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-sm bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-200 dark:border-dark-border overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-gray-200 dark:border-dark-border flex justify-between items-center bg-gray-50/50 dark:bg-dark-bg/50">
                <h3 className="font-semibold text-sm text-text dark:text-dark-text">Notifications</h3>
                <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors font-medium"
                >
                    Mark all as read
                </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
                {notifications.map((notification, index) => (
                    <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        onMouseEnter={() => setHoveredId(notification.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={cn(
                            "p-4 border-b border-gray-100 dark:border-dark-border cursor-pointer",
                            "hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-all duration-200",
                            "flex gap-3 relative group",
                            !notification.is_read && "bg-primary/5 dark:bg-primary/10",
                            "animate-fade-in-up"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Icon with subtle background */}
                        <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 dark:bg-dark-border flex items-center justify-center">
                            {getIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className={cn(
                                "text-sm text-gray-900 dark:text-gray-100 leading-snug",
                                !notification.is_read && "font-semibold"
                            )}>
                                {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                                {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                        </div>

                        {/* Unread indicator / Mark as read button */}
                        <div className="flex-shrink-0 flex items-start pt-1">
                            {!notification.is_read && (
                                <>
                                    {/* Blue dot when not hovered */}
                                    <div className={cn(
                                        "w-2.5 h-2.5 rounded-full bg-primary transition-opacity",
                                        "shadow-sm shadow-primary/30",
                                        hoveredId === notification.id && "opacity-0"
                                    )} />
                                    {/* Check button on hover */}
                                    <button
                                        onClick={(e) => markAsRead(notification.id, e)}
                                        className={cn(
                                            "absolute right-3 top-3 p-1.5 rounded-full",
                                            "bg-primary/10 text-primary hover:bg-primary hover:text-white",
                                            "transition-all duration-200",
                                            hoveredId === notification.id ? "opacity-100 scale-100" : "opacity-0 scale-75"
                                        )}
                                        title="Mark as read"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50">
                <a
                    href="/notifications"
                    onClick={() => onClose?.()}
                    className="block text-center text-sm font-medium text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors"
                >
                    View All Notifications
                </a>
            </div>
        </div>
    )
}
