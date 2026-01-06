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
    Zap,
    BarChart3,
    Loader2,
    RefreshCw,
    MessageSquare,
    Timer,
    Users
} from 'lucide-react'
import {
    Tooltip,
    ResponsiveContainer,
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

const COLORS = {
    blue: '#3B82F6',
    emerald: '#10B981',
    amber: '#F59E0B',
    violet: '#8B5CF6'
}

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
        { name: t('gapStatus.open'), value: gapMetrics.open_gaps, color: COLORS.blue },
        { name: t('gapStatus.investigating'), value: gapMetrics.investigating_gaps, color: COLORS.amber },
        { name: t('gapStatus.addressed'), value: gapMetrics.addressed_gaps, color: COLORS.emerald }
    ].filter(d => d.value > 0) : []

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary/60 mx-auto" />
                    <p className="text-sm text-text-light dark:text-dark-text-muted mt-3">
                        Loading platform health...
                    </p>
                </div>
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
                        {t('subtitle')}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                    className="self-start sm:self-auto"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {t('refresh')}
                </Button>
            </header>

            {/* Content Velocity Section */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-border">
                        <Zap className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                    </div>
                    <h2 className="text-lg font-semibold text-text dark:text-dark-text">
                        {t('contentVelocity')}
                    </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <VelocityCard
                        icon={FileText}
                        label={t('postsPerDay')}
                        value={velocity?.posts_per_day?.toFixed(1) || '0'}
                        subtitle={t('last7Days')}
                        accentColor="blue"
                    />
                    <VelocityCard
                        icon={Target}
                        label={t('gapsPerWeek')}
                        value={velocity?.gaps_per_week?.toFixed(1) || '0'}
                        accentColor="violet"
                    />
                    <VelocityCard
                        icon={MessageSquare}
                        label={t('commentsPerDay')}
                        value={velocity?.comments_per_day?.toFixed(1) || '0'}
                        accentColor="cyan"
                    />
                    <VelocityCard
                        icon={TrendingUp}
                        label={t('outcomesPerMonth')}
                        value={velocity?.outcomes_per_month?.toFixed(1) || '0'}
                        subtitle={t('researchImpact')}
                        accentColor="emerald"
                    />
                    <VelocityCard
                        icon={Timer}
                        label={t('avgResolutionTime')}
                        value={velocity?.avg_gap_resolution_days ? `${velocity.avg_gap_resolution_days}d` : '-'}
                        subtitle={t('gapToResolution')}
                        accentColor="amber"
                    />
                </div>
            </section>

            {/* Research Gaps Section */}
            <section className="grid gap-6 lg:grid-cols-3">
                {/* Gap Status Breakdown */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-border">
                            <Target className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                        </div>
                        <h3 className="font-semibold text-text dark:text-dark-text">
                            {t('researchGapHealth')}
                        </h3>
                    </div>
                    
                    {/* Gap Status Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <GapStatusCard
                            value={gapMetrics?.total_gaps || 0}
                            label={t('totalGaps')}
                            variant="neutral"
                        />
                        <GapStatusCard
                            value={gapMetrics?.open_gaps || 0}
                            label={t('openGaps')}
                            variant="blue"
                        />
                        <GapStatusCard
                            value={gapMetrics?.investigating_gaps || 0}
                            label={t('investigating')}
                            variant="amber"
                        />
                        <GapStatusCard
                            value={gapMetrics?.addressed_gaps || 0}
                            label={t('addressed')}
                            variant="emerald"
                        />
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-4 pt-5 border-t border-gray-100 dark:border-dark-border">
                        <PerformanceMetric
                            value={`${gapMetrics?.resolution_rate?.toFixed(0) || 0}%`}
                            label={t('resolutionRate')}
                        />
                        <PerformanceMetric
                            value={`${gapMetrics?.claim_success_rate?.toFixed(0) || 0}%`}
                            label={t('claimSuccessRate')}
                        />
                        <PerformanceMetric
                            value={gapMetrics?.contributions_this_week || 0}
                            label={t('contributionsThisWeek')}
                        />
                    </div>
                </div>

                {/* Gap Status Pie Chart */}
                <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-border">
                            <BarChart3 className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                        </div>
                        <h3 className="font-semibold text-text dark:text-dark-text">
                            {t('gapDistribution')}
                        </h3>
                    </div>
                    {gapStatusData.length > 0 ? (
                        <>
                            <div className="h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={gapStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={45}
                                            outerRadius={70}
                                            paddingAngle={3}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {gapStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                borderRadius: '12px', 
                                                border: 'none',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }} 
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2.5 mt-4">
                                {gapStatusData.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2.5">
                                            <span 
                                                className="w-2.5 h-2.5 rounded-full" 
                                                style={{ backgroundColor: item.color }} 
                                            />
                                            <span className="text-text-light dark:text-dark-text-muted">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="font-semibold text-text dark:text-dark-text tabular-nums">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-48 flex items-center justify-center">
                            <div className="text-center">
                                <BarChart3 className="w-10 h-10 mx-auto text-gray-200 dark:text-dark-border mb-2" />
                                <p className="text-sm text-text-light dark:text-dark-text-muted">
                                    {t('noData')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Moderation Load Section */}
            <section className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-border">
                        <AlertCircle className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                    </div>
                    <h3 className="font-semibold text-text dark:text-dark-text">
                        {t('moderationLoad')}
                    </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <ModerationMetricCard
                        value={moderation?.pending_queue || 0}
                        label={t('pendingQueue')}
                        isAlert={(moderation?.pending_queue || 0) > 10}
                        variant="default"
                    />
                    <ModerationMetricCard
                        value={moderation?.reviewed_today || 0}
                        label={t('reviewedToday')}
                        variant="emerald"
                    />
                    <ModerationMetricCard
                        value={moderation?.reviewed_this_week || 0}
                        label={t('reviewedThisWeek')}
                        variant="blue"
                    />
                    <ModerationMetricCard
                        value={moderation?.pending_appeals || 0}
                        label={t('pendingAppeals')}
                        isAlert={(moderation?.pending_appeals || 0) > 5}
                        variant="default"
                    />
                    <ModerationMetricCard
                        value={moderation?.avg_review_time_hours ? `${moderation.avg_review_time_hours}h` : '-'}
                        label={t('avgReviewTime')}
                        variant="violet"
                    />
                </div>
            </section>

            {/* Health Status Summary */}
            <section className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-border">
                        <CheckCircle2 className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                    </div>
                    <h3 className="font-semibold text-text dark:text-dark-text">
                        {t('healthSummary')}
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <HealthIndicator
                        label={t('contentCreation')}
                        status={
                            (velocity?.posts_per_day || 0) >= 1 ? 'healthy' :
                            (velocity?.posts_per_day || 0) >= 0.5 ? 'moderate' : 'low'
                        }
                        statusLabel={
                            (velocity?.posts_per_day || 0) >= 1 ? t('healthy') :
                            (velocity?.posts_per_day || 0) >= 0.5 ? t('moderate') : t('low')
                        }
                    />
                    <HealthIndicator
                        label={t('gapResolution')}
                        status={
                            (gapMetrics?.resolution_rate || 0) >= 30 ? 'healthy' :
                            (gapMetrics?.resolution_rate || 0) >= 15 ? 'moderate' : 'low'
                        }
                        statusLabel={
                            (gapMetrics?.resolution_rate || 0) >= 30 ? t('healthy') :
                            (gapMetrics?.resolution_rate || 0) >= 15 ? t('moderate') : t('needsAttention')
                        }
                    />
                    <HealthIndicator
                        label={t('moderationBacklog')}
                        status={
                            (moderation?.pending_queue || 0) <= 5 ? 'healthy' :
                            (moderation?.pending_queue || 0) <= 15 ? 'moderate' : 'low'
                        }
                        statusLabel={
                            (moderation?.pending_queue || 0) <= 5 ? t('healthy') :
                            (moderation?.pending_queue || 0) <= 15 ? t('moderate') : t('needsAttention')
                        }
                    />
                </div>
            </section>
        </div>
    )
}

// Velocity Card Component
function VelocityCard({
    icon: Icon,
    label,
    value,
    subtitle,
    accentColor
}: {
    icon: typeof Activity
    label: string
    value: string | number
    subtitle?: string
    accentColor: 'blue' | 'violet' | 'cyan' | 'emerald' | 'amber'
}) {
    const borderColors = {
        blue: 'border-l-blue-500',
        violet: 'border-l-violet-500',
        cyan: 'border-l-cyan-500',
        emerald: 'border-l-emerald-500',
        amber: 'border-l-amber-500'
    }

    const iconColors = {
        blue: 'text-blue-600 dark:text-blue-400',
        violet: 'text-violet-600 dark:text-violet-400',
        cyan: 'text-cyan-600 dark:text-cyan-400',
        emerald: 'text-emerald-600 dark:text-emerald-400',
        amber: 'text-amber-600 dark:text-amber-400'
    }

    return (
        <div className={`bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border border-l-4 ${borderColors[accentColor]} p-5 shadow-sm`}>
            <div className={`p-2 rounded-lg bg-gray-50 dark:bg-dark-border w-fit ${iconColors[accentColor]}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="mt-4">
                <p className="text-2xl font-display font-bold text-text dark:text-dark-text tabular-nums">
                    {value}
                </p>
                <p className="text-sm text-text-light dark:text-dark-text-muted mt-1 font-medium">
                    {label}
                </p>
                {subtitle && (
                    <p className="text-xs text-text-light/70 dark:text-dark-text-muted/70 mt-0.5">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    )
}

// Gap Status Card Component
function GapStatusCard({
    value,
    label,
    variant
}: {
    value: number
    label: string
    variant: 'neutral' | 'blue' | 'amber' | 'emerald'
}) {
    const colors = {
        neutral: {
            border: 'border-gray-200 dark:border-dark-border',
            text: 'text-text dark:text-dark-text',
            label: 'text-text-light dark:text-dark-text-muted'
        },
        blue: {
            border: 'border-blue-500/50',
            text: 'text-blue-600 dark:text-blue-400',
            label: 'text-text-light dark:text-dark-text-muted'
        },
        amber: {
            border: 'border-amber-500/50',
            text: 'text-amber-600 dark:text-amber-400',
            label: 'text-text-light dark:text-dark-text-muted'
        },
        emerald: {
            border: 'border-emerald-500/50',
            text: 'text-emerald-600 dark:text-emerald-400',
            label: 'text-text-light dark:text-dark-text-muted'
        }
    }

    const style = colors[variant]

    return (
        <div className={`bg-white dark:bg-dark-surface rounded-xl border ${style.border} p-4 text-center`}>
            <p className={`text-2xl font-bold ${style.text} tabular-nums`}>
                {value}
            </p>
            <p className={`text-xs ${style.label} mt-1 font-medium`}>
                {label}
            </p>
        </div>
    )
}

// Performance Metric Component
function PerformanceMetric({
    value,
    label
}: {
    value: string | number
    label: string
}) {
    return (
        <div className="text-center">
            <p className="text-xl font-bold text-primary dark:text-primary-light tabular-nums">
                {value}
            </p>
            <p className="text-xs text-text-light dark:text-dark-text-muted mt-1">
                {label}
            </p>
        </div>
    )
}

// Moderation Metric Card Component
function ModerationMetricCard({
    value,
    label,
    variant,
    isAlert = false
}: {
    value: string | number
    label: string
    variant: 'default' | 'emerald' | 'blue' | 'violet'
    isAlert?: boolean
}) {
    const colors = {
        default: {
            border: isAlert ? 'border-red-500/50' : 'border-gray-200 dark:border-dark-border',
            text: isAlert ? 'text-red-600 dark:text-red-400' : 'text-text dark:text-dark-text',
            label: 'text-text-light dark:text-dark-text-muted'
        },
        emerald: {
            border: 'border-emerald-500/50',
            text: 'text-emerald-600 dark:text-emerald-400',
            label: 'text-text-light dark:text-dark-text-muted'
        },
        blue: {
            border: 'border-blue-500/50',
            text: 'text-blue-600 dark:text-blue-400',
            label: 'text-text-light dark:text-dark-text-muted'
        },
        violet: {
            border: 'border-violet-500/50',
            text: 'text-violet-600 dark:text-violet-400',
            label: 'text-text-light dark:text-dark-text-muted'
        }
    }

    const style = colors[variant]

    return (
        <div className={`bg-white dark:bg-dark-surface rounded-xl border ${style.border} p-4 text-center`}>
            <p className={`text-2xl font-bold ${style.text} tabular-nums`}>
                {value}
            </p>
            <p className={`text-xs ${style.label} mt-1 font-medium`}>
                {label}
            </p>
        </div>
    )
}

// Health Indicator Component
function HealthIndicator({
    label,
    status,
    statusLabel
}: {
    label: string
    status: 'healthy' | 'moderate' | 'low'
    statusLabel: string
}) {
    const statusColors = {
        healthy: 'bg-emerald-500',
        moderate: 'bg-amber-500',
        low: 'bg-red-500'
    }

    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
            <span className={`w-2.5 h-2.5 rounded-full ${statusColors[status]}`} />
            <div className="flex-1">
                <p className="text-sm font-medium text-text dark:text-dark-text">
                    {label}
                </p>
                <p className="text-xs text-text-light dark:text-dark-text-muted">
                    {statusLabel}
                </p>
            </div>
        </div>
    )
}
