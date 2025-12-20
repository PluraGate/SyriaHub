'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, TrendingUp, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface SocialProofStats {
    onlineNow: number
    todayPosts: number
    weeklyGrowth: number
}

export function SocialProofBanner() {
    const t = useTranslations('SocialProof')
    const [stats, setStats] = useState<SocialProofStats>({
        onlineNow: 0,
        todayPosts: 0,
        weeklyGrowth: 0,
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const loadStats = async () => {
            try {
                const now = new Date()
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

                // Get today's posts count
                const { count: todayPosts } = await supabase
                    .from('posts')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', todayStart.toISOString())
                    .eq('status', 'published')

                // Get this week's new users
                const { count: thisWeekUsers } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', weekAgo.toISOString())

                // Get last week's new users (for comparison)
                const { count: lastWeekUsers } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', twoWeeksAgo.toISOString())
                    .lt('created_at', weekAgo.toISOString())

                // Calculate growth percentage
                const weeklyGrowth = lastWeekUsers && lastWeekUsers > 0
                    ? Math.round(((thisWeekUsers || 0) - lastWeekUsers) / lastWeekUsers * 100)
                    : 0

                // Simulate "online now" with random number based on time of day
                // In a real app, you'd track this with presence or analytics
                const hour = now.getHours()
                const baseOnline = 10 + Math.floor(Math.random() * 15)
                const timeMultiplier = hour >= 9 && hour <= 18 ? 2 : 1
                const onlineNow = baseOnline * timeMultiplier

                setStats({
                    onlineNow,
                    todayPosts: todayPosts || 0,
                    weeklyGrowth: Math.max(0, weeklyGrowth),
                })
            } catch (error) {
                console.error('Error loading social proof stats:', error)
            } finally {
                setLoading(false)
            }
        }

        loadStats()

        // Refresh every minute
        const interval = setInterval(loadStats, 60000)
        return () => clearInterval(interval)
    }, [supabase])

    if (loading) {
        return (
            <div className="flex items-center justify-center gap-6 py-3 bg-primary/5 dark:bg-primary-light/5 rounded-lg animate-pulse">
                <div className="h-4 w-32 bg-gray-200 dark:bg-dark-border rounded" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-dark-border rounded" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-dark-border rounded" />
            </div>
        )
    }

    return (
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-4 text-sm text-text-light dark:text-dark-text-muted">
            <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                <span>
                    <span className="font-medium text-text dark:text-dark-text">{stats.onlineNow}</span>
                    {' '}{t('researchersOnline')}
                </span>
            </div>

            <span className="hidden sm:inline text-gray-300 dark:text-dark-border">·</span>

            <div className="flex items-center gap-2">
                <span>
                    <span className="font-medium text-text dark:text-dark-text">{stats.todayPosts}</span>
                    {' '}{t('postsToday')}
                </span>
            </div>

            {stats.weeklyGrowth > 0 && (
                <>
                    <span className="hidden sm:inline text-gray-300 dark:text-dark-border">·</span>
                    <div className="flex items-center gap-1">
                        <span className="font-medium text-text dark:text-dark-text">+{stats.weeklyGrowth}%</span>
                        {' '}{t('thisWeek')}
                    </div>
                </>
            )}
        </div>
    )
}

/**
 * Compact social proof indicator (just online count)
 */
export function OnlineIndicator() {
    const [onlineCount, setOnlineCount] = useState(0)

    useEffect(() => {
        // Simulate dynamic count
        const now = new Date()
        const hour = now.getHours()
        const baseOnline = 10 + Math.floor(Math.random() * 15)
        const timeMultiplier = hour >= 9 && hour <= 18 ? 2 : 1
        setOnlineCount(baseOnline * timeMultiplier)

        const interval = setInterval(() => {
            setOnlineCount(prev => prev + Math.floor(Math.random() * 3) - 1)
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex items-center gap-2 text-xs text-text-light dark:text-dark-text-muted">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            {onlineCount} online
        </div>
    )
}
