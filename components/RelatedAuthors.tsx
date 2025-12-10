'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAchievements } from '@/components/UserAchievements'
import { FollowButton } from '@/components/FollowButton'
import { Users, FileText } from 'lucide-react'

interface Author {
    id: string
    name: string
    email: string
    bio?: string
    affiliation?: string
    avatar_url?: string
    post_count: number
}

interface RelatedAuthorsProps {
    currentUserId?: string
    limit?: number
    title?: string
}

export function RelatedAuthors({
    currentUserId,
    limit = 5,
    title = 'Researchers you might know',
}: RelatedAuthorsProps) {
    const [authors, setAuthors] = useState<Author[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const loadAuthors = async () => {
            try {
                // Get users with their post counts
                const { data: users } = await supabase
                    .from('users')
                    .select('id, name, email, bio, affiliation, avatar_url')
                    .neq('id', currentUserId || '')
                    .limit(limit * 2) // Get more to sort/filter

                if (users) {
                    // Get post counts for each user
                    const authorsWithCounts = await Promise.all(
                        users.map(async (user) => {
                            const { count } = await supabase
                                .from('posts')
                                .select('*', { count: 'exact', head: true })
                                .eq('author_id', user.id)
                                .eq('status', 'published')

                            return {
                                ...user,
                                post_count: count || 0,
                            }
                        })
                    )

                    // Sort by post count and take top ones
                    const topAuthors = authorsWithCounts
                        .sort((a, b) => b.post_count - a.post_count)
                        .slice(0, limit)

                    setAuthors(topAuthors)
                }
            } catch (error) {
                console.error('Error loading authors:', error)
            } finally {
                setLoading(false)
            }
        }

        loadAuthors()
    }, [supabase, currentUserId, limit])

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    <h3 className="text-sm font-medium text-text-light dark:text-dark-text-muted">{title}</h3>
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (authors.length === 0) {
        return null
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                <h3 className="text-sm font-medium text-text-light dark:text-dark-text-muted">{title}</h3>
            </div>

            <div className="space-y-3">
                {authors.map((author) => (
                    <div
                        key={author.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors"
                    >
                        <Link href={`/profile/${author.id}`} className="flex-shrink-0">
                            <UserAvatar
                                name={author.name}
                                email={author.email}
                                avatarUrl={author.avatar_url}
                                size="sm"
                            />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <Link href={`/profile/${author.id}`}>
                                <h4 className="text-sm font-medium text-text dark:text-dark-text truncate hover:text-primary dark:hover:text-accent-light transition-colors">
                                    {author.name}
                                </h4>
                            </Link>
                            <div className="flex items-center gap-2">
                                {author.affiliation && (
                                    <span className="text-xs text-text-light dark:text-dark-text-muted truncate max-w-[100px]">
                                        {author.affiliation}
                                    </span>
                                )}
                                <span className="text-xs text-text-light dark:text-dark-text-muted flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {author.post_count}
                                </span>
                            </div>
                        </div>
                        <FollowButton userId={author.id} variant="compact" />
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Compact author cards for sidebar
 */
export function AuthorSpotlight({ authorId }: { authorId: string }) {
    const [author, setAuthor] = useState<Author | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const loadAuthor = async () => {
            try {
                const { data } = await supabase
                    .from('users')
                    .select('id, name, email, bio, affiliation, avatar_url')
                    .eq('id', authorId)
                    .single()

                if (data) {
                    const { count } = await supabase
                        .from('posts')
                        .select('*', { count: 'exact', head: true })
                        .eq('author_id', authorId)
                        .eq('status', 'published')

                    setAuthor({
                        ...data,
                        post_count: count || 0,
                    })
                }
            } catch (error) {
                console.error('Error loading author:', error)
            } finally {
                setLoading(false)
            }
        }

        loadAuthor()
    }, [authorId, supabase])

    if (loading) {
        return (
            <div className="card p-4 space-y-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
            </div>
        )
    }

    if (!author) return null

    return (
        <div className="card card-premium p-4 space-y-4">
            <div className="flex items-center gap-3">
                <UserAvatar
                    name={author.name}
                    email={author.email}
                    avatarUrl={author.avatar_url}
                    size="lg"
                />
                <div>
                    <h4 className="font-semibold text-text dark:text-dark-text">{author.name}</h4>
                    {author.affiliation && (
                        <p className="text-sm text-text-light dark:text-dark-text-muted">
                            {author.affiliation}
                        </p>
                    )}
                </div>
            </div>

            {author.bio && (
                <p className="text-sm text-text-light dark:text-dark-text-muted line-clamp-3">
                    {author.bio}
                </p>
            )}

            <div className="flex items-center justify-between">
                <UserAchievements userId={author.id} />
                <Link
                    href={`/profile/${author.id}`}
                    className="text-sm text-primary dark:text-accent-light hover:underline"
                >
                    View profile
                </Link>
            </div>
        </div>
    )
}
