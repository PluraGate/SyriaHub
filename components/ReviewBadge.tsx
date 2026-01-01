'use client'

import { Shield, CheckCircle2, Clock, AlertTriangle, BadgeCheck } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

export type ApprovalStatus = 'pending' | 'approved' | 'flagged' | 'rejected'
export type ApproverRole = 'moderator' | 'admin' | null

interface ReviewBadgeProps {
    status?: ApprovalStatus
    approverRole?: ApproverRole
    isVerifiedAuthor?: boolean
    size?: 'sm' | 'md'
    showLabel?: boolean
}

/**
 * ReviewBadge displays trust signals for posts:
 * - Moderator/Admin approval status
 * - Verified contributor badge
 * - Pending review indicator
 */
export function ReviewBadge({
    status = 'pending',
    approverRole,
    isVerifiedAuthor = false,
    size = 'sm',
    showLabel = false
}: ReviewBadgeProps) {
    const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
    const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'

    // Verified Author Badge
    if (isVerifiedAuthor) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span
                            className={`inline-flex items-center gap-1 ${padding} rounded-full 
                bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 
                font-medium ${textSize}`}
                        >
                            <BadgeCheck className={iconSize} />
                            {showLabel && <span>Verified</span>}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">Verified Contributor</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    // Status-based badges
    const badgeConfig = {
        approved: {
            icon: approverRole === 'admin' ? Shield : CheckCircle2,
            label: approverRole === 'admin' ? 'Admin Verified' : 'Moderator Approved',
            shortLabel: approverRole === 'admin' ? 'Verified' : 'Approved',
            className: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
            emoji: approverRole === 'admin' ? '🔒' : '🛡️'
        },
        pending: {
            icon: Clock,
            label: 'Pending Review',
            shortLabel: 'Pending',
            className: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
            emoji: '⏳'
        },
        flagged: {
            icon: AlertTriangle,
            label: 'Under Review',
            shortLabel: 'Flagged',
            className: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
            emoji: '⚠️'
        },
        rejected: {
            icon: AlertTriangle,
            label: 'Content Removed',
            shortLabel: 'Removed',
            className: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
            emoji: '❌'
        }
    }

    const config = badgeConfig[status]
    const Icon = config.icon

    // Don't show badge for pending unless explicitly requested
    if (status === 'pending' && !showLabel) {
        return null
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span
                        className={`inline-flex items-center gap-1 ${padding} rounded-full 
              ${config.className} font-medium ${textSize}`}
                    >
                        <Icon className={iconSize} />
                        {showLabel && <span>{config.shortLabel}</span>}
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs">{config.label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

/**
 * Compact inline badge for list views
 */
export function ReviewBadgeInline({
    status = 'pending',
    approverRole,
    isVerifiedAuthor = false
}: Omit<ReviewBadgeProps, 'size' | 'showLabel'>) {
    if (isVerifiedAuthor) {
        return (
            <span className="inline-flex items-center gap-1 text-blue-500 dark:text-blue-400" title="Verified Contributor">
                <BadgeCheck className="w-4 h-4" />
            </span>
        )
    }

    if (status === 'approved') {
        return (
            <span
                className="inline-flex items-center gap-1 text-green-500 dark:text-green-400"
                title={approverRole === 'admin' ? 'Admin Verified' : 'Moderator Approved'}
            >
                {approverRole === 'admin' ? (
                    <Shield className="w-4 h-4" />
                ) : (
                    <CheckCircle2 className="w-4 h-4" />
                )}
            </span>
        )
    }

    if (status === 'flagged') {
        return (
            <span className="inline-flex items-center gap-1 text-orange-500 dark:text-orange-400" title="Under Review">
                <AlertTriangle className="w-4 h-4" />
            </span>
        )
    }

    return null
}
