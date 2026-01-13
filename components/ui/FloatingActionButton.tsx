'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, PenLine, HelpCircle, Upload, X, Calendar, BookMarked, Vote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface QuickAction {
    icon: React.ReactNode
    labelKey: string
    href?: string
    onClick?: () => void
    iconColor: string
    iconBg: string
}

export function FloatingActionButton({ className }: { className?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const t = useTranslations('QuickActions')
    const pathname = usePathname()

    const actions: QuickAction[] = [
        {
            icon: <PenLine className="w-4 h-4" />,
            labelKey: 'newPost',
            href: '/editor',
            iconColor: 'text-blue-600 dark:text-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        },
        {
            icon: <HelpCircle className="w-4 h-4" />,
            labelKey: 'askQuestion',
            href: '/editor?type=question',
            iconColor: 'text-purple-600 dark:text-purple-400',
            iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        },
        {
            icon: <BookMarked className="w-4 h-4" />,
            labelKey: 'traceMemory',
            href: '/editor?type=trace',
            iconColor: 'text-amber-600 dark:text-amber-400',
            iconBg: 'bg-amber-100 dark:bg-amber-900/30',
        },
        {
            icon: <Calendar className="w-4 h-4" />,
            labelKey: 'newEvent',
            href: '/events/create',
            iconColor: 'text-rose-600 dark:text-rose-400',
            iconBg: 'bg-rose-100 dark:bg-rose-900/30',
        },
        {
            icon: <Vote className="w-4 h-4" />,
            labelKey: 'newPoll',
            href: '/research-lab/polls?create=true',
            iconColor: 'text-indigo-600 dark:text-indigo-400',
            iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
        },
        {
            icon: <Upload className="w-4 h-4" />,
            labelKey: 'uploadResource',
            href: '/resources/upload',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
        },
    ]

    // Hide on coming-soon page
    if (pathname?.includes('/coming-soon')) {
        return null
    }

    return (
        <div className={cn('fixed bottom-6 right-6 z-50 global-fab', className)}>
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
                    'absolute bottom-16 right-0 transition-all duration-200',
                    isOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-4 pointer-events-none'
                )}
            >
                {/* Bounded panel container */}
                <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl shadow-xl p-2 space-y-1.5">
                    {actions.map((action, index) => (
                        action.href ? (
                            <Link
                                key={index}
                                href={action.href}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50 hover:bg-gray-100 dark:hover:bg-dark-border/50 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {/* Icon in chamfered rectangle */}
                                <span className={cn(
                                    'flex items-center justify-center w-8 h-8 rounded-md',
                                    action.iconBg,
                                    action.iconColor
                                )}>
                                    {action.icon}
                                </span>
                                <span className="text-sm font-medium text-text dark:text-dark-text whitespace-nowrap">
                                    {t(action.labelKey)}
                                </span>
                            </Link>
                        ) : (
                            <button
                                key={index}
                                onClick={() => {
                                    action.onClick?.()
                                    setIsOpen(false)
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50 hover:bg-gray-100 dark:hover:bg-dark-border/50 transition-colors"
                            >
                                {/* Icon in chamfered rectangle */}
                                <span className={cn(
                                    'flex items-center justify-center w-8 h-8 rounded-md',
                                    action.iconBg,
                                    action.iconColor
                                )}>
                                    {action.icon}
                                </span>
                                <span className="text-sm font-medium text-text dark:text-dark-text whitespace-nowrap">
                                    {t(action.labelKey)}
                                </span>
                            </button>
                        )
                    ))}
                </div>
            </div>

            {/* Main FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'fab fab-primary w-14 h-14 transition-all duration-200',
                    isOpen && 'rotate-45 bg-gray-600 hover:bg-gray-700'
                )}
                aria-label={isOpen ? t('closeMenu') : t('openMenu')}
                aria-expanded={isOpen}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </button>
        </div>
    )
}
