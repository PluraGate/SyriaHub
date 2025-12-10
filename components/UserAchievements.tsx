'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Flame,
    Award,
    Star,
    Zap,
    Trophy,
    CheckCircle,
    PenTool,
    Footprints
} from 'lucide-react'

interface UserStreak {
    currentStreak: number
    longestStreak: number
    lastPostDate: string | null
    isActiveToday: boolean
}

interface Badge {
    id: string
    name: string
    description: string
    icon_url: string
    awarded_at: string
}

const BADGE_ICONS: Record<string, React.ElementType> = {
    footprints: Footprints,
    pen_tool: PenTool,
    check_circle: CheckCircle,
    star: Star,
    verified: Award,
    trophy: Trophy,
    default: Award,
}

/**
 * Calculate streak from post dates
 */
function calculateStreak(postDates: Date[]): UserStreak {
    if (postDates.length === 0) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastPostDate: null,
            isActiveToday: false,
        }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const sortedDates = postDates
        .map(d => {
            const date = new Date(d)
            date.setHours(0, 0, 0, 0)
            return date
        })
        .sort((a, b) => b.getTime() - a.getTime())

    // Get unique dates
    const uniqueDates = [...new Set(sortedDates.map(d => d.getTime()))]
        .map(t => new Date(t))
        .sort((a, b) => b.getTime() - a.getTime())

    if (uniqueDates.length === 0) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastPostDate: null,
            isActiveToday: false,
        }
    }

    const lastPostDate = uniqueDates[0]
    const isActiveToday = lastPostDate.getTime() === today.getTime()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Calculate current streak
    let currentStreak = 0
    let checkDate = isActiveToday ? today : yesterday

    for (const date of uniqueDates) {
        if (date.getTime() === checkDate.getTime()) {
            currentStreak++
            checkDate = new Date(checkDate)
            checkDate.setDate(checkDate.getDate() - 1)
        } else if (date.getTime() < checkDate.getTime()) {
            break
        }
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 1

    for (let i = 0; i < uniqueDates.length - 1; i++) {
        const current = uniqueDates[i]
        const next = uniqueDates[i + 1]
        const diffDays = Math.round((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
            tempStreak++
        } else {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 1
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return {
        currentStreak,
        longestStreak,
        lastPostDate: lastPostDate.toISOString(),
        isActiveToday,
    }
}

export function UserStreakBadge({ userId }: { userId: string }) {
    const [streak, setStreak] = useState<UserStreak | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const loadStreak = async () => {
            try {
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

                const { data: posts } = await supabase
                    .from('posts')
                    .select('created_at')
                    .eq('author_id', userId)
                    .eq('status', 'published')
                    .gte('created_at', thirtyDaysAgo.toISOString())
                    .order('created_at', { ascending: false })

                if (posts) {
                    const postDates = posts.map((p: any) => new Date(p.created_at))
                    setStreak(calculateStreak(postDates))
                }
            } catch (error) {
                console.error('Error loading streak:', error)
            } finally {
                setLoading(false)
            }
        }

        loadStreak()
    }, [userId, supabase])

    if (loading) {
        return <Skeleton className="w-16 h-6 rounded-full" />
    }

    if (!streak || streak.currentStreak === 0) {
        return null
    }

    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border">
            <span className="text-xs text-text-light dark:text-dark-text-muted">Streak</span>
            <span className="text-sm font-medium text-text dark:text-dark-text">
                {streak.currentStreak}d
            </span>
        </div>
    )
}

export function UserBadgesDisplay({ userId, limit = 5 }: { userId: string; limit?: number }) {
    const [badges, setBadges] = useState<Badge[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const loadBadges = async () => {
            try {
                const { data } = await supabase
                    .from('user_badges')
                    .select(`
            awarded_at,
            badge:badges(id, name, description, icon_url)
          `)
                    .eq('user_id', userId)
                    .order('awarded_at', { ascending: false })
                    .limit(limit)

                if (data) {
                    setBadges(
                        data.map((item: any) => ({
                            id: item.badge.id,
                            name: item.badge.name,
                            description: item.badge.description,
                            icon_url: item.badge.icon_url,
                            awarded_at: item.awarded_at,
                        }))
                    )
                }
            } catch (error) {
                console.error('Error loading badges:', error)
            } finally {
                setLoading(false)
            }
        }

        loadBadges()
    }, [userId, supabase, limit])

    if (loading) {
        return (
            <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="w-8 h-8 rounded-full" />
                ))}
            </div>
        )
    }

    if (badges.length === 0) {
        return null
    }

    return (
        <div className="flex flex-wrap gap-2">
            {badges.map((badge) => {
                const IconComponent = BADGE_ICONS[badge.icon_url] || BADGE_ICONS.default
                return (
                    <div
                        key={badge.id}
                        className="group relative inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border cursor-help transition-colors hover:border-gray-300 dark:hover:border-gray-600"
                        title={`${badge.name}: ${badge.description}`}
                    >
                        <IconComponent className="w-3.5 h-3.5 text-text-light dark:text-dark-text-muted" />

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            <div className="font-medium">{badge.name}</div>
                            <div className="text-gray-400 dark:text-gray-500">{badge.description}</div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

/**
 * Combined streak and badges component for profile cards
 */
export function UserAchievements({ userId }: { userId: string }) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <UserStreakBadge userId={userId} />
            <UserBadgesDisplay userId={userId} />
        </div>
    )
}

/**
 * Streak encouragement banner
 */
export function StreakEncouragement({ userId }: { userId: string }) {
    const [streak, setStreak] = useState<UserStreak | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const loadStreak = async () => {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const { data: posts } = await supabase
                .from('posts')
                .select('created_at')
                .eq('author_id', userId)
                .eq('status', 'published')
                .gte('created_at', thirtyDaysAgo.toISOString())

            if (posts) {
                setStreak(calculateStreak(posts.map((p: any) => new Date(p.created_at))))
            }
        }

        loadStreak()
    }, [userId, supabase])

    if (!streak) return null

    if (streak.isActiveToday) {
        return (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <Zap className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-700 dark:text-green-300">
                    Great! You've posted today. Keep your <strong>{streak.currentStreak}-day streak</strong> going!
                </span>
            </div>
        )
    }

    if (streak.currentStreak > 0) {
        return (
            <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                <span className="text-sm text-orange-700 dark:text-orange-300">
                    Don't lose your <strong>{streak.currentStreak}-day streak</strong>! Post something today.
                </span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg">
            <Flame className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-text-light dark:text-dark-text-muted">
                Start a posting streak today!
            </span>
        </div>
    )
}
