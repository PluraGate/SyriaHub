'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, MessageSquare, Clock, ChevronRight, Sparkles } from 'lucide-react'
import { useDateFormatter } from '@/hooks/useDateFormatter'

interface TrendingPost {
    id: string
    title: string
    author_name: string
    author_id: string
    created_at: string
    vote_count: number
    comment_count: number
    tags: string[]
    hot_score: number
}

type TimeRange = '24h' | '7d' | '30d'

export function TrendingPosts() {
    const t = useTranslations('Trending')
    const { formatDate } = useDateFormatter()
    const [posts, setPosts] = useState<TrendingPost[]>([])
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState<TimeRange>('24h')

    useEffect(() => {
        async function fetchTrending() {
            setLoading(true)
            const supabase = createClient()

            // Calculate date threshold based on time range
            const now = new Date()
            let since: Date
            switch (timeRange) {
                case '24h':
                    since = new Date(now.getTime() - 24 * 60 * 60 * 1000)
                    break
                case '7d':
                    since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                    break
                case '30d':
                    since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    break
            }

            // Fetch posts with engagement data
            const { data, error } = await supabase
                .from('posts')
                .select(`
          id,
          title,
          created_at,
          vote_count,
          tags,
          content_type,
          metadata,
          author:users!posts_author_id_fkey(id, name, email)
        `)
                .eq('status', 'published')
                .neq('approval_status', 'rejected')
                .gte('created_at', since.toISOString())
                .order('vote_count', { ascending: false, nullsFirst: false })
                .limit(20) // Fetch more to allow filtering

            if (!error && data) {
                // Filter out past events (events whose start_time has passed)
                const filteredData = data.filter(post => {
                    if (post.content_type === 'event' && post.metadata?.start_time) {
                        const eventDate = new Date(post.metadata.start_time)
                        return eventDate >= now // Only include future events
                    }
                    return true // Include all non-event posts
                })

                // Calculate hot score and transform data
                const postsWithScore = filteredData.map(post => {
                    const createdAt = new Date(post.created_at)
                    const ageHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
                    const gravity = 1.8
                    const hotScore = (post.vote_count || 0) / Math.pow(Math.max(ageHours, 1) + 2, gravity)

                    return {
                        id: post.id,
                        title: post.title,
                        author_name: (post.author as any)?.name || (post.author as any)?.email?.split('@')[0] || 'Anonymous',
                        author_id: (post.author as any)?.id,
                        created_at: post.created_at,
                        vote_count: post.vote_count || 0,
                        comment_count: 0, // Would need separate query
                        tags: post.tags || [],
                        hot_score: hotScore,
                    }
                })

                // Sort by hot score
                postsWithScore.sort((a, b) => b.hot_score - a.hot_score)
                setPosts(postsWithScore.slice(0, 5))
            }

            setLoading(false)
        }

        fetchTrending()
    }, [timeRange])

    const timeRangeOptions: { value: TimeRange; label: string }[] = [
        { value: '24h', label: '24h' },
        { value: '7d', label: t('week') },
        { value: '30d', label: t('month') },
    ]

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-text dark:text-dark-text truncate">{t('title')}</h3>
                </div>

                {/* Time Range Selector */}
                <div className="flex gap-1 p-0.5 bg-gray-100 dark:bg-dark-bg rounded-lg flex-shrink-0">
                    {timeRangeOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setTimeRange(option.value)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${timeRange === option.value
                                ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                                : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts List */}
            <div className="divide-y divide-gray-100 dark:divide-dark-border">
                {loading ? (
                    // Skeleton
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="p-4 flex gap-4 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-border flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-3/4" />
                                <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-1/2" />
                            </div>
                        </div>
                    ))
                ) : posts.length === 0 ? (
                    <div className="p-6 text-center">
                        <Sparkles className="w-8 h-8 text-text-light dark:text-dark-text-muted mx-auto mb-2" />
                        <p className="text-sm text-text-light dark:text-dark-text-muted">
                            {t('noTrending')}
                        </p>
                    </div>
                ) : (
                    posts.map((post, index) => (
                        <Link
                            key={post.id}
                            href={`/post/${post.id}`}
                            className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors group"
                        >
                            {/* Rank Number */}
                            <span className={`w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-sm rounded-md ${index === 0
                                ? 'bg-primary/10 text-primary dark:bg-white/8 dark:text-white/50'
                                : 'text-text-light dark:text-dark-text-muted'
                                }`}>
                                {index + 1}
                            </span>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-text dark:text-dark-text group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-2 text-sm">
                                    {post.title}
                                </h4>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-text-light dark:text-dark-text-muted">
                                    <span>{post.author_name}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        {post.vote_count}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(post.created_at, 'distance')}
                                    </span>
                                </div>
                            </div>

                            <ChevronRight className="w-4 h-4 text-text-light dark:text-dark-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-center" />
                        </Link>
                    ))
                )}
            </div>

            {/* View All Link */}
            {posts.length > 0 && (
                <Link
                    href="/feed?sort=hot"
                    className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-primary dark:text-secondary hover:bg-primary/5 dark:hover:bg-secondary/5 transition-colors border-t border-gray-100 dark:border-dark-border"
                >
                    {t('viewAll')}
                    <ChevronRight className="w-4 h-4" />
                </Link>
            )}
        </div>
    )
}
