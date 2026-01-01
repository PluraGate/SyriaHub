'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { BookOpen, ExternalLink, ChevronRight, X } from 'lucide-react'
import type { Precedent } from '@/lib/hooks/usePrecedents'

interface PrecedentCardProps {
    precedents: Precedent[]
    loading: boolean
    className?: string
}

/**
 * PrecedentCard
 * 
 * Displays relevant historical case studies based on detected patterns.
 * Pure presentational component.
 */
export function PrecedentCard({ precedents, loading, className = '' }: PrecedentCardProps) {
    const t = useTranslations('Spatial')
    const locale = useLocale()
    const [dismissed, setDismissed] = useState(false)

    if (dismissed || (precedents.length === 0 && !loading)) {
        return null
    }

    return (
        <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 ${className}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        {t('relatedCaseStudies')}
                    </h4>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30"
                    aria-label={t('dismissFlag')}
                >
                    <X className="w-3.5 h-3.5 text-blue-500" />
                </button>
            </div>

            {loading ? (
                <div className="text-sm text-blue-600 dark:text-blue-300">{t('loading')}</div>
            ) : (
                <div className="space-y-2">
                    {precedents.map(precedent => (
                        <div
                            key={precedent.id}
                            className="bg-white/50 dark:bg-blue-900/30 rounded-lg p-3"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded">
                                            {precedent.pattern_id}
                                        </span>
                                        {precedent.trust_level === 'high' && (
                                            <span className="text-xs text-green-600 dark:text-green-400">
                                                ✓ {t('verified')}
                                            </span>
                                        )}
                                    </div>
                                    <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 line-clamp-1">
                                        {locale === 'ar' && precedent.title_ar ? precedent.title_ar : precedent.title}
                                    </h5>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 line-clamp-2 mt-0.5">
                                        {locale === 'ar' && precedent.summary_ar ? precedent.summary_ar : precedent.summary}
                                    </p>
                                </div>
                                {precedent.source_url && (
                                    <a
                                        href={precedent.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/50"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-xs text-blue-500 dark:text-blue-400 mt-2 flex items-center gap-1">
                <ChevronRight className="w-3 h-3" />
                {t('caseStudiesFromSimilar')}
            </p>
        </div>
    )
}

