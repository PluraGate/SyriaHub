'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    ClipboardList,
    Vote,
    BarChart3,
    Sparkles,
    Home,
    Plus,
    ChevronLeft
} from 'lucide-react'

const navItems = [
    {
        label: 'Overview',
        href: '/research-lab',
        icon: Home,
        exact: true
    },
    {
        label: 'Surveys',
        href: '/research-lab/surveys',
        icon: ClipboardList,
    },
    {
        label: 'Polls',
        href: '/research-lab/polls',
        icon: Vote,
    },
    {
        label: 'Statistics',
        href: '/research-lab/statistics',
        icon: BarChart3,
    },
    {
        label: 'Question Advisor',
        href: '/research-lab/question-advisor',
        icon: Sparkles,
    },
]

const quickActions = [
    {
        label: 'New Survey',
        href: '/research-lab/surveys/create',
        icon: Plus,
        color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
        label: 'New Poll',
        href: '/research-lab/polls?create=true',
        icon: Plus,
        color: 'bg-emerald-500 hover:bg-emerald-600'
    }
]

interface ResearchLabNavProps {
    className?: string
}

export function ResearchLabNav({ className }: ResearchLabNavProps) {
    const pathname = usePathname()

    // Remove locale prefix from pathname for comparison
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')

    const isActive = (href: string, exact?: boolean) => {
        if (exact) {
            return pathWithoutLocale === href
        }
        return pathWithoutLocale.startsWith(href)
    }

    return (
        <aside
            className={cn(
                'w-64 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border',
                'flex flex-col h-screen sticky top-0',
                className
            )}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                <Link
                    href="/research-lab"
                    className="flex items-center gap-2 text-lg font-display font-semibold text-text dark:text-dark-text"
                >
                    <Sparkles className="w-5 h-5 text-primary" />
                    Research Lab
                </Link>
            </div>

            {/* Quick Actions */}
            <div className="p-4 space-y-2 border-b border-gray-100 dark:border-dark-border">
                {quickActions.map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className={cn(
                            'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors',
                            action.color
                        )}
                    >
                        <action.icon className="w-4 h-4" />
                        {action.label}
                    </Link>
                ))}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                            isActive(item.href, item.exact)
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-text-light dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-border'
                        )}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Back to Site */}
            <div className="p-4 border-t border-gray-100 dark:border-dark-border">
                <Link
                    href="/feed"
                    className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                        'text-text-light dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-border transition-colors'
                    )}
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back to Feed</span>
                </Link>
            </div>
        </aside>
    )
}
