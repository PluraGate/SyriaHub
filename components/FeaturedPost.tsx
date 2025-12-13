'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Clock, ArrowUpRight, TrendingUp } from 'lucide-react'

type FeaturedSize = 'large' | 'medium' | 'small'

interface FeaturedPostProps {
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
    }
    size?: FeaturedSize
    showTrending?: boolean
    accentColor?: 'primary' | 'accent' | 'secondary'
    className?: string
}

// Get reading time
function getReadingTime(content?: string): number {
    if (!content) return 3
    const words = content.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
}

// Get initials
function getInitials(name?: string, email?: string): string {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    if (email) return email[0].toUpperCase()
    return 'U'
}

// Accent color classes
const accentClasses = {
    primary: {
        bg: 'bg-primary',
        bgLight: 'bg-primary/10 dark:bg-primary-light/20',
        text: 'text-primary dark:text-primary-light',
        gradient: 'from-primary/80 via-primary/60 to-primary/40',
    },
    accent: {
        bg: 'bg-accent',
        bgLight: 'bg-accent/20',
        text: 'text-accent-dark dark:text-accent',
        gradient: 'from-accent/80 via-accent/60 to-accent/40',
    },
    secondary: {
        bg: 'bg-secondary',
        bgLight: 'bg-secondary/20',
        text: 'text-secondary-dark dark:text-secondary',
        gradient: 'from-secondary/80 via-secondary/60 to-secondary/40',
    },
}

export function FeaturedPost({
    post,
    size = 'large',
    showTrending = false,
    accentColor = 'primary',
    className,
}: FeaturedPostProps) {
    const readingTime = getReadingTime(post.content)
    const colors = accentClasses[accentColor]

    // Large variant - full hero-style card
    if (size === 'large') {
        return (
            <Link
                href={`/post/${post.id}`}
                className={cn(
                    'group relative flex flex-col justify-end',
                    'h-full min-h-[280px] md:min-h-[350px]',
                    'rounded-3xl overflow-hidden',
                    'transition-all duration-500',
                    'hover:shadow-soft-xl',
                    className
                )}
            >
                {/* Background */}
                <div className="absolute inset-0">
                    {post.cover_image_url ? (
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url(${post.cover_image_url})` }}
                        />
                    ) : (
                        <div className={cn(
                            'absolute inset-0 bg-gradient-to-br',
                            colors.gradient,
                            'opacity-90'
                        )} />
                    )}
                    {/* Overlay - semi-transparent to show cover image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 md:p-10 space-y-6">
                    {/* Top Row */}
                    <div className="flex items-center justify-between">
                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {post.tags.slice(0, 3).map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1.5 text-xs font-semibold bg-white/20 backdrop-blur-sm text-white rounded-full uppercase tracking-wider"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Trending badge */}
                        {showTrending && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-full shadow-sm">
                                <TrendingUp className="w-3.5 h-3.5 text-white" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    Trending
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                        {post.title}
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                        <p className="text-lg text-white/80 line-clamp-2 max-w-2xl">
                            {post.excerpt}
                        </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/20">
                        {/* Author */}
                        {post.author && (
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center',
                                    'text-sm font-bold text-white',
                                    'bg-white/20 backdrop-blur-sm'
                                )}>
                                    {getInitials(post.author.name, post.author.email)}
                                </div>
                                <div>
                                    <div className="font-medium text-white">
                                        {post.author.name || post.author.email?.split('@')[0]}
                                    </div>
                                    <div className="text-sm text-white/60">
                                        {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Read more */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-white/70">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{readingTime} min read</span>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all group-hover:bg-white group-hover:scale-110">
                                <ArrowUpRight className="w-5 h-5 text-white group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        )
    }

    // Medium variant - balanced card
    if (size === 'medium') {
        return (
            <Link
                href={`/post/${post.id}`}
                className={cn(
                    'group relative flex flex-col justify-end',
                    'h-full min-h-[280px]',
                    'rounded-2xl overflow-hidden',
                    'transition-all duration-300',
                    'hover:shadow-soft-lg hover:-translate-y-1',
                    className
                )}
            >
                {/* Background */}
                <div className="absolute inset-0">
                    {post.cover_image_url ? (
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                            style={{ backgroundImage: `url(${post.cover_image_url})` }}
                        />
                    ) : (
                        <div className={cn('absolute inset-0', colors.bgLight)} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-6 space-y-3">
                    {post.tags && post.tags.length > 0 && (
                        <span className={cn('text-xs font-semibold uppercase tracking-wider', colors.text)}>
                            {post.tags[0]}
                        </span>
                    )}

                    <h3 className="text-xl md:text-2xl font-bold text-white leading-tight line-clamp-2">
                        {post.title}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-white/70">
                        <span>{readingTime} min read</span>
                        {post.views !== undefined && (
                            <>
                                <span>•</span>
                                <span>{post.views} views</span>
                            </>
                        )}
                    </div>
                </div>
            </Link>
        )
    }

    // Small variant - compact card
    return (
        <Link
            href={`/post/${post.id}`}
            className={cn(
                'group flex flex-col h-full',
                'p-5 rounded-xl',
                'bg-white dark:bg-dark-surface',
                'border border-gray-100 dark:border-dark-border',
                'transition-all duration-200',
                'hover:shadow-soft-md hover:-translate-y-0.5',
                className
            )}
        >
            {/* Category dot */}
            <div className="flex items-center gap-2 mb-3">
                <div className={cn('w-2 h-2 rounded-full', colors.bg)} />
                <span className={cn('text-xs font-semibold uppercase tracking-wider', colors.text)}>
                    {post.tags?.[0] || 'Research'}
                </span>
            </div>

            <h3 className="text-base font-semibold text-text dark:text-dark-text line-clamp-2 group-hover:text-primary transition-colors flex-1">
                {post.title}
            </h3>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-xs text-text-muted dark:text-dark-text-muted">
                <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span>{readingTime} min</span>
            </div>
        </Link>
    )
}
