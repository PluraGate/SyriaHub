'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Users,
    FileText,
    MessageSquare,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Activity,
    ThumbsUp,
    AlertTriangle,
    Scale,
    UserPlus,
    Shield,
    Loader2
} from 'lucide-react'
import {
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

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl border border-gray-100 dark:border-dark-border px-4 py-3 rounded-xl shadow-lg">
                <p className="text-sm font-semibold text-text dark:text-dark-text mb-2">
                    {format(new Date(label), 'MMM d, yyyy')}
                </p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2.5">
                            <span 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: entry.color }} 
                            />
                            <span className="text-xs text-text-light dark:text-dark-text-muted">
                                {entry.name}:
                            </span>
                            <span className="text-xs font-semibold text-text dark:text-dark-text ml-auto">
                                {entry.value?.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    return null
}

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

    const loadData = useCallback(async () => {
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
    }, [daysBack, supabase])

    useEffect(() => {
        loadData()
    }, [daysBack, loadData])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary/60 mx-auto" />
                    <p className="text-sm text-text-light dark:text-dark-text-muted mt-3">
                        Loading analytics...
                    </p>
                </div>
            </div>
        )
    }

    if (!stats) {
        return (
            <div className="text-center py-16 text-text-light dark:text-dark-text-muted">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t('failedToLoad')}</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-text dark:text-dark-text">
                        {t('title')}
                    </h1>
                    <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                        Track platform growth and user engagement
                    </p>
                </div>
                <div className="flex items-center gap-1 p-1 bg-gray-100/80 dark:bg-dark-border/50 rounded-lg">
                    {[7, 14, 30, 90].map((days) => (
                        <button
                            key={days}
                            onClick={() => setDaysBack(days)}
                            className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-all ${
                                daysBack === days
                                    ? 'bg-white dark:bg-dark-surface text-text dark:text-dark-text shadow-sm'
                                    : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                            }`}
                        >
                            {days}{tCommon('days_short') || 'd'}
                        </button>
                    ))}
                </div>
            </header>

            {/* Overview Stats */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={Users}
                    label={t('totalUsers')}
                    value={stats.users.total}
                    change={stats.users.new_period}
                    changeLabel={`+${stats.users.new_period} in ${daysBack}d`}
                    accentColor="blue"
                />
                <StatCard
                    icon={FileText}
                    label={t('totalPosts')}
                    value={stats.posts.total}
                    change={stats.posts.new_period}
                    changeLabel={`+${stats.posts.new_period} in ${daysBack}d`}
                    accentColor="rose"
                />
                <StatCard
                    icon={MessageSquare}
                    label={t('totalComments')}
                    value={stats.comments.total}
                    change={stats.comments.new_period}
                    changeLabel={`+${stats.comments.new_period} in ${daysBack}d`}
                    accentColor="emerald"
                />
                <StatCard
                    icon={ThumbsUp}
                    label={t('totalVotes')}
                    value={stats.engagement.total_votes}
                    change={stats.engagement.votes_period}
                    changeLabel={`+${stats.engagement.votes_period} in ${daysBack}d`}
                    accentColor="violet"
                />
            </section>

            {/* Charts */}
            <section className="grid gap-6 lg:grid-cols-2">
                {/* User Growth Chart */}
                <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-border">
                            <TrendingUp className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                        </div>
                        <h3 className="font-semibold text-text dark:text-dark-text">
                            {t('userGrowth')}
                        </h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={userGrowth}>
                                <defs>
                                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    stroke="currentColor" 
                                    className="text-gray-100 dark:text-dark-border" 
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={40}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="cumulative_users"
                                    stroke="#3b82f6"
                                    fill="url(#userGradient)"
                                    strokeWidth={2}
                                    name={t('totalUsers')}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Content Activity Chart */}
                <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-border">
                            <Activity className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                        </div>
                        <h3 className="font-semibold text-text dark:text-dark-text">
                            {t('contentActivity')}
                        </h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={contentActivity} barGap={4}>
                                <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    stroke="currentColor" 
                                    className="text-gray-100 dark:text-dark-border" 
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={40}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    iconType="circle" 
                                    iconSize={8}
                                    wrapperStyle={{ paddingTop: 16 }}
                                />
                                <Bar 
                                    dataKey="posts" 
                                    fill="#3b82f6" 
                                    name={t('articles')} 
                                    radius={[4, 4, 0, 0]} 
                                />
                                <Bar 
                                    dataKey="comments" 
                                    fill="#10b981" 
                                    name={t('totalComments')} 
                                    radius={[4, 4, 0, 0]} 
                                />
                                <Bar 
                                    dataKey="votes" 
                                    fill="#8b5cf6" 
                                    name={t('totalVotes')} 
                                    radius={[4, 4, 0, 0]} 
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* User Breakdown & Moderation */}
            <section className="grid gap-6 lg:grid-cols-2">
                {/* User Role Distribution */}
                <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-border">
                            <Shield className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                        </div>
                        <h3 className="font-semibold text-text dark:text-dark-text">
                            {t('userRoles')}
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: tUser('researchers'), count: stats.users.researchers, color: 'bg-blue-500' },
                            { label: tUser('moderators'), count: stats.users.moderators, color: 'bg-emerald-500' },
                            { label: tUser('admins'), count: stats.users.admins, color: 'bg-violet-500' },
                            { label: tUser('verified'), count: stats.users.verified_authors, color: 'bg-amber-500' },
                            { label: tUser('suspended'), count: stats.users.suspended, color: 'bg-red-500' },
                        ].map((item) => (
                            <div 
                                key={item.label} 
                                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                    <span className="text-sm text-text dark:text-dark-text">
                                        {item.label}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-text dark:text-dark-text tabular-nums">
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Moderation Queue */}
                <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-border">
                            <AlertTriangle className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                        </div>
                        <h3 className="font-semibold text-text dark:text-dark-text">
                            {t('moderationQueue')}
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <ModerationCard
                            icon={AlertTriangle}
                            label={t('pendingReports')}
                            value={stats.moderation.pending_reports}
                            accentColor="amber"
                        />
                        <ModerationCard
                            icon={Scale}
                            label={t('pendingAppeals')}
                            value={stats.moderation.pending_appeals}
                            accentColor="orange"
                        />
                        <ModerationCard
                            icon={UserPlus}
                            label={t('waitlist')}
                            value={stats.moderation.waitlist_pending}
                            accentColor="violet"
                        />
                        <ModerationCard
                            icon={FileText}
                            label={t('postsPending')}
                            value={stats.posts.pending_approval}
                            accentColor="emerald"
                        />
                    </div>
                </div>
            </section>

            {/* Content Distribution */}
            <section className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-border">
                        <BarChart3 className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                    </div>
                    <h3 className="font-semibold text-text dark:text-dark-text">
                        {t('contentDistribution')}
                    </h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <ContentTypeCard
                        label={t('articles')}
                        value={stats.posts.articles}
                        accentColor="blue"
                    />
                    <ContentTypeCard
                        label={t('questions')}
                        value={stats.posts.questions}
                        accentColor="rose"
                    />
                    <ContentTypeCard
                        label={t('discussions')}
                        value={stats.posts.discussions}
                        accentColor="violet"
                    />
                </div>
            </section>

            {/* Footer */}
            {stats.generated_at && (
                <footer className="text-center pb-4">
                    <p className="text-xs text-text-light/60 dark:text-dark-text-muted/60">
                        {tCommon('lastUpdated', { date: format(new Date(stats.generated_at), 'MMM d, yyyy HH:mm') })}
                    </p>
                </footer>
            )}
        </div>
    )
}

// Stat Card Component
function StatCard({
    icon: Icon,
    label,
    value,
    change,
    changeLabel,
    accentColor
}: {
    icon: typeof Users
    label: string
    value: number
    change: number
    changeLabel: string
    accentColor: 'blue' | 'rose' | 'emerald' | 'violet'
}) {
    const borderColors = {
        blue: 'border-l-blue-500',
        rose: 'border-l-rose-500',
        emerald: 'border-l-emerald-500',
        violet: 'border-l-violet-500'
    }

    const iconColors = {
        blue: 'text-blue-600 dark:text-blue-400',
        rose: 'text-rose-600 dark:text-rose-400',
        emerald: 'text-emerald-600 dark:text-emerald-400',
        violet: 'text-violet-600 dark:text-violet-400'
    }

    return (
        <div className={`bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border border-l-4 ${borderColors[accentColor]} p-5 shadow-sm`}>
            <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg bg-gray-50 dark:bg-dark-border ${iconColors[accentColor]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {change > 0 && (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">+{change}</span>
                    </div>
                )}
            </div>
            <div className="mt-4">
                <p className="text-3xl font-display font-bold text-text dark:text-dark-text tabular-nums">
                    {value.toLocaleString()}
                </p>
                <p className="text-sm font-medium text-text-light dark:text-dark-text-muted mt-1">
                    {label}
                </p>
                <p className="text-xs text-text-light/70 dark:text-dark-text-muted/70 mt-0.5">
                    {changeLabel}
                </p>
            </div>
        </div>
    )
}

// Moderation Card Component
function ModerationCard({
    icon: Icon,
    label,
    value,
    accentColor
}: {
    icon: typeof AlertTriangle
    label: string
    value: number
    accentColor: 'amber' | 'orange' | 'violet' | 'emerald'
}) {
    const colors = {
        amber: {
            border: 'border-amber-500/50',
            icon: 'text-amber-600 dark:text-amber-400'
        },
        orange: {
            border: 'border-orange-500/50',
            icon: 'text-orange-600 dark:text-orange-400'
        },
        violet: {
            border: 'border-violet-500/50',
            icon: 'text-violet-600 dark:text-violet-400'
        },
        emerald: {
            border: 'border-emerald-500/50',
            icon: 'text-emerald-600 dark:text-emerald-400'
        }
    }

    const style = colors[accentColor]

    return (
        <div className={`bg-white dark:bg-dark-surface rounded-xl border ${style.border} p-4`}>
            <div className={`flex items-center gap-2 ${style.icon} mb-2`}>
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium text-text-light dark:text-dark-text-muted">{label}</span>
            </div>
            <p className="text-2xl font-bold text-text dark:text-dark-text tabular-nums">
                {value}
            </p>
        </div>
    )
}

// Content Type Card Component
function ContentTypeCard({
    label,
    value,
    accentColor
}: {
    label: string
    value: number
    accentColor: 'blue' | 'rose' | 'violet'
}) {
    const colors = {
        blue: 'border-blue-500/40 text-blue-600 dark:text-blue-400',
        rose: 'border-rose-500/40 text-rose-600 dark:text-rose-400',
        violet: 'border-violet-500/40 text-violet-600 dark:text-violet-400'
    }

    return (
        <div className={`bg-white dark:bg-dark-surface rounded-xl border ${colors[accentColor].split(' ')[0]} p-5 text-center`}>
            <p className={`text-3xl font-bold ${colors[accentColor].split(' ').slice(1).join(' ')} tabular-nums`}>
                {value}
            </p>
            <p className="text-sm text-text-light dark:text-dark-text-muted mt-1.5 font-medium">
                {label}
            </p>
        </div>
    )
}
