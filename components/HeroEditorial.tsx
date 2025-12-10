'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ArrowRight, TrendingUp, Users, BookOpen } from 'lucide-react'

interface HeroEditorialProps {
    title?: string
    subtitle?: string
    badge?: string
    stats?: {
        researchers?: number
        publications?: number
        universities?: number
    }
    featuredPosts?: Array<{
        id: string
        title: string
        author?: {
            name?: string
            avatar_url?: string
        }
        tags?: string[]
    }>
    showCTA?: boolean
    className?: string
}

export function HeroEditorial({
    title = "Research\nThat Matters",
    subtitle = "A collaborative platform for Syrian researchers to share, discover, and connect.",
    badge = "Research Platform",
    stats = {
        researchers: 500,
        publications: 1200,
        universities: 50,
    },
    featuredPosts = [],
    showCTA = true,
    className,
}: HeroEditorialProps) {
    return (
        <section className={cn(
            'relative min-h-[90vh] flex items-center overflow-hidden',
            'bg-white dark:bg-dark-bg',
            className
        )}>
            {/* Subtle background pattern */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="container-custom max-w-7xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center py-20 lg:py-28">

                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-surface rounded-full">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-text-light dark:text-dark-text-muted">
                                {badge}
                            </span>
                        </div>

                        {/* Large Headline */}
                        <h1 className="text-[3.5rem] md:text-[5rem] lg:text-[6rem] font-bold leading-[0.9] tracking-tight text-text dark:text-dark-text">
                            {title.split('\n').map((line, i) => (
                                <span key={i} className="block">
                                    {i === 1 ? (
                                        <span className="text-primary">{line}</span>
                                    ) : (
                                        line
                                    )}
                                </span>
                            ))}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-text-light dark:text-dark-text-muted max-w-xl leading-relaxed">
                            {subtitle}
                        </p>

                        {/* CTA Buttons */}
                        {showCTA && (
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                    href="/auth/signup"
                                    className={cn(
                                        'group inline-flex items-center justify-center gap-3 px-8 py-4',
                                        'bg-primary hover:bg-primary-dark text-white',
                                        'font-semibold rounded-2xl',
                                        'transition-all duration-200',
                                        'shadow-sm hover:shadow-lg hover:shadow-primary/20',
                                        'btn-press'
                                    )}
                                >
                                    <span>Get Started</span>
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <Link
                                    href="/explore"
                                    className={cn(
                                        'inline-flex items-center justify-center gap-2 px-8 py-4',
                                        'bg-gray-100 hover:bg-gray-200 dark:bg-dark-surface dark:hover:bg-dark-border',
                                        'text-text dark:text-dark-text',
                                        'font-semibold rounded-2xl',
                                        'transition-all duration-200',
                                        'btn-press'
                                    )}
                                >
                                    Browse Research
                                </Link>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-200 dark:border-dark-border">
                            <StatItem
                                icon={<Users className="w-5 h-5" />}
                                value={stats.researchers || 500}
                                label="Researchers"
                            />
                            <StatItem
                                icon={<BookOpen className="w-5 h-5" />}
                                value={stats.publications || 1200}
                                label="Publications"
                            />
                            <StatItem
                                icon={<TrendingUp className="w-5 h-5" />}
                                value={stats.universities || 50}
                                label="Universities"
                            />
                        </div>
                    </div>

                    {/* Right Column - Featured Content Preview */}
                    <div className="lg:col-span-5 hidden lg:block">
                        <div className="relative">
                            {/* Decorative background */}
                            <div className="absolute -inset-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-surface dark:to-dark-bg rounded-3xl" />

                            {/* Floating cards */}
                            <div className="relative space-y-4 p-6">
                                {/* Featured post card 1 */}
                                <div className={cn(
                                    'p-5 bg-white dark:bg-dark-surface rounded-2xl',
                                    'border border-gray-100 dark:border-dark-border',
                                    'shadow-soft-md',
                                    'animate-fade-in-up'
                                )}>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <BookOpen className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
                                                Latest Research
                                            </div>
                                            <div className="text-sm font-semibold text-text dark:text-dark-text line-clamp-2">
                                                {featuredPosts[0]?.title || "Impact of Diaspora Communities on Economic Development"}
                                            </div>
                                            <div className="mt-2 flex gap-2">
                                                <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-dark-border rounded-full text-text-muted">
                                                    Economics
                                                </span>
                                                <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-dark-border rounded-full text-text-muted">
                                                    Migration
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Featured post card 2 */}
                                <div className={cn(
                                    'p-5 bg-white dark:bg-dark-surface rounded-2xl',
                                    'border border-gray-100 dark:border-dark-border',
                                    'shadow-soft-md ml-8',
                                    'animate-fade-in-up [animation-delay:100ms]'
                                )}>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                                            <Users className="w-6 h-6 text-accent-dark" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs font-medium text-accent-dark uppercase tracking-wider mb-1">
                                                Community
                                            </div>
                                            <div className="text-sm font-semibold text-text dark:text-dark-text line-clamp-2">
                                                {featuredPosts[1]?.title || "Building Research Networks Across Borders"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity indicator */}
                                <div className={cn(
                                    'p-4 bg-white dark:bg-dark-surface rounded-2xl',
                                    'border border-gray-100 dark:border-dark-border',
                                    'shadow-soft-md mr-8',
                                    'animate-fade-in-up [animation-delay:200ms]'
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        'w-8 h-8 rounded-full border-2 border-white dark:border-dark-surface',
                                                        `avatar-gradient-${i}`
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <div className="text-sm text-text-light dark:text-dark-text-muted">
                                            <span className="font-semibold text-text dark:text-dark-text">12 researchers</span>
                                            {' '}joined this week
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

// Stat item component
function StatItem({
    icon,
    value,
    label
}: {
    icon: React.ReactNode
    value: number
    label: string
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="text-primary dark:text-primary-light">
                {icon}
            </div>
            <div>
                <div className="text-2xl font-bold text-text dark:text-dark-text">
                    {value.toLocaleString()}+
                </div>
                <div className="text-sm text-text-muted dark:text-dark-text-muted">
                    {label}
                </div>
            </div>
        </div>
    )
}
