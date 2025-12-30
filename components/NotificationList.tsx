'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, Check, MessageSquare, Award, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { NotificationSkeleton } from '@/components/ui/skeleton'
import { NoNotificationsIllustration } from '@/components/ui/EmptyState'
import { useTranslations } from 'next-intl'
import { useNotifications } from '@/components/NotificationsProvider'

interface NotificationListProps {
    onClose?: () => void
}

export function NotificationList({ onClose }: NotificationListProps) {
    const { notifications, markAsRead, markAllAsRead } = useNotifications()
    const [hoveredId, setHoveredId] = useState<string | null>(null)
    const [loading] = useState(false) // loading is handled in provider or initial fetch
    const router = useRouter()
    const t = useTranslations('Notifications')

    const handleNotificationClick = async (notification: any) => {
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

    // Empty state with illustration
    if (notifications.length === 0) {
        return (
            <div className="w-full max-w-sm bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-200 dark:border-dark-border overflow-hidden animate-fade-in-up">
                <div className="p-4 border-b border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50">
                    <h3 className="font-semibold text-sm text-text dark:text-dark-text">{t('title')}</h3>
                </div>
                <div className="py-8 px-4 text-center">
                    <NoNotificationsIllustration className="w-32 h-32 mx-auto mb-4 opacity-80" />
                    <p className="text-sm font-medium text-text dark:text-dark-text mb-1">{t('allCaughtUp')}</p>
                    <p className="text-xs text-text-light dark:text-dark-text-muted">
                        {t('noNotificationsYet')}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-sm bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-200 dark:border-dark-border overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-gray-200 dark:border-dark-border flex justify-between items-center bg-gray-50/50 dark:bg-dark-bg/50">
                <h3 className="font-semibold text-sm text-text dark:text-dark-text">{t('title')}</h3>
                <button
                    onClick={() => markAllAsRead()}
                    className="text-xs text-secondary hover:text-secondary-light transition-colors font-medium"
                >
                    {t('markAllAsRead')}
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
                            !notification.is_read ? "bg-primary/5 dark:bg-primary/10" : "opacity-70",
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
                                {notification.id.startsWith('temp-') ? notification.content : notification.title || notification.content}
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notification.id);
                                        }}
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
                <Link
                    href="/notifications"
                    onClick={() => onClose?.()}
                    className="block text-center text-sm font-medium text-secondary hover:text-secondary-light transition-colors"
                >
                    {t('viewAllNotifications')}
                </Link>
            </div>
        </div>
    )
}
