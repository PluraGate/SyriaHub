'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import {
    BarChart3, Eye, ThumbsUp, MessageSquare, Download,
    TrendingUp, TrendingDown, Quote, Shield, Users as UsersIcon,
    Calendar, Award, BookOpen, ArrowUpRight, Activity, HelpCircle,
    Sparkles, PenLine, ArrowRight, Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, ReferenceLine, Legend } from 'recharts'
import { format, subDays } from 'date-fns'
import { useTranslations } from 'next-intl'

interface ResearcherStats {
    totalViews: number
    totalVotes: number
    totalPosts: number
    publications: number
    totalInteractions: number
    totalCitations: number
    totalComments: number
    totalFollowers: number
    avgTrustScore: number
    // Trend data (vs last period)
    viewsTrend: number
    votesTrend: number
    followersTrend: number
    projects: number
}

interface TrendDataPoint {
    date: string
    views: number
    comments: number
    polls: number
    citations: number
    contributions: number
    baseline: number
}

interface TopPost {
    id: string
    title: string
    content_type: string
    view_count: number
    vote_count: number
    created_at: string
}

export default function ResearcherAnalyticsDashboard() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<ResearcherStats | null>(null)
    const [topPosts, setTopPosts] = useState<TopPost[]>([])
    const [viewTrends, setViewTrends] = useState<TrendDataPoint[]>([])
    const [daysBack, setDaysBack] = useState(30)
    const router = useRouter()
    const supabase = useMemo(() => createClient(), [])
    const t = useTranslations('Analytics')

    // Check if this is a zero-state (no activity)
    // We consider it a zero state only if they have no publications (posts, surveys, polls) 
    // AND no meaningful interactions on the platform.
    const isZeroState = stats && (stats.publications || 0) === 0 && (stats.totalInteractions || 0) === 0

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }
            setUser(user)

            // Fetch user's posts for top posts table
            const { data: posts } = await supabase
                .from('posts')
                .select('id, title, content_type, view_count, vote_count, created_at')
                .eq('author_id', user.id)
                .order('view_count', { ascending: false })

            const postList = posts || []
            setTopPosts(postList.slice(0, 5))

            // Fetch citations (posts that reference user's posts)
            const postIds = postList.map(p => p.id)
            let citationCount = 0
            if (postIds.length > 0) {
                const { count } = await supabase
                    .from('citations')
                    .select('*', { count: 'exact', head: true })
                    .in('target_post_id', postIds)
                citationCount = count || 0
            }

            // Fetch followers
            const { count: followerCount } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('following_id', user.id)

            // Fetch average trust score
            let avgTrust = 0
            if (postIds.length > 0) {
                const { data: trustProfiles } = await supabase
                    .from('trust_profiles')
                    .select('t1_source_score, t2_method_score, t3_proximity_score')
                    .in('content_id', postIds)

                if (trustProfiles && trustProfiles.length > 0) {
                    const totalScore = trustProfiles.reduce((sum, tp) =>
                        sum + ((tp.t1_source_score + tp.t2_method_score + tp.t3_proximity_score) / 3), 0)
                    avgTrust = Math.round(totalScore / trustProfiles.length)
                }
            }

            // Fetch REAL analytics data from API
            let analyticsData = {
                totalViews: 0,
                totalVotes: 0,
                totalCitations: 0,
                totalComments: 0,
                totalFollowers: 0,
                publications: 0,
                totalInteractions: 0,
                projects: 0,
                viewsTrend: 0,
                votesTrend: 0,
                followersTrend: 0,
                viewsOverTime: [] as { date: string; views: number; votes?: number }[]
            }

            try {
                const res = await fetch(`/api/analytics/researcher?days=${daysBack}`)
                if (res.ok) {
                    analyticsData = await res.json()
                }
            } catch (err) {
                console.warn('Failed to fetch researcher analytics:', err)
            }

            setStats({
                totalViews: analyticsData.totalViews,
                totalVotes: analyticsData.totalVotes,
                totalPosts: postList.length,
                publications: analyticsData.publications || postList.length,
                totalInteractions: analyticsData.totalInteractions || 0,
                totalCitations: analyticsData.totalCitations || citationCount,
                totalComments: analyticsData.totalComments || 0,
                totalFollowers: analyticsData.totalFollowers || followerCount || 0,
                avgTrustScore: avgTrust,
                viewsTrend: analyticsData.viewsTrend || 0,
                votesTrend: analyticsData.votesTrend || 0,
                followersTrend: analyticsData.followersTrend || 0,
                projects: analyticsData.projects || 0
            })

            // Use REAL trend data from API, or empty array
            const avgDailyViews = analyticsData.totalViews / Math.max(daysBack, 1)
            const trends: TrendDataPoint[] = (analyticsData.viewsOverTime || []).map((item: any) => ({
                date: item.date,
                views: item.views || 0,
                comments: item.comments || 0,
                polls: item.polls || 0,
                citations: item.citations || 0,
                contributions: item.contributions || 0,
                baseline: avgDailyViews
            }))

            // If no data from API, generate placeholder with zeros
            if (trends.length === 0 && postList.length > 0) {
                for (let i = daysBack - 1; i >= 0; i--) {
                    const date = format(subDays(new Date(), i), 'MMM d')
                    trends.push({
                        date,
                        views: 0,
                        comments: 0,
                        polls: 0,
                        citations: 0,
                        contributions: 0,
                        baseline: avgDailyViews
                    })
                }
            }

            setViewTrends(trends)
            setLoading(false)
        }

        loadData()
    }, [supabase, router, daysBack])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-bg">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <main className="flex-1 container-custom py-8 lg:py-12">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10">
                            <BarChart3 className="w-7 h-7 text-primary" />
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-display font-bold text-text dark:text-dark-text">
                            {t('title')}
                        </h1>
                    </div>

                    {/* Time Period Filter */}
                    <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-dark-surface rounded-xl">
                        {[7, 14, 30, 90].map((days) => (
                            <button
                                key={days}
                                onClick={() => setDaysBack(days)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${daysBack === days
                                    ? 'bg-white dark:bg-dark-bg text-primary shadow-sm'
                                    : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                                    }`}
                            >
                                {t('days', { count: days })}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Zero State Banner - Only shows when no activity */}
                {isZeroState && (
                    <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 dark:from-primary/10 dark:via-secondary/10 dark:to-primary/10 border border-primary/20">
                        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                                <Lightbulb className="w-8 h-8 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold text-text dark:text-dark-text mb-1">
                                    {t('zeroState.title')}
                                </h2>
                                <p className="text-sm text-text-light dark:text-dark-text-muted mb-3">
                                    {t('zeroState.description')}
                                </p>
                                <ul className="space-y-1.5 text-sm text-text dark:text-dark-text">
                                    <li className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">1</span>
                                        {t('zeroState.step1')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">2</span>
                                        {t('zeroState.step2')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">3</span>
                                        {t('zeroState.step3')}
                                    </li>
                                </ul>
                            </div>
                            <Link
                                href="/editor"
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
                            >
                                <PenLine className="w-4 h-4" />
                                {t('zeroState.cta')}
                            </Link>
                        </div>
                    </div>
                )}

                {/* Primary Metric (Trust Score) - Visually Dominant */}
                <div className="mb-6">
                    <div className="bg-gradient-to-br from-teal-500/10 via-teal-600/5 to-transparent dark:from-teal-500/20 dark:via-teal-600/10 p-6 rounded-2xl border border-teal-500/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/30 to-teal-600/20">
                                    <Shield className="w-8 h-8 text-teal-500" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-text-light dark:text-dark-text-muted">{t('trustScore')}</span>
                                        <InfoTooltip content={t('tooltips.trustScore')}>
                                            <HelpCircle className="w-3.5 h-3.5 text-text-light/50 dark:text-dark-text-muted/50 cursor-help" />
                                        </InfoTooltip>
                                    </div>
                                    <p className="text-4xl font-bold text-text dark:text-dark-text">
                                        {stats?.avgTrustScore || 0}<span className="text-xl font-normal text-text-light dark:text-dark-text-muted">/100</span>
                                    </p>
                                </div>
                            </div>
                            {stats?.avgTrustScore === 0 && (
                                <p className="text-sm text-text-light dark:text-dark-text-muted italic max-w-xs">
                                    {t('tooltips.trustScore')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Secondary Stats Cards - 5 cards in a row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5 mb-8">
                    <StatCard
                        icon={UsersIcon}
                        label={t('followers')}
                        value={stats?.totalFollowers || 0}
                        trend={stats?.followersTrend}
                        daysBack={daysBack}
                        tooltip={t('tooltips.followers')}
                        gradient="from-pink-500/20 to-pink-600/5"
                        iconColor="text-pink-500"
                        t={t}
                    />
                    <StatCard
                        icon={Quote}
                        label={t('citations')}
                        value={stats?.totalCitations || 0}
                        tooltip={t('tooltips.citations')}
                        gradient="from-orange-500/20 to-orange-600/5"
                        iconColor="text-orange-500"
                        t={t}
                    />
                    <StatCard
                        icon={BookOpen}
                        label={t('publications')}
                        value={stats?.publications || stats?.totalPosts || 0}
                        tooltip={t('tooltips.publications')}
                        gradient="from-purple-500/20 to-purple-600/5"
                        iconColor="text-purple-500"
                        t={t}
                    />
                    <StatCard
                        icon={Activity}
                        label={t('interactions')}
                        value={stats?.totalInteractions || 0}
                        tooltip={t('tooltips.totalComments')}
                        gradient="from-green-500/20 to-green-600/5"
                        iconColor="text-green-500"
                        t={t}
                    />
                    <StatCard
                        icon={Eye}
                        label={t('totalViews')}
                        value={stats?.totalViews || 0}
                        trend={stats?.viewsTrend}
                        daysBack={daysBack}
                        tooltip={t('tooltips.totalViews')}
                        gradient="from-blue-500/20 to-blue-600/5"
                        iconColor="text-blue-500"
                        t={t}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
                    {/* Views Over Time Chart */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-gray-100 dark:border-dark-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-lg font-semibold text-text dark:text-dark-text">
                                    {t('viewsOverTime')}
                                </h2>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="h-72">
                                {isZeroState ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                        <Activity className="w-12 h-12 text-text-light/20 dark:text-dark-text-muted/20 mb-3" />
                                        <p className="text-sm text-text-light dark:text-dark-text-muted">
                                            {t('zeroState.chartEmpty')}
                                        </p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={viewTrends}>
                                            <defs>
                                                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4A90A4" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#4A90A4" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                                tickLine={false}
                                                axisLine={false}
                                                interval="preserveStartEnd"
                                            />
                                            <YAxis
                                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                                tickLine={false}
                                                axisLine={false}
                                                width={35}
                                            />
                                            <ChartTooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '8px 12px',
                                                }}
                                                labelStyle={{ color: '#9CA3AF', marginBottom: '4px', fontSize: '12px' }}
                                                itemStyle={{ color: '#4A90A4', fontSize: '14px', fontWeight: 500 }}
                                            />
                                            {/* Ghost baseline reference line */}
                                            <ReferenceLine
                                                y={viewTrends[0]?.baseline || 0}
                                                stroke="#9CA3AF"
                                                strokeDasharray="5 5"
                                                strokeOpacity={0.5}
                                                label={{
                                                    value: t('zeroState.expectedLine'),
                                                    position: 'insideTopRight',
                                                    fill: '#9CA3AF',
                                                    fontSize: 10
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="views"
                                                stroke="#4A90A4"
                                                strokeWidth={2}
                                                fill="url(#viewsGradient)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Engagement Trend Chart */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-gray-100 dark:border-dark-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-secondary/10">
                                    <Activity className="w-5 h-5 text-secondary" />
                                </div>
                                <h2 className="text-lg font-semibold text-text dark:text-dark-text">
                                    {t('engagementTrend')}
                                </h2>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="h-72">
                                {isZeroState ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                        <Activity className="w-12 h-12 text-text-light/20 dark:text-dark-text-muted/20 mb-3" />
                                        <p className="text-sm text-text-light dark:text-dark-text-muted">
                                            {t('zeroState.chartEmpty')}
                                        </p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={viewTrends}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                                tickLine={false}
                                                axisLine={false}
                                                interval="preserveStartEnd"
                                            />
                                            <YAxis
                                                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                                                tickLine={false}
                                                axisLine={false}
                                                width={35}
                                            />
                                            <ChartTooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '8px 12px',
                                                }}
                                                labelStyle={{ color: '#9CA3AF', marginBottom: '4px', fontSize: '12px' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="comments"
                                                name="Comments"
                                                stroke="#22C55E"
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{ r: 4, fill: '#22C55E', strokeWidth: 0 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="polls"
                                                name="Poll Responses"
                                                stroke="#8B5CF6"
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="citations"
                                                name="Citations"
                                                stroke="#F59E0B"
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="contributions"
                                                name="Contributions"
                                                stroke="#EC4899"
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{ r: 4, fill: '#EC4899', strokeWidth: 0 }}
                                            />
                                            <Legend
                                                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                                                iconType="line"
                                                iconSize={10}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Performing Research Table */}
                <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <Award className="w-5 h-5 text-amber-500" />
                            </div>
                            <h2 className="text-lg font-semibold text-text dark:text-dark-text">
                                {t('topPerformingResearch')}
                            </h2>
                        </div>
                        {topPosts.length > 0 && (
                            <Link
                                href="/feed"
                                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                {t('viewAll')}
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-dark-border">
                        {topPosts.length > 0 ? (
                            topPosts.map((post, index) => (
                                <div
                                    key={post.id}
                                    className="p-4 sm:p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors group"
                                >
                                    {/* Rank Badge */}
                                    <div className={`
                                        w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                                        ${index === 0
                                            ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white'
                                            : index === 1
                                                ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700'
                                                : index === 2
                                                    ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-orange-800'
                                                    : 'bg-gray-100 dark:bg-dark-bg text-text-light dark:text-dark-text-muted'
                                        }
                                    `}>
                                        {index + 1}
                                    </div>

                                    {/* Post Info */}
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/post/${post.id}`}>
                                            <h3 className="font-medium text-text dark:text-dark-text truncate group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 text-xs rounded-md bg-primary/10 text-primary font-medium">
                                                {post.content_type}
                                            </span>
                                            <span className="text-xs text-text-light dark:text-dark-text-muted">
                                                {format(new Date(post.created_at), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 sm:gap-6 text-sm">
                                        <div className="flex items-center gap-1.5 text-text-light dark:text-dark-text-muted">
                                            <Eye className="w-4 h-4" />
                                            <span className="font-medium">{post.view_count || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-text-light dark:text-dark-text-muted">
                                            <ThumbsUp className="w-4 h-4" />
                                            <span className="font-medium">{post.vote_count || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <BookOpen className="w-12 h-12 text-text-light/30 dark:text-dark-text-muted/30 mx-auto mb-3" />
                                <p className="text-text-light dark:text-dark-text-muted mb-4">
                                    {t('noPublications')}
                                </p>
                                <Link
                                    href="/editor"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                >
                                    <PenLine className="w-4 h-4" />
                                    {t('startWriting')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

// Tooltip Component
function InfoTooltip({ children, content }: { children: React.ReactNode; content: string }) {
    const [show, setShow] = useState(false)

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
            >
                {children}
            </div>
            {show && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg z-50 w-64 text-center">
                    {content}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
                </div>
            )}
        </div>
    )
}

// Stat Card Component
interface StatCardProps {
    icon: typeof Eye
    label: string
    value: number
    suffix?: string
    trend?: number
    daysBack?: number
    tooltip: string
    gradient: string
    iconColor: string
    t: any
}

function StatCard({ icon: Icon, label, value, suffix = '', trend, daysBack = 30, tooltip, gradient, iconColor, t }: StatCardProps) {
    const hasTrend = trend !== undefined && trend !== 0
    const isPositive = (trend || 0) > 0

    return (
        <div className="group bg-white dark:bg-dark-surface p-4 rounded-2xl border border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-border-hover transition-all hover:shadow-md">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <InfoTooltip content={tooltip}>
                    <HelpCircle className="w-3.5 h-3.5 text-text-light/40 dark:text-dark-text-muted/40 cursor-help hover:text-text-light dark:hover:text-dark-text-muted transition-colors" />
                </InfoTooltip>
            </div>
            <p className="text-2xl font-bold text-text dark:text-dark-text tracking-tight">
                {value.toLocaleString()}{suffix}
            </p>
            <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-text-light dark:text-dark-text-muted">{label}</span>
                {hasTrend && (
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPositive ? t('trends.up', { percent: trend }) : t('trends.down', { percent: trend })}
                    </span>
                )}
            </div>
        </div>
    )
}
