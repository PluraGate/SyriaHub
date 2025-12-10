'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, Sparkles, Clock, Quote } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SuggestedPost {
    id: string
    title: string
    content: string
    tags: string[]
    created_at: string
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
    title = 'You might like',
}: SuggestedPostsCarouselProps) {
    const [posts, setPosts] = useState<SuggestedPost[]>([])
    const [loading, setLoading] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        const loadSuggestions = async () => {
            try {
                let query = supabase
                    .from('posts')
                    .select(`
            id,
            title,
            content,
            tags,
            created_at,
            author:users!posts_author_id_fkey(id, name, email, avatar_url)
          `)
                    .eq('status', 'published')
                    .order('created_at', { ascending: false })
                    .limit(limit * 2) // Get more to filter

                // Exclude current post if provided
                if (currentPostId) {
                    query = query.neq('id', currentPostId)
                }

                const { data } = await query

                if (data) {
                    let suggestedPosts = data as any[]

                    // Sort by tag relevance if current tags are provided
                    if (currentTags.length > 0) {
                        suggestedPosts = suggestedPosts
                            .map((post) => ({
                                ...post,
                                relevance: post.tags?.filter((tag: string) =>
                                    currentTags.includes(tag)
                                ).length || 0,
                            }))
                            .sort((a, b) => b.relevance - a.relevance)
                    }

                    setPosts(suggestedPosts.slice(0, limit))
                }
            } catch (error) {
                console.error('Error loading suggestions:', error)
            } finally {
                setLoading(false)
            }
        }

        loadSuggestions()
    }, [supabase, currentPostId, currentTags, limit])

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 320 // Card width + gap
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            })
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary dark:text-accent-light" />
                    <h3 className="font-semibold text-text dark:text-dark-text">{title}</h3>
                </div>
                <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="min-w-[300px] skeleton h-40 rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    if (posts.length === 0) {
        return null
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary dark:text-accent-light animate-pulse" />
                    <h3 className="font-semibold text-text dark:text-dark-text">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors btn-press"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors btn-press"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2"
                style={{ scrollSnapType: 'x mandatory' }}
            >
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/post/${post.id}`}
                        className="min-w-[300px] max-w-[300px] card card-glow p-4 space-y-3 animate-fade-in-up"
                        style={{ scrollSnapAlign: 'start' }}
                    >
                        <h4 className="font-semibold text-text dark:text-dark-text line-clamp-2 group-hover:text-primary dark:group-hover:text-accent-light transition-colors">
                            {post.title}
                        </h4>

                        <p className="text-sm text-text-light dark:text-dark-text-muted line-clamp-2">
                            {post.content.substring(0, 100)}...
                        </p>

                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {post.tags.slice(0, 2).map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-dark-border text-text-light dark:text-dark-text-muted rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-dark-border">
                            <div className="flex items-center gap-2">
                                <UserAvatar
                                    name={post.author?.name}
                                    email={post.author?.email}
                                    avatarUrl={post.author?.avatar_url}
                                    size="sm"
                                />
                                <span className="text-xs text-text-light dark:text-dark-text-muted">
                                    {post.author?.name || 'Anonymous'}
                                </span>
                            </div>
                            <span className="text-xs text-text-light/70 dark:text-dark-text-muted/70 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                        </div>
                    </Link>
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
            created_at,
            author:users!posts_author_id_fkey(name)
          `)
                    .eq('status', 'published')
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
