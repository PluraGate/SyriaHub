'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
    FileText,
    MessageSquare,
    Award,
    UserPlus,
    Quote,
    Star,
    Users,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useDateFormatter } from '@/hooks/useDateFormatter'

type ActivityType = 'post' | 'comment' | 'badge' | 'follow' | 'citation' | 'vote' | 'group_join'

interface ActivityItem {
    id: string
    type: ActivityType
    user: {
        id: string
        name: string
        email: string
        avatar_url?: string
    }
    target?: {
        id: string
        title?: string
        name?: string
    }
    created_at: string
    metadata?: Record<string, any>
}

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
    post: FileText,
    comment: MessageSquare,
    badge: Award,
    follow: UserPlus,
    citation: Quote,
    vote: Star,
    group_join: Users,
}

const ACTIVITY_COLORS: Record<ActivityType, string> = {
    post: 'bg-gray-100 text-gray-600 dark:bg-dark-surface dark:text-dark-text-muted',
    comment: 'bg-gray-100 text-gray-600 dark:bg-dark-surface dark:text-dark-text-muted',
    badge: 'bg-gray-100 text-gray-600 dark:bg-dark-surface dark:text-dark-text-muted',
    follow: 'bg-gray-100 text-gray-600 dark:bg-dark-surface dark:text-dark-text-muted',
    citation: 'bg-gray-100 text-gray-600 dark:bg-dark-surface dark:text-dark-text-muted',
    vote: 'bg-gray-100 text-gray-600 dark:bg-dark-surface dark:text-dark-text-muted',
    group_join: 'bg-gray-100 text-gray-600 dark:bg-dark-surface dark:text-dark-text-muted',
}

function ActivityItemComponent({ activity, t, formatDate }: { activity: ActivityItem; t: any; formatDate: (date: Date | string | number, formatType?: 'short' | 'medium' | 'long' | 'relative' | 'distance') => string }) {
    const Icon = ACTIVITY_ICONS[activity.type]
    const colorClass = ACTIVITY_COLORS[activity.type]

    const userName = (
        <Link
            href={`/profile/${activity.user.id}`}
            className="font-medium text-text dark:text-dark-text hover:text-primary dark:hover:text-accent-light"
        >
            {activity.user.name}
        </Link>
    )

    const getActivityMessage = (): React.ReactNode => {
        switch (activity.type) {
            case 'post':
                return (
                    <>
                        {userName} {t('published')}{' '}
                        <Link
                            href={`/post/${activity.target?.id}`}
                            className="font-medium text-primary dark:text-accent-light hover:underline"
                        >
                            {activity.target?.title || t('aNewPost')}
                        </Link>
                    </>
                )
            case 'comment':
                return (
                    <>
                        {userName} {t('commentedOn')}{' '}
                        <Link
                            href={`/post/${activity.target?.id}`}
                            className="font-medium text-primary dark:text-accent-light hover:underline"
                        >
                            {activity.target?.title || t('aPost')}
                        </Link>
                    </>
                )
            case 'badge':
                return (
                    <>
                        {userName} {t('earnedBadge')}{' '}
                        <span className="font-medium text-yellow-600 dark:text-yellow-400">
                            {activity.metadata?.badge_name || 'badge'}
                        </span>
                    </>
                )
            case 'follow':
                return (
                    <>
                        {userName} {t('startedFollowing')}{' '}
                        <Link
                            href={`/profile/${activity.target?.id}`}
                            className="font-medium text-primary dark:text-accent-light hover:underline"
                        >
                            {activity.target?.name || t('aResearcher')}
                        </Link>
                    </>
                )
            case 'citation':
                return (
                    <>
                        {userName} {t('cited')}{' '}
                        <Link
                            href={`/post/${activity.target?.id}`}
                            className="font-medium text-primary dark:text-accent-light hover:underline"
                        >
                            {activity.target?.title || t('research')}
                        </Link>
                    </>
                )
            case 'vote':
                return (
                    <>
                        {userName} {t('upvoted')}{' '}
                        <Link
                            href={`/post/${activity.target?.id}`}
                            className="font-medium text-primary dark:text-accent-light hover:underline"
                        >
                            {activity.target?.title || t('aPost')}
                        </Link>
                    </>
                )
            case 'group_join':
                return (
                    <>
                        {userName} {t('joined')}{' '}
                        <Link
                            href={`/groups/${activity.target?.id}`}
                            className="font-medium text-primary dark:text-accent-light hover:underline"
                        >
                            {activity.target?.name || t('aGroup')}
                        </Link>
                    </>
                )
            default:
                return <>{userName} {t('wasActive')}</>
        }
    }

    return (
        <div className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors rounded-lg animate-fade-in-up">
            <UserAvatar
                name={activity.user.name}
                email={activity.user.email}
                avatarUrl={activity.user.avatar_url}
                size="sm"
            />
            <div className="flex-1 min-w-0">
                <p className="text-sm text-text-light dark:text-dark-text-muted">
                    {getActivityMessage()}
                </p>
                <p className="text-xs text-text-light/70 dark:text-dark-text-muted/70 mt-1">
                    {formatDate(activity.created_at, 'distance')}
                </p>
            </div>
            <div className={`p-2 rounded-full ${colorClass}`}>
                <Icon className="w-4 h-4" />
            </div>
        </div>
    )
}

export function ActivityFeed({ limit = 10 }: { limit?: number }) {
    const t = useTranslations('Homepage')
    const { formatDate } = useDateFormatter()
    const [activities, setActivities] = useState<ActivityItem[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const loadActivities = async () => {
            try {
                // Fetch recent posts as activity
                const { data: posts } = await supabase
                    .from('posts')
                    .select(`
            id,
            title,
            created_at,
            author:users!posts_author_id_fkey(id, name, email, avatar_url)
          `)
                    .eq('status', 'published')
                    .neq('approval_status', 'rejected')
                    .order('created_at', { ascending: false })
                    .limit(limit)

                // Fetch recent comments as activity
                const { data: comments } = await supabase
                    .from('comments')
                    .select(`
            id,
            created_at,
            post:posts(id, title),
            user:users(id, name, email, avatar_url)
          `)
                    .order('created_at', { ascending: false })
                    .limit(limit)

                // Combine and format activities
                const postActivities: ActivityItem[] = (posts || []).map((post: any) => ({
                    id: `post-${post.id}`,
                    type: 'post' as ActivityType,
                    user: {
                        id: post.author?.id || '',
                        name: post.author?.name || 'Anonymous',
                        email: post.author?.email || '',
                        avatar_url: post.author?.avatar_url,
                    },
                    target: {
                        id: post.id,
                        title: post.title,
                    },
                    created_at: post.created_at,
                }))

                const commentActivities: ActivityItem[] = (comments || []).map((comment: any) => ({
                    id: `comment-${comment.id}`,
                    type: 'comment' as ActivityType,
                    user: {
                        id: comment.user?.id || '',
                        name: comment.user?.name || 'Anonymous',
                        email: comment.user?.email || '',
                        avatar_url: comment.user?.avatar_url,
                    },
                    target: {
                        id: comment.post?.id || '',
                        title: comment.post?.title || '',
                    },
                    created_at: comment.created_at,
                }))

                // Merge, sort by date, and limit
                const allActivities = [...postActivities, ...commentActivities]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, limit)

                setActivities(allActivities)
            } catch (error) {
                console.error('Error loading activities:', error)
            } finally {
                setLoading(false)
            }
        }

        loadActivities()

        // Subscribe to real-time updates
        const postsChannel = supabase
            .channel('activity-posts')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'posts' },
                () => loadActivities()
            )
            .subscribe()

        const commentsChannel = supabase
            .channel('activity-comments')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'comments' },
                () => loadActivities()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(postsChannel)
            supabase.removeChannel(commentsChannel)
        }
    }, [supabase, limit])

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-8 text-text-light dark:text-dark-text-muted">
                <p>{t('noActivity')}</p>
                <p className="text-sm mt-1">{t('beFirst')}</p>
            </div>
        )
    }

    return (
        <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {activities.map((activity) => (
                <ActivityItemComponent key={activity.id} activity={activity} t={t} formatDate={formatDate} />
            ))}
        </div>
    )
}

/**
 * Compact activity feed for sidebar or cards
 */
export function ActivityFeedCompact({ limit = 5 }: { limit?: number }) {
    const t = useTranslations('Homepage')
    return (
        <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                <h3 className="text-sm font-medium text-text-light dark:text-dark-text-muted">
                    {t('recentActivity')}
                </h3>
            </div>
            <ActivityFeed limit={limit} />
        </div>
    )
}
