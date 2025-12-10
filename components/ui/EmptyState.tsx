'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'

// SVG Illustrations as components for better performance
const NoPostsIllustration = ({ className }: { className?: string }) => (
    <svg className={cn("w-48 h-48", className)} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Document stack */}
        <rect x="45" y="60" width="90" height="110" rx="8" className="fill-gray-100 dark:fill-dark-surface stroke-gray-200 dark:stroke-dark-border" strokeWidth="2" />
        <rect x="55" y="50" width="90" height="110" rx="8" className="fill-gray-50 dark:fill-dark-border stroke-gray-200 dark:stroke-dark-border" strokeWidth="2" />
        <rect x="65" y="40" width="90" height="110" rx="8" className="fill-white dark:fill-dark-surface stroke-gray-300 dark:stroke-dark-border" strokeWidth="2" />
        {/* Lines on top document */}
        <rect x="80" y="60" width="50" height="6" rx="3" className="fill-gray-200 dark:fill-dark-border" />
        <rect x="80" y="75" width="60" height="4" rx="2" className="fill-gray-100 dark:fill-dark-surface" />
        <rect x="80" y="85" width="55" height="4" rx="2" className="fill-gray-100 dark:fill-dark-surface" />
        <rect x="80" y="95" width="45" height="4" rx="2" className="fill-gray-100 dark:fill-dark-surface" />
        {/* Decorative circle */}
        <circle cx="155" cy="45" r="20" className="fill-secondary/20 dark:fill-secondary/10" />
        <circle cx="155" cy="45" r="12" className="fill-secondary/40 dark:fill-secondary/20" />
        {/* Floating elements */}
        <circle cx="40" cy="100" r="4" className="fill-primary/30 dark:fill-primary/20 animate-float" />
        <circle cx="170" cy="130" r="6" className="fill-accent/30 dark:fill-accent/20 animate-float" style={{ animationDelay: '0.5s' }} />
    </svg>
)

const NoResultsIllustration = ({ className }: { className?: string }) => (
    <svg className={cn("w-48 h-48", className)} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Magnifying glass */}
        <circle cx="90" cy="85" r="40" className="fill-gray-50 dark:fill-dark-surface stroke-gray-300 dark:stroke-dark-border" strokeWidth="3" />
        <circle cx="90" cy="85" r="30" className="fill-white dark:fill-dark-border stroke-gray-200 dark:stroke-dark-border" strokeWidth="2" />
        {/* Handle */}
        <rect x="118" y="113" width="12" height="45" rx="6" transform="rotate(-45 118 113)" className="fill-gray-300 dark:fill-dark-border" />
        {/* X mark inside */}
        <path d="M78 73L102 97M102 73L78 97" className="stroke-gray-300 dark:stroke-dark-text-muted" strokeWidth="3" strokeLinecap="round" />
        {/* Question marks floating */}
        <text x="145" y="55" className="fill-secondary/50 dark:fill-secondary/30 text-2xl font-bold">?</text>
        <text x="50" y="150" className="fill-primary/40 dark:fill-primary/20 text-xl font-bold">?</text>
        {/* Decorative dots */}
        <circle cx="160" cy="90" r="4" className="fill-accent/30 dark:fill-accent/20 animate-float" />
        <circle cx="35" cy="70" r="3" className="fill-secondary/40 dark:fill-secondary/20 animate-float" style={{ animationDelay: '0.3s' }} />
    </svg>
)

const NoFollowersIllustration = ({ className }: { className?: string }) => (
    <svg className={cn("w-48 h-48", className)} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main person */}
        <circle cx="100" cy="70" r="25" className="fill-gray-100 dark:fill-dark-surface stroke-gray-300 dark:stroke-dark-border" strokeWidth="2" />
        <path d="M60 140C60 115 80 105 100 105C120 105 140 115 140 140" className="fill-gray-100 dark:fill-dark-surface stroke-gray-300 dark:stroke-dark-border" strokeWidth="2" />
        {/* Ghost followers (faded) */}
        <circle cx="50" cy="85" r="15" className="fill-gray-50 dark:fill-dark-border/50" opacity="0.5" />
        <path d="M30 130C30 115 40 110 50 110C60 110 70 115 70 130" className="fill-gray-50 dark:fill-dark-border/50" opacity="0.5" />
        <circle cx="150" cy="85" r="15" className="fill-gray-50 dark:fill-dark-border/50" opacity="0.5" />
        <path d="M130 130C130 115 140 110 150 110C160 110 170 115 170 130" className="fill-gray-50 dark:fill-dark-border/50" opacity="0.5" />
        {/* Connection lines (dashed) */}
        <path d="M75 85L55 85" className="stroke-gray-200 dark:stroke-dark-border" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M125 85L145 85" className="stroke-gray-200 dark:stroke-dark-border" strokeWidth="2" strokeDasharray="4 4" />
        {/* Hearts floating */}
        <path d="M165 50C165 47 168 45 170 45C172 45 175 47 175 50C175 55 170 58 170 58C170 58 165 55 165 50Z" className="fill-accent/30 dark:fill-accent/20 animate-float" />
        <path d="M32 55C32 53 34 52 35 52C36 52 38 53 38 55C38 58 35 60 35 60C35 60 32 58 32 55Z" className="fill-accent/20 dark:fill-accent/10 animate-float" style={{ animationDelay: '0.7s' }} />
    </svg>
)

const NoNotificationsIllustration = ({ className }: { className?: string }) => (
    <svg className={cn("w-48 h-48", className)} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bell */}
        <path d="M100 40C75 40 55 60 55 85V115L45 130H155L145 115V85C145 60 125 40 100 40Z" className="fill-gray-100 dark:fill-dark-surface stroke-gray-300 dark:stroke-dark-border" strokeWidth="2" />
        <circle cx="100" cy="145" r="10" className="fill-gray-200 dark:fill-dark-border" />
        {/* Bell top */}
        <circle cx="100" cy="35" r="5" className="fill-gray-300 dark:fill-dark-border" />
        {/* Z's for sleeping */}
        <text x="130" y="60" className="fill-secondary/50 dark:fill-secondary/30 text-lg font-bold">z</text>
        <text x="145" y="50" className="fill-secondary/40 dark:fill-secondary/20 text-base font-bold">z</text>
        <text x="155" y="42" className="fill-secondary/30 dark:fill-secondary/10 text-sm font-bold">z</text>
        {/* Stars */}
        <circle cx="45" cy="60" r="3" className="fill-primary/30 dark:fill-primary/20 animate-float" />
        <circle cx="160" cy="100" r="4" className="fill-accent/20 dark:fill-accent/10 animate-float" style={{ animationDelay: '0.5s' }} />
    </svg>
)

type EmptyStateVariant = 'no-posts' | 'no-results' | 'no-followers' | 'no-notifications' | 'custom'

interface EmptyStateProps {
    variant?: EmptyStateVariant
    title: string
    description?: string
    actionLabel?: string
    actionHref?: string
    onAction?: () => void
    className?: string
    customIllustration?: React.ReactNode
}

const illustrationMap = {
    'no-posts': NoPostsIllustration,
    'no-results': NoResultsIllustration,
    'no-followers': NoFollowersIllustration,
    'no-notifications': NoNotificationsIllustration,
}

export function EmptyState({
    variant = 'no-posts',
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    className,
    customIllustration,
}: EmptyStateProps) {
    const Illustration = variant !== 'custom' ? illustrationMap[variant] : null

    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-16 px-6",
            "animate-fade-in-up",
            className
        )}>
            {/* Illustration */}
            <div className="mb-6">
                {customIllustration || (Illustration && <Illustration />)}
            </div>

            {/* Text content */}
            <h3 className="text-xl font-semibold text-text dark:text-dark-text mb-2 text-center">
                {title}
            </h3>

            {description && (
                <p className="text-text-light dark:text-dark-text-muted text-center max-w-sm mb-6">
                    {description}
                </p>
            )}

            {/* Action button */}
            {(actionLabel && actionHref) && (
                <Link
                    href={actionHref}
                    className="btn btn-primary btn-press"
                >
                    {actionLabel}
                </Link>
            )}

            {(actionLabel && onAction && !actionHref) && (
                <button
                    onClick={onAction}
                    className="btn btn-primary btn-press"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    )
}

// Export individual illustrations for custom use
export { NoPostsIllustration, NoResultsIllustration, NoFollowersIllustration, NoNotificationsIllustration }
