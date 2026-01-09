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

                // Get active users from the last 30 minutes (based on post views)
                const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)

                // Fetch distinct user_ids from post_views for recent activity
                const { data: postViewData } = await supabase
                    .from('post_views')
                    .select('user_id')
                    .gte('created_at', thirtyMinutesAgo.toISOString())
                    .not('user_id', 'is', null)

                // Fetch distinct user_ids from reading_history for users who have been active
                const { data: readingHistoryData } = await supabase
                    .from('reading_history')
                    .select('user_id')
                    .gte('last_viewed_at', thirtyMinutesAgo.toISOString())

                // Check if current user is authenticated (they count as online too)
                // Using getSession() which works better with cookie-based auth
                const { data: { session } } = await supabase.auth.getSession()
                const currentUserId = session?.user?.id

                // Combine all user_ids into a Set to get unique users
                const uniqueUsers = new Set<string>()
                postViewData?.forEach(r => r.user_id && uniqueUsers.add(r.user_id))
                readingHistoryData?.forEach(r => r.user_id && uniqueUsers.add(r.user_id))

                // If user is authenticated, add them to the set (Set handles duplicates)
                if (currentUserId) {
                    uniqueUsers.add(currentUserId)
                }

                const onlineNow = uniqueUsers.size

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

        // Subscribe to Realtime updates for live online count
        const postViewsChannel = supabase
            .channel('social-proof-post-views')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'post_views' },
                () => {
                    // Refresh stats when new post view is recorded
                    loadStats()
                }
            )
            .subscribe()

        const readingHistoryChannel = supabase
            .channel('social-proof-reading-history')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'reading_history' },
                () => {
                    // Refresh stats when reading history changes
                    loadStats()
                }
            )
            .subscribe()

        // Also subscribe to new posts for live posts count
        const postsChannel = supabase
            .channel('social-proof-posts')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'posts' },
                () => {
                    loadStats()
                }
            )
            .subscribe()

        // Fallback polling every 30 seconds (reduced from 60s)
        const interval = setInterval(loadStats, 30000)

        return () => {
            clearInterval(interval)
            supabase.removeChannel(postViewsChannel)
            supabase.removeChannel(readingHistoryChannel)
            supabase.removeChannel(postsChannel)
        }
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
    const supabase = createClient()

    useEffect(() => {
        const loadOnlineCount = async () => {
            const now = new Date()
            const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)

            // Fetch distinct user_ids from post_views for recent activity
            const { data: postViewData } = await supabase
                .from('post_views')
                .select('user_id')
                .gte('created_at', thirtyMinutesAgo.toISOString())
                .not('user_id', 'is', null)

            // Fetch distinct user_ids from reading_history for users who have been active
            const { data: readingHistoryData } = await supabase
                .from('reading_history')
                .select('user_id')
                .gte('last_viewed_at', thirtyMinutesAgo.toISOString())

            // Check if current user is authenticated (they count as online too)
            // Using getSession() which works better with cookie-based auth
            const { data: { session } } = await supabase.auth.getSession()
            const currentUserId = session?.user?.id

            // Combine all user_ids into a Set to get unique users
            const uniqueUsers = new Set<string>()
            postViewData?.forEach(r => r.user_id && uniqueUsers.add(r.user_id))
            readingHistoryData?.forEach(r => r.user_id && uniqueUsers.add(r.user_id))

            // If user is authenticated, add them to the set (Set handles duplicates)
            if (currentUserId) {
                uniqueUsers.add(currentUserId)
            }

            setOnlineCount(uniqueUsers.size)
        }

        loadOnlineCount()

        // Subscribe to Realtime updates for live online count
        const postViewsChannel = supabase
            .channel('online-indicator-post-views')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'post_views' },
                () => loadOnlineCount()
            )
            .subscribe()

        const readingHistoryChannel = supabase
            .channel('online-indicator-reading-history')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'reading_history' },
                () => loadOnlineCount()
            )
            .subscribe()

        // Fallback polling every 30 seconds
        const interval = setInterval(loadOnlineCount, 30000)

        return () => {
            clearInterval(interval)
            supabase.removeChannel(postViewsChannel)
            supabase.removeChannel(readingHistoryChannel)
        }
    }, [supabase])

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
