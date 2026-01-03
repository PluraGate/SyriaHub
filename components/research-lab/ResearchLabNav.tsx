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
    ChevronLeft,
    Search
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ResearchLabNavProps {
    className?: string
}

export function ResearchLabNav({ className }: ResearchLabNavProps) {
    const pathname = usePathname()
    const t = useTranslations('ResearchLab')

    // Remove locale prefix from pathname for comparison
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')

    const navItems = [
        {
            label: t('nav.overview'),
            href: '/research-lab',
            icon: Home,
            exact: true
        },
        {
            label: t('nav.searchEngine'),
            href: '/research-lab/search',
            icon: Search,
        },
        {
            label: t('nav.surveys'),
            href: '/research-lab/surveys',
            icon: ClipboardList,
        },
        {
            label: t('nav.polls'),
            href: '/research-lab/polls',
            icon: Vote,
        },
        {
            label: t('nav.statistics'),
            href: '/research-lab/statistics',
            icon: BarChart3,
        },
        {
            label: t('nav.questionAdvisor'),
            href: '/research-lab/question-advisor',
            icon: Sparkles,
        },
    ]

    const quickActions = [
        {
            label: t('nav.survey'),
            href: '/research-lab/surveys/create',
            icon: Plus,
            color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
            label: t('nav.poll'),
            href: '/research-lab/polls?create=true',
            icon: Plus,
            color: 'bg-emerald-500 hover:bg-emerald-600'
        }
    ]

    const isActive = (href: string, exact?: boolean) => {
        if (exact) {
            return pathWithoutLocale === href
        }
        return pathWithoutLocale.startsWith(href)
    }

    return (
        <aside
            className={cn(
                // Collapsed (icons only) at md, expanded at xl
                'w-16 xl:w-64 shrink-0 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border',
                'flex flex-col h-[calc(100vh-4rem)] sticky top-16 transition-all duration-200',
                className
            )}
        >
            {/* Header */}
            <div className="p-3 xl:p-4 border-b border-gray-100 dark:border-dark-border">
                <Link
                    href="/research-lab"
                    className="flex items-center justify-center xl:justify-start gap-2 text-lg font-display font-semibold text-text dark:text-dark-text"
                    title={t('title')}
                >
                    <Sparkles className="w-5 h-5 text-primary shrink-0" />
                    <span className="hidden xl:inline">{t('title')}</span>
                </Link>
            </div>

            {/* Quick Actions */}
            <div className="p-2 xl:p-4 space-y-2 border-b border-gray-100 dark:border-dark-border">
                {quickActions.map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className={cn(
                            'flex items-center justify-center xl:justify-start gap-2 w-full p-2 xl:px-3 xl:py-2 rounded-lg text-sm font-medium text-white transition-colors',
                            action.color
                        )}
                        title={action.label}
                    >
                        <action.icon className="w-4 h-4 shrink-0" />
                        <span className="hidden xl:inline">{action.label}</span>
                    </Link>
                ))}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 xl:p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            'flex items-center justify-center xl:justify-start gap-3 p-2 xl:px-3 xl:py-2 rounded-lg text-sm transition-colors',
                            isActive(item.href, item.exact)
                                ? 'bg-primary/10 dark:bg-secondary/10 text-primary dark:text-secondary font-medium'
                                : 'text-text-light dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-border'
                        )}
                        title={item.label}
                    >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="hidden xl:inline">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Back to Site */}
            <div className="p-2 xl:p-4 border-t border-gray-100 dark:border-dark-border">
                <Link
                    href="/feed"
                    className={cn(
                        'flex items-center justify-center xl:justify-start gap-3 p-2 xl:px-3 xl:py-2 rounded-lg text-sm',
                        'text-text-light dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-border transition-colors'
                    )}
                    title={t('nav.backToFeed')}
                >
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                    <span className="hidden xl:inline">{t('nav.backToFeed')}</span>
                </Link>
            </div>
        </aside>
    )
}

