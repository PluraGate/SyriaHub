'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import {
    BarChart3, Eye, ThumbsUp, MessageSquare, Download,
    TrendingUp, TrendingDown, Quote, Shield, Users as UsersIcon,
    Calendar, Award, BookOpen, ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { format, subDays } from 'date-fns'
import { useTranslations } from 'next-intl'

interface ResearcherStats {
    totalViews: number
    totalVotes: number
    totalPosts: number
    totalCitations: number
    totalFollowers: number
    avgTrustScore: number
}

interface TrendDataPoint {
    date: string
    views: number
    votes: number
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

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }
            setUser(user)

            // Fetch user's posts
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
                    .from('content_relationships')
                    .select('*', { count: 'exact', head: true })
                    .in('target_id', postIds)
                    .eq('relationship', 'supports')
                citationCount = count || 0
            }

            // Fetch followers
            const { count: followerCount } = await supabase
                .from('user_follows')
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

            // Calculate stats
            const totalViews = postList.reduce((sum, p) => sum + (p.view_count || 0), 0)
            const totalVotes = postList.reduce((sum, p) => sum + (p.vote_count || 0), 0)

            setStats({
                totalViews,
                totalVotes,
                totalPosts: postList.length,
                totalCitations: citationCount,
                totalFollowers: followerCount || 0,
                avgTrustScore: avgTrust
            })

            // Generate mock trend data (would be real data from analytics table in production)
            const trends: TrendDataPoint[] = []
            for (let i = daysBack - 1; i >= 0; i--) {
                const date = format(subDays(new Date(), i), 'MMM d')
                trends.push({
                    date,
                    views: Math.floor(Math.random() * (totalViews / daysBack) * 2),
                    votes: Math.floor(Math.random() * (totalVotes / daysBack) * 3)
                })
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

            <main className="flex-1 container-custom py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text flex items-center gap-3">
                        <BarChart3 className="w-8 h-8" />
                        {t('title')}
                    </h1>
                    <div className="flex items-center gap-2">
                        {[90, 30, 14, 7].map((days) => (
                            <button
                                key={days}
                                onClick={() => setDaysBack(days)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${daysBack === days
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 dark:bg-dark-surface text-text-light dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border'
                                    }`}
                            >
                                {t('days', { count: days })}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <StatCard icon={Shield} label={t('trustScore')} value={stats?.avgTrustScore || 0} suffix="/100" color="teal" />
                    <StatCard icon={UsersIcon} label={t('followers')} value={stats?.totalFollowers || 0} color="pink" />
                    <StatCard icon={Quote} label={t('citations')} value={stats?.totalCitations || 0} color="orange" />
                    <StatCard icon={BookOpen} label={t('publications')} value={stats?.totalPosts || 0} color="purple" />
                    <StatCard icon={ThumbsUp} label={t('totalVotes')} value={stats?.totalVotes || 0} color="green" />
                    <StatCard icon={Eye} label={t('totalViews')} value={stats?.totalViews || 0} color="blue" />
                </div>

                {/* Trends Chart */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <h2 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            {t('viewsOverTime')}
                        </h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={viewTrends}>
                                    <defs>
                                        <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4A90A4" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4A90A4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="views" stroke="#4A90A4" fill="url(#viewsGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <h2 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-secondary" />
                            {t('engagementTrend')}
                        </h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={viewTrends}>
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="votes" stroke="#7B9E89" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Top Content */}
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                        <h2 className="text-xl font-bold text-text dark:text-dark-text">{t('topPerformingResearch')}</h2>
                        <Link href="/feed" className="text-sm text-primary hover:underline flex items-center gap-1">
                            {t('viewAll')} <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-dark-border">
                        {topPosts.length > 0 ? (
                            topPosts.map((post, index) => (
                                <div key={post.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/post/${post.id}`}>
                                            <h3 className="font-medium text-text dark:text-dark-text truncate hover:text-primary transition-colors">
                                                {post.title}
                                            </h3>
                                        </Link>
                                        <p className="text-xs text-text-light dark:text-dark-text-muted">
                                            {post.content_type} • {format(new Date(post.created_at), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-text-light dark:text-dark-text-muted">
                                        <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {post.view_count || 0}</span>
                                        <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> {post.vote_count || 0}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-text-light dark:text-dark-text-muted">
                                {t('noPublications')} <Link href="/editor" className="text-primary hover:underline">{t('startWriting')}</Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

function StatCard({ icon: Icon, label, value, suffix = '', color }: {
    icon: typeof Eye
    label: string
    value: number
    suffix?: string
    color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal'
}) {
    const colorClasses = {
        blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
        green: 'text-green-500 bg-green-50 dark:bg-green-900/20',
        purple: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
        orange: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
        pink: 'text-pink-500 bg-pink-50 dark:bg-pink-900/20',
        teal: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
    }

    return (
        <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-200 dark:border-dark-border">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-text dark:text-dark-text">
                {value.toLocaleString()}{suffix}
            </p>
            <p className="text-xs text-text-light dark:text-dark-text-muted">{label}</p>
        </div>
    )
}
