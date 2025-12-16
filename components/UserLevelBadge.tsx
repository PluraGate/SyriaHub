'use client'

import { cn } from '@/lib/utils'
import { getTierFromLevel, tierConfig } from '@/lib/gamification'
import { Medal, Award, Crown, Sparkles } from 'lucide-react'

// Re-export for backwards compatibility
export { getTierFromLevel } from '@/lib/gamification'

// Icon mapping for tiers (client-side only)
const tierIcons = {
    bronze: Medal,
    silver: Award,
    gold: Crown,
    platinum: Sparkles,
}

interface UserLevelBadgeProps {
    level: number
    tier: 'bronze' | 'silver' | 'gold' | 'platinum'
    name?: string
    size?: 'sm' | 'md' | 'lg'
    showTooltip?: boolean
}

const sizeConfig = {
    sm: {
        container: 'h-6 px-2 gap-1',
        icon: 'w-3 h-3',
        text: 'text-xs',
    },
    md: {
        container: 'h-8 px-3 gap-1.5',
        icon: 'w-4 h-4',
        text: 'text-sm',
    },
    lg: {
        container: 'h-10 px-4 gap-2',
        icon: 'w-5 h-5',
        text: 'text-base',
    },
}

export function UserLevelBadge({
    level,
    tier,
    name,
    size = 'md',
    showTooltip = true
}: UserLevelBadgeProps) {
    const config = tierConfig[tier]
    const sizeStyles = sizeConfig[size]
    const Icon = tierIcons[tier]

    return (
        <div className="relative group inline-flex">
            <div
                className={cn(
                    "inline-flex items-center rounded-full border font-medium transition-all",
                    config.bgColor,
                    config.textColor,
                    config.borderColor,
                    sizeStyles.container
                )}
            >
                <Icon className={cn(sizeStyles.icon)} />
                <span className={cn("font-bold", sizeStyles.text)}>
                    {level}
                </span>
            </div>

            {/* Tooltip */}
            {showTooltip && name && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    <span className="font-medium">Level {level}</span>
                    <span className="mx-1">·</span>
                    <span>{name}</span>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                        <div className="w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45 -translate-y-1" />
                    </div>
                </div>
            )}
        </div>
    )
}

