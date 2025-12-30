'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
    ExternalLink,
    FileText,
    Database,
    Presentation,
    Newspaper,
    FileCheck,
    CheckCircle2,
    Calendar,
    User,
    Link2
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useDateFormatter } from '@/hooks/useDateFormatter'

interface ResearchOutcome {
    id: string
    gap_id?: string
    gap_title?: string
    resolving_post_id?: string
    resolving_post_title?: string
    external_url?: string
    external_title?: string
    external_authors?: string
    publication_date?: string
    outcome_type: 'publication' | 'policy' | 'dataset' | 'presentation' | 'media' | 'report'
    impact_description?: string
    verified_at?: string
    created_by?: string
    creator_name?: string
    created_at: string
}

interface ResearchOutcomeCardProps {
    outcome: ResearchOutcome
    variant?: 'default' | 'compact'
    className?: string
}

const outcomeTypeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
    publication: { icon: FileText, label: 'Publication', color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30' },
    policy: { icon: FileCheck, label: 'Policy', color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30' },
    dataset: { icon: Database, label: 'Dataset', color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30' },
    presentation: { icon: Presentation, label: 'Presentation', color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30' },
    media: { icon: Newspaper, label: 'Media', color: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30' },
    report: { icon: FileText, label: 'Report', color: 'text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/30' }
}

export function ResearchOutcomeCard({ outcome, variant = 'default', className }: ResearchOutcomeCardProps) {
    const { formatDate } = useDateFormatter()
    const t = useTranslations('ResearchImpact')

    const typeConfig = outcomeTypeConfig[outcome.outcome_type] || outcomeTypeConfig.publication
    const TypeIcon = typeConfig.icon

    if (variant === 'compact') {
        return (
            <div className={cn(
                'flex items-start gap-3 p-3 rounded-lg',
                'bg-gray-50 dark:bg-dark-surface/50',
                'border border-gray-100 dark:border-dark-border',
                className
            )}>
                <div className={cn('p-1.5 rounded-md', typeConfig.color)}>
                    <TypeIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-text dark:text-dark-text line-clamp-1">
                        {outcome.external_title || outcome.resolving_post_title || t('untitledOutcome')}
                    </h4>
                    <p className="text-xs text-text-muted dark:text-dark-text-muted mt-0.5">
                        {t(`outcomeType.${outcome.outcome_type}`)}
                        {outcome.publication_date && (
                            <> · {formatDate(outcome.publication_date, 'short')}</>
                        )}
                    </p>
                </div>
                {outcome.external_url && (
                    <a
                        href={outcome.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-text-muted hover:text-primary transition-colors"
                        aria-label={t('viewExternal')}
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                )}
            </div>
        )
    }

    return (
        <article className={cn(
            'p-5 rounded-xl',
            'bg-white dark:bg-dark-surface',
            'border border-gray-200 dark:border-dark-border',
            'transition-all duration-200 hover:shadow-soft-md',
            className
        )}>
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
                <div className={cn('p-2 rounded-lg', typeConfig.color)}>
                    <TypeIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <span className={cn(
                        'inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-1',
                        typeConfig.color
                    )}>
                        {t(`outcomeType.${outcome.outcome_type}`)}
                    </span>
                    <h3 className="text-lg font-semibold text-text dark:text-dark-text leading-tight">
                        {outcome.external_title || outcome.resolving_post_title || t('untitledOutcome')}
                    </h3>
                </div>
                {outcome.verified_at && (
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('verified')}</span>
                    </div>
                )}
            </div>

            {/* Authors */}
            {outcome.external_authors && (
                <div className="flex items-center gap-2 text-sm text-text-muted dark:text-dark-text-muted mb-3">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">{outcome.external_authors}</span>
                </div>
            )}

            {/* Impact Description - uses hedging language */}
            {outcome.impact_description && (
                <p className="text-sm text-text-light dark:text-dark-text-muted mb-4 italic">
                    &quot;{outcome.impact_description}&quot;
                </p>
            )}

            {/* Links */}
            <div className="flex flex-wrap gap-2 mb-4">
                {outcome.resolving_post_id && (
                    <Link
                        href={`/post/${outcome.resolving_post_id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                            bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light
                            hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                    >
                        <Link2 className="w-3.5 h-3.5" />
                        {t('viewSyriaHubPost')}
                    </Link>
                )}
                {outcome.external_url && (
                    <a
                        href={outcome.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                            bg-gray-100 text-text-muted dark:bg-dark-border dark:text-dark-text-muted
                            hover:bg-gray-200 dark:hover:bg-dark-border/80 transition-colors"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {t('viewExternal')}
                    </a>
                )}
            </div>

            {/* Linked Gap */}
            {outcome.gap_id && outcome.gap_title && (
                <div className="pt-3 border-t border-gray-100 dark:border-dark-border">
                    <p className="text-xs text-text-muted dark:text-dark-text-muted mb-1">
                        {t('mayHaveAddressed')}
                    </p>
                    <Link
                        href={`/research-gaps?highlight=${outcome.gap_id}`}
                        className="text-sm font-medium text-primary dark:text-primary-light hover:underline"
                    >
                        {outcome.gap_title}
                    </Link>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-dark-border text-xs text-text-muted dark:text-dark-text-muted">
                {outcome.publication_date && (
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(outcome.publication_date, 'medium')}</span>
                    </div>
                )}
                {outcome.creator_name && (
                    <span>{t('submittedBy', { name: outcome.creator_name })}</span>
                )}
            </div>
        </article>
    )
}
