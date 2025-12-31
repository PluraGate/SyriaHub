'use client'

import { formatDistanceToNow, differenceInDays } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import Link from 'next/link'
import {
    Vote,
    ClipboardList,
    ArrowRight,
    Clock
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

interface UnansweredItem {
    id: string
    title: string
    type: 'poll' | 'survey'
    end_date?: string | null
    created_at: string
}

interface UnansweredResearchProps {
    items: UnansweredItem[]
    totalCount: number
}

export function UnansweredResearch({ items, totalCount }: UnansweredResearchProps) {
    const t = useTranslations('ResearchLab')
    const locale = useLocale()
    const dateLocale = locale === 'ar' ? ar : enUS

    // Hide section entirely if empty
    if (items.length === 0) {
        return null
    }

    const hasMore = totalCount > items.length

    const getTimeStatus = (endDate?: string | null) => {
        if (!endDate) return t('unanswered.open')

        const end = new Date(endDate)
        const now = new Date()

        if (end < now) return null // Already closed, shouldn't be shown

        const daysLeft = differenceInDays(end, now)

        if (daysLeft === 0) {
            return t('unanswered.closesToday')
        } else if (daysLeft === 1) {
            return t('unanswered.closesTomorrow')
        } else if (daysLeft <= 7) {
            return t('unanswered.closesInDays', { days: daysLeft })
        }

        return t('unanswered.open')
    }

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
            {/* Section Header - Restrained */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-text dark:text-dark-text">
                    {t('unanswered.title')}
                </h2>
                {hasMore && (
                    <Link
                        href="/research-lab/polls"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                        {t('unanswered.viewAll')}
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                )}
            </div>

            {/* Items List - Clean and minimal */}
            <div className="space-y-2">
                {items.map((item) => {
                    const timeStatus = getTimeStatus(item.end_date)
                    const href = item.type === 'poll'
                        ? '/research-lab/polls'
                        : `/research-lab/surveys/${item.id}/take`

                    return (
                        <div
                            key={`${item.type}-${item.id}`}
                            className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-dark-surface rounded-lg border border-gray-100 dark:border-dark-border"
                        >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* Type Icon - Subtle */}
                                <div className={`p-1.5 rounded-md shrink-0 ${item.type === 'poll'
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                                    : 'bg-blue-50 dark:bg-blue-900/20'
                                    }`}>
                                    {item.type === 'poll' ? (
                                        <Vote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <ClipboardList className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    )}
                                </div>

                                {/* Title and Meta */}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-text dark:text-dark-text truncate">
                                        {item.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-text-light dark:text-dark-text-muted">
                                        <span className="capitalize">
                                            {t(`unanswered.type.${item.type}`)}
                                        </span>
                                        {timeStatus && (
                                            <>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {timeStatus}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Single CTA */}
                            <Link
                                href={href}
                                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors shrink-0"
                            >
                                {t('unanswered.participate')}
                            </Link>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
