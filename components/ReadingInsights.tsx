'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Clock, Target, Tag, TrendingUp, Calendar, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ReadingStats {
    total_posts_read: number
    posts_completed: number
    total_reading_time: number
    posts_read_this_week: number
    posts_read_this_month: number
    avg_read_time: number
}

interface FavoriteTopic {
    tag: string
    read_count: number
}

interface ReadingActivity {
    date: string
    posts_read: number
    minutes_read: number
}

interface ReadingInsightsProps {
    userId: string
    compact?: boolean
}

export function ReadingInsights({ userId, compact = false }: ReadingInsightsProps) {
    const [stats, setStats] = useState<ReadingStats | null>(null)
    const [topics, setTopics] = useState<FavoriteTopic[]>([])
    const [activity, setActivity] = useState<ReadingActivity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchReadingData() {
            const supabase = createClient()

            try {
                // Get reading stats
                const { data: statsData } = await supabase.rpc('get_user_reading_stats', {
                    p_user_id: userId,
                })
                if (statsData) setStats(statsData)

                // Get favorite topics
                const { data: topicsData } = await supabase.rpc('get_favorite_topics', {
                    p_user_id: userId,
                    p_limit: 5,
                })
                if (topicsData) setTopics(topicsData)

                // Get activity
                const { data: activityData } = await supabase.rpc('get_reading_activity', {
                    p_user_id: userId,
                    p_days: 30,
                })
                if (activityData) setActivity(activityData)
            } catch (error) {
                console.error('Failed to fetch reading insights:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchReadingData()
    }, [userId])

    if (loading) {
        return <ReadingInsightsSkeleton compact={compact} />
    }

    if (!stats || stats.total_posts_read === 0) {
        return (
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 text-center">
                <BookOpen className="w-8 h-8 text-text-light dark:text-dark-text-muted mx-auto mb-2" />
                <p className="text-text-light dark:text-dark-text-muted">No reading activity yet</p>
                <p className="text-sm text-text-light/70 dark:text-dark-text-muted/70 mt-1">
                    Start exploring posts to see your reading insights
                </p>
            </div>
        )
    }

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        if (hours > 0) return `${hours}h ${minutes}m`
        return `${minutes}m`
    }

    const completionRate = stats.total_posts_read > 0
        ? Math.round((stats.posts_completed / stats.total_posts_read) * 100)
        : 0

    if (compact) {
        return (
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-text dark:text-dark-text flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        Reading Stats
                    </h3>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                        <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.total_posts_read}</p>
                        <p className="text-xs text-text-light dark:text-dark-text-muted">Posts Read</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-text dark:text-dark-text">{formatTime(stats.total_reading_time)}</p>
                        <p className="text-xs text-text-light dark:text-dark-text-muted">Total Time</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-text dark:text-dark-text">{completionRate}%</p>
                        <p className="text-xs text-text-light dark:text-dark-text-muted">Completed</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                <h3 className="font-semibold text-text dark:text-dark-text flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Reading Insights
                </h3>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                <StatCard
                    icon={BookOpen}
                    value={stats.total_posts_read.toString()}
                    label="Posts Read"
                    color="primary"
                />
                <StatCard
                    icon={Clock}
                    value={formatTime(stats.total_reading_time)}
                    label="Total Time"
                    color="accent"
                />
                <StatCard
                    icon={Target}
                    value={`${completionRate}%`}
                    label="Completion Rate"
                    color="secondary"
                />
                <StatCard
                    icon={TrendingUp}
                    value={stats.posts_read_this_week.toString()}
                    label="This Week"
                    color="green"
                />
            </div>

            {/* Favorite Topics */}
            {topics.length > 0 && (
                <div className="px-4 pb-4">
                    <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4">
                        <h4 className="text-sm font-medium text-text dark:text-dark-text mb-3 flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500" />
                            Favorite Topics
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {topics.map((topic, i) => (
                                <span
                                    key={topic.tag}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${i === 0
                                            ? 'bg-primary/20 text-primary'
                                            : i === 1
                                                ? 'bg-accent/20 text-accent-dark'
                                                : 'bg-gray-200 dark:bg-dark-border text-text-light dark:text-dark-text-muted'
                                        }`}
                                >
                                    #{topic.tag}
                                    <span className="ml-1.5 text-xs opacity-70">({topic.read_count})</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Activity Heatmap */}
            {activity.length > 0 && (
                <div className="px-4 pb-4">
                    <ActivityHeatmap data={activity} />
                </div>
            )}
        </div>
    )
}

// Stat Card
interface StatCardProps {
    icon: any
    value: string
    label: string
    color: 'primary' | 'accent' | 'secondary' | 'green'
}

const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent-dark',
    secondary: 'bg-secondary/10 text-secondary-dark',
    green: 'bg-green-500/10 text-green-600',
}

function StatCard({ icon: Icon, value, label, color }: StatCardProps) {
    return (
        <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
            <div className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-text dark:text-dark-text">{value}</p>
            <p className="text-xs text-text-light dark:text-dark-text-muted">{label}</p>
        </div>
    )
}

// Activity Heatmap
function ActivityHeatmap({ data }: { data: ReadingActivity[] }) {
    // Create a map for quick lookup
    const activityMap = new Map(data.map(d => [d.date, d]))

    // Generate last 30 days
    const days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        return date.toISOString().split('T')[0]
    })

    const maxPosts = Math.max(...data.map(d => d.posts_read), 1)

    return (
        <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4">
            <h4 className="text-sm font-medium text-text dark:text-dark-text mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Reading Activity (Last 30 Days)
            </h4>
            <div className="flex gap-1 flex-wrap">
                {days.map(day => {
                    const activity = activityMap.get(day)
                    const intensity = activity ? activity.posts_read / maxPosts : 0

                    return (
                        <div
                            key={day}
                            className="w-4 h-4 rounded-sm transition-colors group relative cursor-pointer"
                            style={{
                                backgroundColor: intensity > 0
                                    ? `rgba(99, 102, 241, ${0.2 + intensity * 0.8})`
                                    : 'rgba(156, 163, 175, 0.2)',
                            }}
                        >
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {activity ? `${activity.posts_read} posts, ${activity.minutes_read}m` : 'No activity'}
                                <br />
                                {new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-text-light dark:text-dark-text-muted">
                <span>Less</span>
                {[0.2, 0.4, 0.6, 0.8, 1].map((level, i) => (
                    <div
                        key={i}
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: `rgba(99, 102, 241, ${level})` }}
                    />
                ))}
                <span>More</span>
            </div>
        </div>
    )
}

// Skeleton
function ReadingInsightsSkeleton({ compact }: { compact?: boolean }) {
    if (compact) {
        return (
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4 animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-dark-border rounded w-24 mb-3" />
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="text-center">
                            <div className="h-8 bg-gray-200 dark:bg-dark-border rounded mb-1" />
                            <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-12 mx-auto" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden animate-pulse">
            <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                <div className="h-5 bg-gray-200 dark:bg-dark-border rounded w-32" />
            </div>
            <div className="grid grid-cols-4 gap-4 p-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-dark-border rounded-lg mb-2" />
                        <div className="h-6 bg-gray-200 dark:bg-dark-border rounded w-12 mb-1" />
                        <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-16" />
                    </div>
                ))}
            </div>
        </div>
    )
}
