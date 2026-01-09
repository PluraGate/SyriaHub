'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import {
    ClipboardList,
    Vote,
    BarChart3,
    Sparkles,
    Home,
    Search,
    Plus,
    X,
    LayoutGrid
} from 'lucide-react'

export function ResearchLabMobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    const t = useTranslations('ResearchLab')
    const pathname = usePathname()

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
            color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-900/30'
        },
        {
            label: t('nav.poll'),
            href: '/research-lab/polls?create=true',
            icon: Plus,
            color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-900/30'
        }
    ]

    const isActive = (href: string, exact?: boolean) => {
        if (exact) {
            return pathWithoutLocale === href
        }
        return pathWithoutLocale.startsWith(href)
    }

    return (
        <div className="fixed bottom-6 right-24 z-50">
            {/* Backdrop overlay when open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 dark:bg-black/40 -z-10"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Action Menu Panel */}
            <div
                className={cn(
                    'absolute bottom-16 right-0 transition-all duration-200 origin-bottom-right',
                    isOpen
                        ? 'opacity-100 scale-100 pointer-events-auto'
                        : 'opacity-0 scale-95 pointer-events-none'
                )}
            >
                <div className="w-64 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-xl p-2 mb-2 mr-0">
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2 mb-2 p-1 border-b border-gray-100 dark:border-dark-border pb-3">
                        {quickActions.map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-1 p-2 rounded-lg text-xs font-medium transition-all hover:opacity-80 active:scale-95',
                                    action.color
                                )}
                            >
                                <action.icon className="w-5 h-5" />
                                <span className="text-center">{action.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto scrollbar-thin">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg text-sm transition-colors',
                                    isActive(item.href, item.exact)
                                        ? 'bg-primary/10 dark:bg-secondary/10 text-primary dark:text-secondary font-medium'
                                        : 'text-text-light dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-border'
                                )}
                            >
                                <item.icon className="w-4 h-4 shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fab fab-primary w-14 h-14 !static focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                    isOpen && "bg-gray-600 hover:bg-gray-700 rotate-90"
                )}
                aria-label={isOpen ? t('closeMenu') : t('openMenu')} // You might need to add these keys or use generic 'Close'/'Open'
                aria-expanded={isOpen}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <LayoutGrid className="w-6 h-6" />
                )}
            </button>
        </div>
    )
}
