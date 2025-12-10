'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationList } from './NotificationList'
import { cn } from '@/lib/utils'

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchUnreadCount()

        // Subscribe to new notifications
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${(supabase.auth.getUser() as any).id}` // This might be tricky if user not loaded yet
                },
                () => {
                    setUnreadCount(prev => prev + 1)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Better subscription setup that waits for user
    useEffect(() => {
        const setupSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Initial fetch
            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false)

            setUnreadCount(count || 0)

            // Subscribe
            const channel = supabase
                .channel(`notifications:${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        setUnreadCount(prev => prev + 1)
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }

        setupSubscription()
    }, [])

    const fetchUnreadCount = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false)

        setUnreadCount(count || 0)
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
        if (!isOpen) {
            // Optionally mark as read when opening, but usually better to do it on click or explicit action
            // For now, we just open the list
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className={cn(
                    "relative p-2 rounded-full transition-all duration-200",
                    "hover:bg-gray-100 dark:hover:bg-dark-border",
                    "text-text-light dark:text-dark-text-muted",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isOpen && "bg-gray-100 dark:bg-dark-border"
                )}
                aria-label="Notifications"
            >
                <Bell className={cn("w-5 h-5", unreadCount > 0 && "animate-bounce-subtle")} />
                {unreadCount > 0 && (
                    <span className={cn(
                        "absolute top-0.5 right-0.5 min-w-[18px] h-[18px]",
                        "flex items-center justify-center",
                        "text-[10px] font-bold text-white",
                        "bg-accent rounded-full",
                        "border-2 border-white dark:border-dark-bg",
                        "animate-notification-pulse"
                    )}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 z-50 animate-dropdown-enter">
                    <NotificationList onClose={() => setIsOpen(false)} />
                </div>
            )}
        </div>
    )
}
