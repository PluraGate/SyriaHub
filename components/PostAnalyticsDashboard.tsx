'use client'

import { useState, useEffect } from 'react'
import { Eye, Users, Clock, TrendingUp, ArrowUp, ArrowDown, BarChart3, Percent } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Analytics {
    total_views: number
    unique_viewers: number
    avg_read_time: number
    avg_scroll_depth: number
    views_today: number
    views_this_week: number
    views_this_month: number
    viewsOverTime: { date: string; views: number }[]
}

interface PostAnalyticsDashboardProps {
    postId: string
    postTitle: string
}

export function PostAnalyticsDashboard({ postId, postTitle }: PostAnalyticsDashboardProps) {
    const [analytics, setAnalytics] = useState<Analytics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const response = await fetch(`/api/analytics?postId=${postId}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch analytics')
                }
                const data = await response.json()
                setAnalytics(data)
            } catch (err) {
                setError('Unable to load analytics')
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [postId])

    if (loading) {
        return <AnalyticsSkeleton />
    }

    if (error || !analytics) {
        return (
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 text-center">
                <BarChart3 className="w-8 h-8 text-text-light dark:text-dark-text-muted mx-auto mb-2" />
                <p className="text-text-light dark:text-dark-text-muted">{error || 'No analytics available'}</p>
            </div>
        )
    }

    const formatReadTime = (seconds: number) => {
        if (seconds < 60) return `${Math.round(seconds)}s`
        const minutes = Math.floor(seconds / 60)
        const secs = Math.round(seconds % 60)
        return `${minutes}m ${secs}s`
    }

    const formatScrollDepth = (depth: number) => `${Math.round(depth * 100)}%`

    // Calculate trend (comparing this week to last week estimate)
    const weeklyTrend = analytics.views_this_week > analytics.views_this_month / 4 ? 'up' : 'down'
    const trendPercent = analytics.views_this_month > 0
        ? Math.round(((analytics.views_this_week * 4) / analytics.views_this_month - 1) * 100)
        : 0

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-text dark:text-dark-text">Analytics</h3>
                </div>
                <p className="text-sm text-text-light dark:text-dark-text-muted mt-1 line-clamp-1">
                    {postTitle}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 p-4">
                {/* Total Views */}
                <StatCard
                    icon={Eye}
                    label="Total Views"
                    value={analytics.total_views.toLocaleString()}
                    trend={weeklyTrend === 'up' ? `+${trendPercent}%` : undefined}
                    trendUp={weeklyTrend === 'up'}
                />

                {/* Unique Viewers */}
                <StatCard
                    icon={Users}
                    label="Unique Viewers"
                    value={analytics.unique_viewers.toLocaleString()}
                />

                {/* Avg Read Time */}
                <StatCard
                    icon={Clock}
                    label="Avg Read Time"
                    value={formatReadTime(analytics.avg_read_time)}
                />

                {/* Scroll Depth */}
                <StatCard
                    icon={Percent}
                    label="Avg Scroll Depth"
                    value={formatScrollDepth(analytics.avg_scroll_depth)}
                />
            </div>

            {/* Time Period Stats */}
            <div className="px-4 pb-4">
                <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4">
                    <h4 className="text-sm font-medium text-text dark:text-dark-text mb-3">Views by Period</h4>
                    <div className="space-y-3">
                        <PeriodRow label="Today" value={analytics.views_today} total={analytics.total_views} />
                        <PeriodRow label="This Week" value={analytics.views_this_week} total={analytics.total_views} />
                        <PeriodRow label="This Month" value={analytics.views_this_month} total={analytics.total_views} />
                    </div>
                </div>
            </div>

            {/* Mini Chart */}
            {analytics.viewsOverTime && analytics.viewsOverTime.length > 0 && (
                <div className="px-4 pb-4">
                    <MiniChart data={analytics.viewsOverTime} />
                </div>
            )}
        </div>
    )
}

// Stat Card Component
interface StatCardProps {
    icon: any
    label: string
    value: string
    trend?: string
    trendUp?: boolean
}

function StatCard({ icon: Icon, label, value, trend, trendUp }: StatCardProps) {
    return (
        <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-text-light dark:text-dark-text-muted">{label}</span>
            </div>
            <div className="flex items-end gap-2">
                <span className="text-xl font-bold text-text dark:text-dark-text">{value}</span>
                {trend && (
                    <span className={`flex items-center text-xs font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                        {trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {trend}
                    </span>
                )}
            </div>
        </div>
    )
}

// Period Row Component
interface PeriodRowProps {
    label: string
    value: number
    total: number
}

function PeriodRow({ label, value, total }: PeriodRowProps) {
    const percentage = total > 0 ? (value / total) * 100 : 0

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-text-light dark:text-dark-text-muted w-24">{label}</span>
            <div className="flex-1 h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
            <span className="text-sm font-medium text-text dark:text-dark-text w-12 text-right">
                {value}
            </span>
        </div>
    )
}

// Mini Chart Component
interface MiniChartProps {
    data: { date: string; views: number }[]
}

function MiniChart({ data }: MiniChartProps) {
    const maxViews = Math.max(...data.map(d => d.views), 1)

    return (
        <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4">
            <h4 className="text-sm font-medium text-text dark:text-dark-text mb-3">Views (Last 30 Days)</h4>
            <div className="flex items-end gap-1 h-20">
                {data.slice(-30).map((day, i) => (
                    <div
                        key={day.date}
                        className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors cursor-pointer group relative"
                        style={{ height: `${(day.views / maxViews) * 100}%`, minHeight: day.views > 0 ? '4px' : '2px' }}
                    >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {day.views} views
                            <br />
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Skeleton Loader
function AnalyticsSkeleton() {
    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden animate-pulse">
            <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                <div className="h-5 bg-gray-200 dark:bg-dark-border rounded w-24" />
                <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-40 mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 p-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                        <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-16 mb-2" />
                        <div className="h-6 bg-gray-200 dark:bg-dark-border rounded w-12" />
                    </div>
                ))}
            </div>
        </div>
    )
}
