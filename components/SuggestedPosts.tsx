'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Skeleton } from '@/components/ui/skeleton'
import { MagazineCard } from '@/components/MagazineCard'
import { Clock, Quote } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SuggestedPost {
    id: string
    title: string
    content: string
    tags: string[]
    created_at: string
    cover_image_url?: string | null
    author: {
        id: string
        name: string
        email: string
        avatar_url?: string
    }
}

interface SuggestedPostsCarouselProps {
    currentPostId?: string
    currentTags?: string[]
    limit?: number
    title?: string
}

export function SuggestedPostsCarousel({
    currentPostId,
    currentTags = [],
    limit = 6,
    title,
}: SuggestedPostsCarouselProps) {
    const t = useTranslations('Post')
    const [posts, setPosts] = useState<SuggestedPost[]>([])
    const [loading, setLoading] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Use proper translation key only if title prop is not provided or matches default
    const displayTitle = title || t('relatedResearch')

    useEffect(() => {
        const loadPosts = async () => {
            try {
                let query = supabase
                    .from('posts')
                    .select(`
            id,
            title,
            content,
            content_type,
            tags,
            created_at,
            cover_image_url,
            author:users!posts_author_id_fkey(
              id,
              name,
              email,
              avatar_url
            )
          `)
                    .eq('status', 'published')
                    .neq('content_type', 'resource') // Exclude resources
                    .order('created_at', { ascending: false })
                    .limit(limit)

                if (currentPostId) {
                    query = query.neq('id', currentPostId)
                }

                if (currentTags.length > 0) {
                    query = query.contains('tags', currentTags)
                }

                const { data } = await query
                if (data) {
                    const formatPost = (post: any): SuggestedPost => ({
                        ...post,
                        author: Array.isArray(post.author) ? post.author[0] : post.author
                    })

                    // If we filtered by tags and got too few results, fallback to latest
                    if (data.length < limit && currentTags.length > 0) {
                        const { data: fallbackData } = await supabase
                            .from('posts')
                            .select(`
                id,
                title,
                content,
                content_type,
                tags,
                created_at,
                cover_image_url,
                author:users!posts_author_id_fkey(
                  id,
                  name,
                  email,
                  avatar_url
                )
              `)
                            .eq('status', 'published')
                            .neq('content_type', 'resource') // Exclude resources
                            .neq('id', currentPostId || '')
                            .order('created_at', { ascending: false })
                            .limit(limit - data.length)

                        if (fallbackData) {
                            const combined = [...data, ...fallbackData].map(formatPost)
                            // Remove duplicates if any
                            const unique = combined.filter((post, index, self) =>
                                index === self.findIndex((p) => p.id === post.id)
                            )
                            setPosts(unique.slice(0, limit))
                        } else {
                            setPosts(data.map(formatPost).slice(0, limit))
                        }
                    } else {
                        setPosts(data.map(formatPost).slice(0, limit))
                    }
                }
            } catch (error) {
                console.error('Error loading suggested posts:', error)
            } finally {
                setLoading(false)
            }
        }

        loadPosts()
    }, [supabase, currentPostId, currentTags, limit])

    if (loading) {
        return (
            <div className="space-y-6">
                <h3 className="text-sm font-semibold text-text-light dark:text-dark-text-muted uppercase tracking-wide mb-6">
                    {displayTitle}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="aspect-[16/10] skeleton rounded-2xl" />
                    ))}
                </div>
            </div>
        )
    }

    if (posts.length === 0) {
        return null
    }

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-semibold text-text-light dark:text-dark-text-muted uppercase tracking-wide mb-6">
                {displayTitle}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                    <MagazineCard
                        key={post.id}
                        post={post}
                        variant="standard"
                        className="h-full"
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * Simple list version for sidebars
 */
export function SuggestedPostsList({
    currentPostId,
    limit = 5,
}: {
    currentPostId?: string
    limit?: number
}) {
    const [posts, setPosts] = useState<SuggestedPost[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const loadPosts = async () => {
            try {
                let query = supabase
                    .from('posts')
                    .select(`
            id,
            title,
            content_type,
            created_at,
            author:users!posts_author_id_fkey(name)
          `)
                    .eq('status', 'published')
                    .neq('content_type', 'resource') // Exclude resources
                    .order('created_at', { ascending: false })
                    .limit(limit)

                if (currentPostId) {
                    query = query.neq('id', currentPostId)
                }

                const { data } = await query
                if (data) {
                    setPosts(data as any[])
                }
            } catch (error) {
                console.error('Error loading posts:', error)
            } finally {
                setLoading(false)
            }
        }

        loadPosts()
    }, [supabase, currentPostId, limit])

    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: limit }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {posts.map((post) => (
                <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors group"
                >
                    <h4 className="text-sm font-medium text-text dark:text-dark-text line-clamp-2 group-hover:text-primary dark:group-hover:text-accent-light transition-colors">
                        {post.title}
                    </h4>
                    <p className="text-xs text-text-light dark:text-dark-text-muted mt-1">
                        {post.author?.name || 'Anonymous'} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                </Link>
            ))}
        </div>
    )
}
