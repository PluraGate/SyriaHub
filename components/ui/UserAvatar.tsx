'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'

interface UserAvatarProps {
    name?: string | null
    email?: string | null
    avatarUrl?: string | null
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

/**
 * Generates a consistent gradient index based on user identifier
 */
function getGradientIndex(identifier: string): number {
    let hash = 0
    for (let i = 0; i < identifier.length; i++) {
        const char = identifier.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
    }
    return (Math.abs(hash) % 8) + 1 // Returns 1-8
}

/**
 * Gets the user's initials from name or email
 */
function getInitials(name?: string | null, email?: string | null): string {
    if (name) {
        const parts = name.trim().split(/\s+/)
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        }
        return name.slice(0, 2).toUpperCase()
    }

    if (email) {
        const username = email.split('@')[0]
        return username.slice(0, 2).toUpperCase()
    }

    return '??'
}

const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
}

const sizeValues = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
}

export function UserAvatar({
    name,
    email,
    avatarUrl,
    size = 'md',
    className,
}: UserAvatarProps) {
    const initials = getInitials(name, email)
    const identifier = email || name || 'unknown'
    const gradientIndex = getGradientIndex(identifier)

    if (avatarUrl) {
        return (
            <div
                className={cn(
                    'rounded-full overflow-hidden flex-shrink-0',
                    sizeClasses[size],
                    className
                )}
            >
                <Image
                    src={avatarUrl}
                    alt={name || email || 'User avatar'}
                    width={sizeValues[size]}
                    height={sizeValues[size]}
                    className="w-full h-full object-cover"
                />
            </div>
        )
    }

    return (
        <div
            className={cn(
                'rounded-full flex-shrink-0 avatar-gradient',
                `avatar-gradient-${gradientIndex}`,
                sizeClasses[size],
                className
            )}
            title={name || email || 'User'}
        >
            {initials}
        </div>
    )
}
