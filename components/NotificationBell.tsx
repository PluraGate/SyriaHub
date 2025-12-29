'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { NotificationList } from './NotificationList'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/components/NotificationsProvider'

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { unreadCount } = useNotifications()

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
                    <NotificationList
                        onClose={() => setIsOpen(false)}
                    />
                </div>
            )}
        </div>
    )
}
