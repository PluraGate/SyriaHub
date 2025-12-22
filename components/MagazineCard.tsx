'use client'

import React from 'react'
import Link from 'next/link'
import { cn, stripMarkdown, getInitials, getAvatarGradient } from '@/lib/utils'
import { Clock, Bookmark, Eye, Calendar } from 'lucide-react'
import { useLocale } from 'next-intl'
import { formatLocalizedDate } from '@/lib/formatDate'

export type MagazineCardVariant = 'featured' | 'standard' | 'compact' | 'horizontal'

interface MagazineCardProps {
    post: {
        id: string
        title: string
        content?: string
        excerpt?: string
        created_at: string
        author?: {
            id: string
            name?: string
            email?: string
            avatar_url?: string
        }
        tags?: string[]
        views?: number
        cover_image_url?: string | null
        content_type?: string | null
        metadata?: {
            start_time?: string
            end_time?: string
            location?: string
            status?: string
        } | null
    }
    variant?: MagazineCardVariant
    className?: string
    priority?: boolean
    showImage?: boolean
}

// Estimated reading time calculation
function getReadingTime(content?: string): number {
    if (!content) return 2
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / wordsPerMinute))
}

// Format relative time with locale support
function formatRelativeTime(dateString: string, locale: string = 'en'): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    // Use generic relative time for recent posts
    if (diffInSeconds < 60) return locale === 'ar' ? 'الآن' : 'Just now'
    if (diffInSeconds < 3600) return locale === 'ar' ? `منذ ${Math.floor(diffInSeconds / 60)} د` : `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return locale === 'ar' ? `منذ ${Math.floor(diffInSeconds / 3600)} س` : `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return locale === 'ar' ? `منذ ${Math.floor(diffInSeconds / 86400)} ي` : `${Math.floor(diffInSeconds / 86400)}d ago`

    return formatLocalizedDate(date, locale, 'short')
}

// Format event date with locale support
function formatEventDate(dateString?: string, locale: string = 'en'): string {
    if (!dateString) return locale === 'ar' ? 'التاريخ غير محدد' : 'Date TBD'
    return formatLocalizedDate(dateString, locale, 'medium')
}

export function MagazineCard({
    post,
    variant = 'standard',
    className,
    priority = false,
    showImage = true,
}: MagazineCardProps) {
    const locale = useLocale()
    const readingTime = getReadingTime(post.content)
    const isEvent = post.content_type === 'event'
    const eventDate = isEvent ? formatEventDate(post.metadata?.start_time, locale) : ''
    const rawExcerpt = post.excerpt || post.content || ''
    const excerpt = stripMarkdown(rawExcerpt).substring(0, 150).trim() + (rawExcerpt.length > 150 ? '...' : '')

    // Featured variant - large card with image background
    if (variant === 'featured') {
        return (
            <Link
                href={post.content_type === 'event' ? `/events/${post.id}` : `/post/${post.id}`}
                className={cn(
                    'group relative flex flex-col justify-end h-full min-h-[320px] p-6 md:p-8',
                    'rounded-2xl overflow-hidden',
                    'bg-gradient-to-br from-gray-900 to-gray-800',
                    'transition-all duration-300',
                    'hover:shadow-soft-xl',
                    className
                )}
            >
                {/* Background image or gradient */}
                {post.cover_image_url && showImage && (
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 will-change-transform"
                        style={{ backgroundImage: `url(${post.cover_image_url})` }}
                    />
                )}

                {/* Overlay gradient - semi-transparent to show cover image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />

                {/* Content */}
                <div className="relative z-10 space-y-4">
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {post.tags.slice(0, 2).map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm text-white rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight group-hover:text-primary-light transition-colors">
                        {post.title}
                    </h3>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-white/70">
                        {post.author && (
                            <div className="flex items-center gap-2">
                                {post.author.avatar_url ? (
                                    <img
                                        src={post.author.avatar_url}
                                        alt={post.author.name || ''}
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className={cn(
                                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white',
                                        getAvatarGradient(post.author.id)
                                    )}>
                                        {getInitials(post.author.name, post.author.email)}
                                    </div>
                                )}
                                <span>{post.author.name || post.author.email?.split('@')[0]}</span>
                            </div>
                        )}
                        {isEvent ? (
                            <div className="flex items-center gap-1 text-white bg-primary/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-primary/30">
                                <Calendar className="w-3.5 h-3.5 text-primary-light" />
                                <span className="text-primary-light font-medium">{eventDate}</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{readingTime} min read</span>
                                </div>
                                <span className="text-white/50">·</span>
                                <span>{formatRelativeTime(post.created_at, locale)}</span>
                            </>
                        )}
                    </div>
                </div>
            </Link>
        )
    }

    // Horizontal variant - image on left, text on right
    if (variant === 'horizontal') {
        return (
            <Link
                href={post.content_type === 'event' ? `/events/${post.id}` : `/post/${post.id}`}
                className={cn(
                    'group flex gap-4 p-4 rounded-xl bg-white dark:bg-dark-surface',
                    'border border-gray-100 dark:border-dark-border',
                    'transition-all duration-300',
                    'hover:shadow-soft-md hover:-translate-y-0.5',
                    className
                )}
            >
                {/* Image */}
                {showImage && (
                    <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-border">
                        {post.cover_image_url ? (
                            <div
                                className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105 will-change-transform"
                                style={{ backgroundImage: `url(${post.cover_image_url})` }}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10" />
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    {post.tags && post.tags.length > 0 && (
                        <span className="text-xs font-medium text-primary dark:text-primary-light mb-1">
                            {post.tags[0]}
                        </span>
                    )}

                    <h3 className="text-base md:text-lg font-semibold text-text dark:text-dark-text line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                    </h3>

                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted dark:text-dark-text-muted">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{readingTime} min read</span>
                        </div>
                        <span>·</span>
                        <span>{formatRelativeTime(post.created_at, locale)}</span>
                    </div>
                </div>
            </Link>
        )
    }

    // Compact variant - minimal text-only card
    if (variant === 'compact') {
        return (
            <Link
                href={post.content_type === 'event' ? `/events/${post.id}` : `/post/${post.id}`}
                className={cn(
                    'group block p-4 rounded-xl',
                    'bg-gray-50 dark:bg-dark-surface/50',
                    'border border-transparent hover:border-gray-200 dark:hover:border-dark-border',
                    'transition-all duration-200',
                    className
                )}
            >
                {post.tags && post.tags.length > 0 && (
                    <span className="text-xs font-medium text-primary dark:text-primary-light uppercase tracking-wider">
                        {post.tags[0]}
                    </span>
                )}

                <h3 className="mt-1 text-base font-semibold text-text dark:text-dark-text line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                </h3>

                <p className="mt-2 text-sm text-text-light dark:text-dark-text-muted line-clamp-2">
                    {excerpt}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs text-text-muted dark:text-dark-text-muted">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{readingTime} min read</span>
                    </div>
                    <span>{formatRelativeTime(post.created_at, locale)}</span>
                </div>
            </Link>
        )
    }

    // Standard variant - default magazine card
    return (
        <Link
            href={`/post/${post.id}`}
            className={cn(
                'group flex flex-col h-full rounded-2xl overflow-hidden',
                'bg-white dark:bg-dark-surface',
                'border border-gray-100 dark:border-dark-border',
                'transition-all duration-300',
                'hover:shadow-soft-lg hover:-translate-y-1',
                className
            )}
        >
            {/* Image */}
            {showImage && (
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-dark-border">
                    {post.cover_image_url ? (
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 will-change-transform"
                            style={{ backgroundImage: `url(${post.cover_image_url})` }}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20" />
                    )}

                    {/* Bookmark icon */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-2 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm rounded-full shadow-sm">
                            <Bookmark className="w-4 h-4 text-text dark:text-dark-text" />
                        </div>
                    </div>

                    {/* Event Banner */}
                    {post.content_type === 'event' && (
                        <div className="absolute bottom-0 left-0 right-0 bg-primary/90 backdrop-blur-sm py-1.5 px-4 flex items-center justify-center gap-2 text-white">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase tracking-wide">Event</span>
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 flex flex-col p-5">
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 2).map((tag) => (
                            <span
                                key={tag}
                                className="px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary dark:bg-white/5 dark:text-white/50 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Title */}
                <h3 className="text-lg font-semibold text-text dark:text-dark-text line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                </h3>

                {/* Excerpt */}
                <p className="mt-2 text-sm text-text-light dark:text-dark-text-muted line-clamp-2 flex-1">
                    {excerpt}
                </p>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
                    {/* Author */}
                    {post.author && (
                        <div className="flex items-center gap-2">
                            {post.author.avatar_url ? (
                                <img
                                    src={post.author.avatar_url}
                                    alt={post.author.name || ''}
                                    className="w-7 h-7 rounded-full object-cover"
                                />
                            ) : (
                                <div className={cn(
                                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white',
                                    getAvatarGradient(post.author.id)
                                )}>
                                    {getInitials(post.author.name, post.author.email)}
                                </div>
                            )}
                            <span className="text-sm text-text-light dark:text-dark-text-muted truncate max-w-[100px]">
                                {post.author.name || post.author.email?.split('@')[0]}
                            </span>
                        </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-xs text-text-muted dark:text-dark-text-muted">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{readingTime} min</span>
                        </div>
                        <span>·</span>
                        <span>{formatRelativeTime(post.created_at, locale)}</span>
                        {post.views !== undefined && post.views > 0 && (
                            <>
                                <span>·</span>
                                <div className="flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{post.views}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}
