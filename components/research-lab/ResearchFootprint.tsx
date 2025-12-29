'use client'

import { formatDistanceToNow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'
import Link from 'next/link'
import {
    Vote,
    ClipboardList,
    ArrowRight,
    Clock,
    TrendingUp,
    BarChart2
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

interface ParticipationStats {
    pollsVoted: number
    surveysCompleted: number
    lastActivity?: {
        type: 'poll' | 'survey'
        title: string
        id: string
        date: string
    }
    recentPolls: Array<{
        id: string
        question: string
        total_votes: number
        voted_at: string
    }>
    recentSurveys: Array<{
        id: string
        title: string
        response_count: number
        completed_at: string
    }>
}

interface ResearchFootprintProps {
    stats: ParticipationStats
}

export function ResearchFootprint({ stats }: ResearchFootprintProps) {
    const t = useTranslations('ResearchLab')
    const locale = useLocale()
    const dateLocale = locale === 'ar' ? ar : enUS

    const totalParticipation = stats.pollsVoted + stats.surveysCompleted
    const hasAnyParticipation = totalParticipation > 0

    if (!hasAnyParticipation && !stats.recentPolls.length && !stats.recentSurveys.length) {
        return null // Don't show section if user has no participation
    }

    // Calculate progress percentage (just for visual, capped at 100%)
    const progressPercent = Math.min(100, (totalParticipation / 10) * 100)

    return (
        <section className="py-8">
            <div className="container-custom">
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-display font-semibold text-text dark:text-dark-text">
                            {t('footprint.title')}
                        </h2>
                        <p className="text-sm text-text-light dark:text-dark-text-muted">
                            {t('footprint.subtitle')}
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Your Participation Summary Card */}
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <h3 className="text-sm font-medium text-text-light dark:text-dark-text-muted mb-4">
                            {t('footprint.summary')}
                        </h3>

                        <div className="space-y-4">
                            {/* Poll Votes */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Vote className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm text-text dark:text-dark-text">
                                        {t('footprint.pollsVoted')}
                                    </span>
                                </div>
                                <span className="text-lg font-bold text-text dark:text-dark-text">
                                    {stats.pollsVoted}
                                </span>
                            </div>

                            {/* Survey Completions */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm text-text dark:text-dark-text">
                                        {t('footprint.surveysCompleted')}
                                    </span>
                                </div>
                                <span className="text-lg font-bold text-text dark:text-dark-text">
                                    {stats.surveysCompleted}
                                </span>
                            </div>

                            {/* Last Activity */}
                            {stats.lastActivity && (
                                <div className="pt-3 border-t border-gray-100 dark:border-dark-border">
                                    <div className="flex items-center gap-1.5 text-xs text-text-light dark:text-dark-text-muted mb-1">
                                        <Clock className="w-3 h-3" />
                                        {t('footprint.lastActivity')}
                                    </div>
                                    <Link
                                        href={stats.lastActivity.type === 'poll'
                                            ? `/research-lab/polls`
                                            : `/research-lab/surveys/${stats.lastActivity.id}`}
                                        className="text-sm text-primary hover:underline line-clamp-1"
                                    >
                                        {stats.lastActivity.title}
                                    </Link>
                                    <div className="text-xs text-text-light dark:text-dark-text-muted mt-0.5">
                                        {formatDistanceToNow(new Date(stats.lastActivity.date), {
                                            addSuffix: true,
                                            locale: dateLocale
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Subtle Progress Bar */}
                            {hasAnyParticipation && (
                                <div className="pt-3">
                                    <div className="flex items-center justify-between text-xs text-text-light dark:text-dark-text-muted mb-1">
                                        <span>{t('footprint.engagementLevel')}</span>
                                        <span>{totalParticipation} / 10+</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 dark:bg-dark-bg rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-500"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Research You Engaged With */}
                    <div className="md:col-span-2 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-text-light dark:text-dark-text-muted">
                                {t('footprint.engagedResearch')}
                            </h3>
                            <Link
                                href="/research-lab/polls"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                                {t('footprint.viewAll')}
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-dark-border">
                            {/* Recent Polls */}
                            {stats.recentPolls.slice(0, 2).map((poll) => (
                                <Link
                                    key={poll.id}
                                    href="/research-lab/polls"
                                    className="flex items-center gap-3 py-3 group hover:bg-gray-50 dark:hover:bg-dark-bg -mx-2 px-2 rounded-lg transition-colors"
                                >
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shrink-0">
                                        <Vote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text dark:text-dark-text truncate group-hover:text-primary transition-colors">
                                            {poll.question}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-text-light dark:text-dark-text-muted mt-0.5">
                                            <span>{poll.total_votes} {t('footprint.votes')}</span>
                                            <span>•</span>
                                            <span>
                                                {formatDistanceToNow(new Date(poll.voted_at), {
                                                    addSuffix: true,
                                                    locale: dateLocale
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <BarChart2 className="w-4 h-4 text-gray-300 dark:text-dark-border group-hover:text-primary transition-colors" />
                                </Link>
                            ))}

                            {/* Recent Surveys */}
                            {stats.recentSurveys.slice(0, 2).map((survey) => (
                                <Link
                                    key={survey.id}
                                    href={`/research-lab/surveys/${survey.id}`}
                                    className="flex items-center gap-3 py-3 group hover:bg-gray-50 dark:hover:bg-dark-bg -mx-2 px-2 rounded-lg transition-colors"
                                >
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                                        <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text dark:text-dark-text truncate group-hover:text-primary transition-colors">
                                            {survey.title}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-text-light dark:text-dark-text-muted mt-0.5">
                                            <span>{survey.response_count} {t('footprint.responses')}</span>
                                            <span>•</span>
                                            <span>
                                                {formatDistanceToNow(new Date(survey.completed_at), {
                                                    addSuffix: true,
                                                    locale: dateLocale
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <BarChart2 className="w-4 h-4 text-gray-300 dark:text-dark-border group-hover:text-primary transition-colors" />
                                </Link>
                            ))}

                            {/* Empty State */}
                            {stats.recentPolls.length === 0 && stats.recentSurveys.length === 0 && (
                                <div className="py-8 text-center">
                                    <p className="text-sm text-text-light dark:text-dark-text-muted">
                                        {t('footprint.noRecentActivity')}
                                    </p>
                                    <div className="flex items-center justify-center gap-4 mt-4">
                                        <Link
                                            href="/research-lab/polls"
                                            className="btn btn-outline btn-sm"
                                        >
                                            {t('footprint.viewPolls')}
                                        </Link>
                                        <Link
                                            href="/research-lab/surveys"
                                            className="btn btn-outline btn-sm"
                                        >
                                            {t('footprint.viewSurveys')}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
