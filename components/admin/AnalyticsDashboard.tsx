'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Users,
    FileText,
    MessageSquare,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Activity,
    Eye,
    ThumbsUp,
    Quote,
    AlertTriangle,
    Scale,
    UserPlus,
    Shield,
    Loader2
} from 'lucide-react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Legend
} from 'recharts'
import { format } from 'date-fns'
import { useTranslations } from 'next-intl'

interface AdminStats {
    users: {
        total: number
        new_period: number
        researchers: number
        moderators: number
        admins: number
        suspended: number
        verified_authors: number
    }
    posts: {
        total: number
        new_period: number
        articles: number
        questions: number
        discussions: number
        pending_approval: number
        approved: number
        rejected: number
    }
    comments: {
        total: number
        new_period: number
    }
    engagement: {
        total_votes: number
        votes_period: number
        citations: number
        citations_period: number
    }
    moderation: {
        pending_reports: number
        resolved_reports: number
        pending_appeals: number
        waitlist_pending: number
    }
    period_days: number
    generated_at: string
}

interface GrowthDataPoint {
    date: string
    new_users: number
    cumulative_users: number
}

interface ActivityDataPoint {
    date: string
    posts: number
    comments: number
    votes: number
}

export function AnalyticsDashboard() {
    const t = useTranslations('Admin.analyticsPage')
    const tCommon = useTranslations('Common')
    const tUser = useTranslations('UserManagement')

    const [stats, setStats] = useState<AdminStats | null>(null)
    const [userGrowth, setUserGrowth] = useState<GrowthDataPoint[]>([])
    const [contentActivity, setContentActivity] = useState<ActivityDataPoint[]>([])
    const [loading, setLoading] = useState(true)
    const [daysBack, setDaysBack] = useState(30)

    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        loadData()
    }, [daysBack])

    const loadData = async () => {
        setLoading(true)

        try {
            const [statsResult, growthResult, activityResult] = await Promise.all([
                supabase.rpc('get_admin_stats', { days_back: daysBack }),
                supabase.rpc('get_user_growth', { days_back: daysBack }),
                supabase.rpc('get_content_activity', { days_back: daysBack })
            ])

            if (statsResult.data && !statsResult.error) {
                setStats(statsResult.data as AdminStats)
            }

            if (growthResult.data && !growthResult.error) {
                setUserGrowth(growthResult.data as GrowthDataPoint[])
            }

            if (activityResult.data && !activityResult.error) {
                setContentActivity(activityResult.data as ActivityDataPoint[])
            }
        } catch (error) {
            console.error('Error loading analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateGrowthRate = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0
        return Math.round(((current - previous) / previous) * 100)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="text-center py-12 text-text-light dark:text-dark-text-muted">
                {t('failedToLoad')}
            </div>
        )
    }

    const StatCard = ({
        icon: Icon,
        label,
        value,
        subValue,
        trend,
        color = 'primary'
    }: {
        icon: typeof Users
        label: string
        value: number | string
        subValue?: string
        trend?: number
        color?: 'primary' | 'accent' | 'green' | 'yellow' | 'red' | 'purple'
    }) => {
        const colorClasses = {
            primary: 'text-primary dark:text-primary-light',
            accent: 'text-accent dark:text-accent-light',
            green: 'text-green-600 dark:text-green-400',
            yellow: 'text-yellow-600 dark:text-yellow-400',
            red: 'text-red-600 dark:text-red-400',
            purple: 'text-purple-600 dark:text-purple-400'
        }

        return (
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
                <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-lg bg-gray-100 dark:bg-dark-border ${colorClasses[color]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <div className="mt-4">
                    <p className="text-2xl font-display font-bold text-text dark:text-dark-text">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">{label}</p>
                    {subValue && (
                        <p className="text-xs text-text-light/70 dark:text-dark-text-muted/70 mt-0.5">{subValue}</p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-semibold text-text dark:text-dark-text">
                    {t('title')}
                </h2>
                <div className="flex items-center gap-2">
                    {[7, 14, 30, 90].map((days) => (
                        <button
                            key={days}
                            onClick={() => setDaysBack(days)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${daysBack === days
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 dark:bg-dark-border text-text-light dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border/80'
                                }`}
                        >
                            {days}{tCommon('days_short') || 'd'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={Users}
                    label={t('totalUsers')}
                    value={stats.users.total}
                    subValue={t('newInPeriod', { count: stats.users.new_period, days: daysBack })}
                    color="primary"
                />
                <StatCard
                    icon={FileText}
                    label={t('totalPosts')}
                    value={stats.posts.total}
                    subValue={t('newInPeriod', { count: stats.posts.new_period, days: daysBack })}
                    color="accent"
                />
                <StatCard
                    icon={MessageSquare}
                    label={t('totalComments')}
                    value={stats.comments.total}
                    subValue={t('newInPeriod', { count: stats.comments.new_period, days: daysBack })}
                    color="green"
                />
                <StatCard
                    icon={ThumbsUp}
                    label={t('totalVotes')}
                    value={stats.engagement.total_votes}
                    subValue={t('newInPeriod', { count: stats.engagement.votes_period, days: daysBack })}
                    color="purple"
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* User Growth Chart */}
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
                    <h3 className="font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        {t('userGrowth')}
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={userGrowth}>
                                <defs>
                                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--color-primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--color-primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-dark-border" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                                    className="text-xs"
                                    tick={{ fill: 'currentColor' }}
                                />
                                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-surface)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px'
                                    }}
                                    labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="cumulative_users"
                                    stroke="hsl(var(--color-primary))"
                                    fill="url(#userGradient)"
                                    strokeWidth={2}
                                    name={t('totalUsers')}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Content Activity Chart */}
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
                    <h3 className="font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-accent" />
                        {t('contentActivity')}
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={contentActivity}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-dark-border" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                                    className="text-xs"
                                    tick={{ fill: 'currentColor' }}
                                />
                                <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-surface)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px'
                                    }}
                                    labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                                />
                                <Legend />
                                <Bar dataKey="posts" fill="hsl(var(--color-primary))" name={t('articles')} radius={[2, 2, 0, 0]} />
                                <Bar dataKey="comments" fill="hsl(var(--color-accent))" name={t('totalComments')} radius={[2, 2, 0, 0]} />
                                <Bar dataKey="votes" fill="#8B5CF6" name={t('totalVotes')} radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* User Breakdown & Moderation Stats */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* User Role Distribution */}
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
                    <h3 className="font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        {t('userRoles')}
                    </h3>
                    <div className="space-y-4">
                        {[
                            { label: tUser('researchers'), count: stats.users.researchers, color: 'bg-blue-500' },
                            { label: tUser('moderators'), count: stats.users.moderators, color: 'bg-green-500' },
                            { label: tUser('admins'), count: stats.users.admins, color: 'bg-purple-500' },
                            { label: tUser('verified'), count: stats.users.verified_authors, color: 'bg-amber-500' },
                            { label: tUser('suspended'), count: stats.users.suspended, color: 'bg-red-500' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                    <span className="text-text dark:text-dark-text">{item.label}</span>
                                </div>
                                <span className="font-semibold text-text dark:text-dark-text">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Moderation Queue */}
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
                    <h3 className="font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        {t('moderationQueue')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-medium">{t('pendingReports')}</span>
                            </div>
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-2">
                                {stats.moderation.pending_reports}
                            </p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                                <Scale className="w-4 h-4" />
                                <span className="text-sm font-medium">{t('pendingAppeals')}</span>
                            </div>
                            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-2">
                                {stats.moderation.pending_appeals}
                            </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                <UserPlus className="w-4 h-4" />
                                <span className="text-sm font-medium">{t('waitlist')}</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-2">
                                {stats.moderation.waitlist_pending}
                            </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                <FileText className="w-4 h-4" />
                                <span className="text-sm font-medium">{t('postsPending')}</span>
                            </div>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-2">
                                {stats.posts.pending_approval}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Type Distribution */}
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
                <h3 className="font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-accent" />
                    {t('contentDistribution')}
                </h3>
                <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-primary dark:text-primary-light">
                            {stats.posts.articles}
                        </p>
                        <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">{t('articles')}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-accent dark:text-accent-light">
                            {stats.posts.questions}
                        </p>
                        <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">{t('questions')}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {stats.posts.discussions}
                        </p>
                        <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">{t('discussions')}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
