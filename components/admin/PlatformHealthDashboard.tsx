'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Activity,
    Clock,
    FileText,
    TrendingUp,
    Target,
    CheckCircle2,
    AlertCircle,
    Users,
    Zap,
    BarChart3,
    Loader2,
    RefreshCw
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
    PieChart,
    Pie,
    Cell
} from 'recharts'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface ContentVelocity {
    posts_per_day: number
    gaps_per_week: number
    comments_per_day: number
    outcomes_per_month: number
    avg_gap_resolution_days: number
}

interface GapMetrics {
    total_gaps: number
    open_gaps: number
    investigating_gaps: number
    addressed_gaps: number
    resolution_rate: number
    avg_upvotes: number
    claim_success_rate: number
    contributions_this_week: number
}

interface ModerationMetrics {
    pending_queue: number
    reviewed_today: number
    reviewed_this_week: number
    pending_appeals: number
    avg_review_time_hours: number
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1']

export function PlatformHealthDashboard() {
    const t = useTranslations('PlatformHealth')

    const [velocity, setVelocity] = useState<ContentVelocity | null>(null)
    const [gapMetrics, setGapMetrics] = useState<GapMetrics | null>(null)
    const [moderation, setModeration] = useState<ModerationMetrics | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const supabase = useMemo(() => createClient(), [])

    const loadData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)

        try {
            const [velocityResult, gapResult, modResult] = await Promise.all([
                supabase.rpc('get_content_velocity', { p_days: 7 }),
                supabase.rpc('get_gap_metrics'),
                supabase.rpc('get_moderation_metrics')
            ])

            if (velocityResult.data && !velocityResult.error) {
                // RPC returns array, take first item
                const data = Array.isArray(velocityResult.data)
                    ? velocityResult.data[0]
                    : velocityResult.data
                setVelocity(data as ContentVelocity)
            }

            if (gapResult.data && !gapResult.error) {
                const data = Array.isArray(gapResult.data)
                    ? gapResult.data[0]
                    : gapResult.data
                setGapMetrics(data as GapMetrics)
            }

            if (modResult.data && !modResult.error) {
                const data = Array.isArray(modResult.data)
                    ? modResult.data[0]
                    : modResult.data
                setModeration(data as ModerationMetrics)
            }
        } catch (error) {
            console.error('Error loading platform health:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [supabase])

    useEffect(() => {
        loadData()
    }, [loadData])


    // Prepare pie chart data for gap status
    const gapStatusData = gapMetrics ? [
        { name: t('gapStatus.open'), value: gapMetrics.open_gaps, color: '#3B82F6' },
        { name: t('gapStatus.investigating'), value: gapMetrics.investigating_gaps, color: '#F59E0B' },
        { name: t('gapStatus.addressed'), value: gapMetrics.addressed_gaps, color: '#10B981' }
    ].filter(d => d.value > 0) : []

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const MetricCard = ({
        icon: Icon,
        label,
        value,
        subValue,
        color = 'primary',
        highlight = false
    }: {
        icon: typeof Activity
        label: string
        value: string | number
        subValue?: string
        color?: 'primary' | 'green' | 'yellow' | 'red' | 'purple' | 'blue'
        highlight?: boolean
    }) => {
        const colorClasses = {
            primary: 'text-primary dark:text-primary-light bg-primary/10',
            green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
            yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
            red: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
            purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
            blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
        }

        return (
            <div className={`bg-white dark:bg-dark-surface rounded-xl border ${highlight ? 'border-primary/50 dark:border-primary-light/50' : 'border-gray-200 dark:border-dark-border'
                } p-5`}>
                <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-display font-semibold text-text dark:text-dark-text">
                        {t('title')}
                    </h2>
                    <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
                        {t('subtitle')}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                >
                    <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
                    {t('refresh')}
                </Button>
            </div>

            {/* Content Velocity Section */}
            <div>
                <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    {t('contentVelocity')}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <MetricCard
                        icon={FileText}
                        label={t('postsPerDay')}
                        value={velocity?.posts_per_day?.toFixed(1) || '0'}
                        subValue={t('last7Days')}
                        color="primary"
                    />
                    <MetricCard
                        icon={Target}
                        label={t('gapsPerWeek')}
                        value={velocity?.gaps_per_week?.toFixed(1) || '0'}
                        color="purple"
                    />
                    <MetricCard
                        icon={Activity}
                        label={t('commentsPerDay')}
                        value={velocity?.comments_per_day?.toFixed(1) || '0'}
                        color="blue"
                    />
                    <MetricCard
                        icon={TrendingUp}
                        label={t('outcomesPerMonth')}
                        value={velocity?.outcomes_per_month?.toFixed(1) || '0'}
                        subValue={t('researchImpact')}
                        color="green"
                    />
                    <MetricCard
                        icon={Clock}
                        label={t('avgResolutionTime')}
                        value={velocity?.avg_gap_resolution_days ? `${velocity.avg_gap_resolution_days}d` : '-'}
                        subValue={t('gapToResolution')}
                        color="yellow"
                    />
                </div>
            </div>

            {/* Research Gaps Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Gap Status Breakdown */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
                    <h3 className="font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-500" />
                        {t('researchGapHealth')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-dark-bg">
                            <p className="text-3xl font-bold text-text dark:text-dark-text">
                                {gapMetrics?.total_gaps || 0}
                            </p>
                            <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
                                {t('totalGaps')}
                            </p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {gapMetrics?.open_gaps || 0}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                {t('openGaps')}
                            </p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                {gapMetrics?.investigating_gaps || 0}
                            </p>
                            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                {t('investigating')}
                            </p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {gapMetrics?.addressed_gaps || 0}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                {t('addressed')}
                            </p>
                        </div>
                    </div>

                    {/* Gap Performance Metrics */}
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary dark:text-primary-light">
                                {gapMetrics?.resolution_rate?.toFixed(0) || 0}%
                            </p>
                            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                                {t('resolutionRate')}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary dark:text-primary-light">
                                {gapMetrics?.claim_success_rate?.toFixed(0) || 0}%
                            </p>
                            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                                {t('claimSuccessRate')}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary dark:text-primary-light">
                                {gapMetrics?.contributions_this_week || 0}
                            </p>
                            <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                                {t('contributionsThisWeek')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Gap Status Pie Chart */}
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
                    <h3 className="font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        {t('gapDistribution')}
                    </h3>
                    {gapStatusData.length > 0 ? (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={gapStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {gapStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-text-muted dark:text-dark-text-muted">
                            {t('noData')}
                        </div>
                    )}
                    <div className="mt-4 space-y-2">
                        {gapStatusData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-text dark:text-dark-text">{item.name}</span>
                                </div>
                                <span className="font-medium text-text dark:text-dark-text">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Moderation Load Section */}
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
                <h3 className="font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    {t('moderationLoad')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className={`text-center p-4 rounded-lg ${(moderation?.pending_queue || 0) > 10
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : 'bg-gray-50 dark:bg-dark-bg'
                        }`}>
                        <p className={`text-3xl font-bold ${(moderation?.pending_queue || 0) > 10
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-text dark:text-dark-text'
                            }`}>
                            {moderation?.pending_queue || 0}
                        </p>
                        <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
                            {t('pendingQueue')}
                        </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {moderation?.reviewed_today || 0}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                            {t('reviewedToday')}
                        </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {moderation?.reviewed_this_week || 0}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            {t('reviewedThisWeek')}
                        </p>
                    </div>
                    <div className={`text-center p-4 rounded-lg ${(moderation?.pending_appeals || 0) > 5
                        ? 'bg-orange-50 dark:bg-orange-900/20'
                        : 'bg-gray-50 dark:bg-dark-bg'
                        }`}>
                        <p className={`text-3xl font-bold ${(moderation?.pending_appeals || 0) > 5
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-text dark:text-dark-text'
                            }`}>
                            {moderation?.pending_appeals || 0}
                        </p>
                        <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
                            {t('pendingAppeals')}
                        </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {moderation?.avg_review_time_hours ? `${moderation.avg_review_time_hours}h` : '-'}
                        </p>
                        <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                            {t('avgReviewTime')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Health Status Summary */}
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-purple-500/10 dark:from-primary/5 dark:via-accent/5 dark:to-purple-500/5 rounded-xl border border-gray-200 dark:border-dark-border p-5">
                <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <h3 className="font-semibold text-text dark:text-dark-text">
                        {t('healthSummary')}
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${(velocity?.posts_per_day || 0) >= 1 ? 'bg-green-500' :
                            (velocity?.posts_per_day || 0) >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                        <span className="text-text dark:text-dark-text">
                            {t('contentCreation')}: {
                                (velocity?.posts_per_day || 0) >= 1 ? t('healthy') :
                                    (velocity?.posts_per_day || 0) >= 0.5 ? t('moderate') : t('low')
                            }
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${(gapMetrics?.resolution_rate || 0) >= 30 ? 'bg-green-500' :
                            (gapMetrics?.resolution_rate || 0) >= 15 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                        <span className="text-text dark:text-dark-text">
                            {t('gapResolution')}: {
                                (gapMetrics?.resolution_rate || 0) >= 30 ? t('healthy') :
                                    (gapMetrics?.resolution_rate || 0) >= 15 ? t('moderate') : t('needsAttention')
                            }
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${(moderation?.pending_queue || 0) <= 5 ? 'bg-green-500' :
                            (moderation?.pending_queue || 0) <= 15 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                        <span className="text-text dark:text-dark-text">
                            {t('moderationBacklog')}: {
                                (moderation?.pending_queue || 0) <= 5 ? t('healthy') :
                                    (moderation?.pending_queue || 0) <= 15 ? t('moderate') : t('needsAttention')
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
