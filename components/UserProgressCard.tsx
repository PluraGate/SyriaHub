'use client'

import { useState, useEffect, useMemo } from 'react'
import { Zap, Trophy, Target, ChevronRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UserLevelBadge, getTierFromLevel } from './UserLevelBadge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface UserProgress {
    xp_points: number
    level: number
    current_level: {
        level: number
        name: string
        tier: string
        xp_required: number
        perks: string[]
        color: string
    }
    next_level: {
        level: number
        name: string
        tier: string
        xp_required: number
        perks: string[]
        color: string
    } | null
    xp_to_next_level: number
    progress_percentage: number
    achievements_unlocked: number
    total_achievements: number
}

interface UserProgressCardProps {
    userId: string
    compact?: boolean
}

export function UserProgressCard({ userId, compact = false }: UserProgressCardProps) {
    const [progress, setProgress] = useState<UserProgress | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = useMemo(() => createClient(), [])
    const t = useTranslations('Gamification')
    const tCommon = useTranslations('Common')

    useEffect(() => {
        const fetchProgress = async () => {
            const { data, error } = await supabase.rpc('get_user_progress', {
                p_user_id: userId
            })
            if (!error && data?.success) {
                setProgress(data)
            }
            setLoading(false)
        }
        fetchProgress()
    }, [userId, supabase])


    if (loading) {
        return (
            <div className={cn(
                "bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border",
                compact ? "p-4" : "p-6"
            )}>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    if (!progress) return null

    const tier = getTierFromLevel(progress.level)

    // Compact version for sidebar/profile header
    if (compact) {
        return (
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
                <div className="flex items-center justify-between mb-3">
                    <UserLevelBadge
                        level={progress.level}
                        tier={tier}
                        name={progress.current_level?.name}
                    />
                    <span className="text-xs text-text-light dark:text-dark-text-muted">
                        {progress.xp_points.toLocaleString()} XP
                    </span>
                </div>

                {/* Progress bar */}
                {progress.next_level && (
                    <div className="space-y-1">
                        <div className="h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    tier === 'bronze' && "bg-gradient-to-r from-amber-500 to-amber-600",
                                    tier === 'silver' && "bg-gradient-to-r from-gray-400 to-gray-500",
                                    tier === 'gold' && "bg-gradient-to-r from-yellow-400 to-yellow-500",
                                    tier === 'platinum' && "bg-gradient-to-r from-purple-500 to-purple-600"
                                )}
                                style={{ width: `${Math.min(progress.progress_percentage, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-text-light dark:text-dark-text-muted text-right">
                            {(progress.xp_to_next_level || 0).toLocaleString()} XP to Level {progress.next_level?.level}
                        </p>
                    </div>
                )}
            </div>
        )
    }

    // Full version
    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-text dark:text-dark-text">{t('yourProgress')}</h3>
                </div>
                <Link
                    href="/achievements"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                    {tCommon('viewAll')}
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Level Section */}
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-dark-bg dark:to-dark-surface">
                <div className="flex items-center gap-4 mb-4">
                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center",
                        tier === 'bronze' && "bg-gradient-to-br from-amber-400 to-amber-600",
                        tier === 'silver' && "bg-gradient-to-br from-gray-300 to-gray-500",
                        tier === 'gold' && "bg-gradient-to-br from-yellow-300 to-yellow-500",
                        tier === 'platinum' && "bg-gradient-to-br from-purple-400 to-purple-600"
                    )}>
                        <span className="text-2xl font-bold text-white">{progress.level}</span>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-text dark:text-dark-text">
                            {progress.current_level?.name || `Level ${progress.level}`}
                        </p>
                        <p className="text-sm text-text-light dark:text-dark-text-muted capitalize">
                            {tier} Tier
                        </p>
                    </div>
                </div>

                {/* XP Progress */}
                {progress.next_level && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-text dark:text-dark-text font-medium">
                                {progress.xp_points.toLocaleString()} XP
                            </span>
                            <span className="text-text-light dark:text-dark-text-muted">
                                {progress.next_level?.xp_required?.toLocaleString() || 'Max'} XP
                            </span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-700",
                                    tier === 'bronze' && "bg-gradient-to-r from-amber-400 to-amber-600",
                                    tier === 'silver' && "bg-gradient-to-r from-gray-300 to-gray-500",
                                    tier === 'gold' && "bg-gradient-to-r from-yellow-300 to-yellow-500",
                                    tier === 'platinum' && "bg-gradient-to-r from-purple-400 to-purple-600"
                                )}
                                style={{ width: `${Math.min(progress.progress_percentage, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-center text-text-light dark:text-dark-text-muted">
                            {(progress.xp_to_next_level || 0).toLocaleString()} XP until {progress.next_level?.name}
                        </p>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-dark-border border-t border-gray-100 dark:border-dark-border">
                <div className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-text dark:text-dark-text">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        {progress.xp_points.toLocaleString()}
                    </div>
                    <p className="text-xs text-text-light dark:text-dark-text-muted mt-1">{t('totalXp')}</p>
                </div>
                <div className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-text dark:text-dark-text">
                        <Trophy className="w-5 h-5 text-primary" />
                        {progress.achievements_unlocked}/{progress.total_achievements}
                    </div>
                    <p className="text-xs text-text-light dark:text-dark-text-muted mt-1">{t('achievementsLabel')}</p>
                </div>
            </div>
        </div>
    )
}
