'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'

type Notification = {
    id: string
    type: string
    title?: string
    message?: string
    content: string
    url?: string
    link?: string
    resource_id?: string
    resource_type?: string
    is_read: boolean
    created_at: string
    metadata?: any
}

type NotificationsContextType = {
    notifications: Notification[]
    unreadCount: number
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    deleteNotification: (id: string) => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [userId, setUserId] = useState<string | null>(null)
    const supabase = createClient()
    const { showToast } = useToast()
    const router = useRouter()

    // Fetch initial user
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id || null)
        })
    }, [supabase])

    // Fetch notifications and subscribe to realtime
    useEffect(() => {
        if (!userId) return

        // Initial fetch
        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(20)

            if (data) setNotifications(data)
        }

        fetchNotifications()

        // Realtime subscription
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    const newNotification = payload.new as Notification
                    setNotifications(prev => [newNotification, ...prev])
                    showToast(newNotification.title || newNotification.content, 'info')
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    const updated = payload.new as Notification
                    setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n))
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    const deletedId = payload.old.id
                    setNotifications(prev => prev.filter(n => n.id !== deletedId))
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, supabase, showToast])

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        )

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
    }

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false)
    }

    const deleteNotification = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== id))

        await supabase
            .from('notifications')
            .delete()
            .eq('id', id)
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    return (
        <NotificationsContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification }}>
            {children}
        </NotificationsContext.Provider>
    )
}

export const useNotifications = () => {
    const context = useContext(NotificationsContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider')
    }
    return context
}
