'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface Notification {
    id: string
    type: 'remix' | 'suggestion' | 'citation' | 'comment'
    resource_id: string
    is_read: boolean
    created_at: string
    actor: {
        name: string
    }
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        const fetchNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('notifications')
                .select(`
        *,
        actor:users!notifications_actor_id_fkey(name)
      `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (data) {
                setNotifications(data)
                setUnreadCount(data.filter(n => !n.is_read).length)
            }
        }

        fetchNotifications()

        // Subscribe to new notifications
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    // In a real app, we'd check if the notification is for the current user
                    // But since RLS handles visibility, we might just re-fetch or optimistically add
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const getNotificationText = (notification: Notification) => {
        const actorName = notification.actor?.name || 'Someone'
        switch (notification.type) {
            case 'remix':
                return `${actorName} remixed your post`
            case 'suggestion':
                return `${actorName} suggested an edit`
            case 'citation':
                return `${actorName} cited your work`
            case 'comment':
                return `${actorName} commented on your post`
            default:
                return 'New notification'
        }
    }

    const getLink = (notification: Notification) => {
        switch (notification.type) {
            case 'suggestion':
                return `/post/${notification.resource_id}/suggestions`
            default:
                return `/post/${notification.resource_id}`
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-text-light dark:text-dark-text-muted" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-dark-bg" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-text-light dark:text-dark-text-muted">
                        No notifications
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <DropdownMenuItem key={notification.id} className="p-0 focus:bg-transparent">
                            <Link
                                href={getLink(notification)}
                                className={`flex flex-col w-full p-3 hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <span className="text-sm font-medium text-text dark:text-dark-text">
                                    {getNotificationText(notification)}
                                </span>
                                <span className="text-xs text-text-light dark:text-dark-text-muted mt-1">
                                    {formatDistanceToNow(new Date(notification.created_at))} ago
                                </span>
                            </Link>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
