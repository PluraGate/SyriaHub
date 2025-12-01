'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bell, Check, MessageSquare, Award, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface Notification {
    id: string
    type: 'badge' | 'solution' | 'reply' | 'mention' | 'system'
    title: string
    message: string
    link: string
    is_read: boolean
    created_at: string
}

interface NotificationListProps {
    onClose?: () => void
}

export function NotificationList({ onClose }: NotificationListProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
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

    const markAsRead = async (id: string) => {
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
        if (notification.link) {
            router.push(notification.link)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'badge': return <Award className="w-5 h-5 text-yellow-500" />
            case 'solution': return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'reply': return <MessageSquare className="w-5 h-5 text-blue-500" />
            default: return <Bell className="w-5 h-5 text-gray-500" />
        }
    }

    if (loading) {
        return <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
    }

    if (notifications.length === 0) {
        return <div className="p-8 text-center text-sm text-gray-500">No notifications yet</div>
    }

    return (
        <div className="w-full max-w-sm bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-dark-border overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-surface">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline"
                >
                    Mark all as read
                </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                            "p-4 border-b border-gray-100 dark:border-dark-border cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-border transition-colors flex gap-3",
                            !notification.is_read && "bg-blue-50/50 dark:bg-blue-900/10"
                        )}
                    >
                        <div className="mt-1 flex-shrink-0">
                            {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={cn("text-sm font-medium text-gray-900 dark:text-gray-100", !notification.is_read && "font-bold")}>
                                {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </p>
                        </div>
                        {!notification.is_read && (
                            <div className="mt-2">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
