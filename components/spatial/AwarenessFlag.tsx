'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { AlertTriangle, X, Info, ChevronRight } from 'lucide-react'
import type { DetectedPattern } from '@/domain/spatial/patternDetector'

interface AwarenessFlagProps {
    patterns: DetectedPattern[]
    className?: string
}

/**
 * Awareness Flag UI
 * 
 * Displays detected spatial patterns as dismissible, session-only flags.
 * Uses plain language only - patterns suggest questions, not answers.
 */
export function AwarenessFlag({ patterns, className = '' }: AwarenessFlagProps) {
    const t = useTranslations('Spatial')
    const locale = useLocale()
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

    // Filter out dismissed patterns
    const visiblePatterns = patterns.filter(p => !dismissedIds.has(p.id))

    if (visiblePatterns.length === 0) {
        return null
    }

    const handleDismiss = (patternId: string) => {
        setDismissedIds(prev => new Set([...prev, patternId]))
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {visiblePatterns.map((pattern) => (
                <div
                    key={pattern.id}
                    className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 relative"
                    role="alert"
                    aria-live="polite"
                >
                    {/* Dismiss button */}
                    <button
                        onClick={() => handleDismiss(pattern.id)}
                        className="absolute top-2 right-2 p-1 rounded-lg 
                                   hover:bg-amber-100 dark:hover:bg-amber-800/30 
                                   transition-colors"
                        aria-label={t('dismissFlag')}
                    >
                        <X className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </button>

                    <div className="flex items-start gap-3 pr-6">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                {locale === 'ar' ? pattern.message_ar : pattern.message}
                            </p>

                            {/* Language-first confidence indicator - avoids false precision */}
                            {pattern.confidence && (
                                <div className="mt-1.5 flex items-center gap-2 group cursor-help"
                                    title={`${Math.round(pattern.confidence * 100)}% confidence`}>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${pattern.confidence >= 0.85
                                        ? 'bg-amber-200 dark:bg-amber-700/50 text-amber-800 dark:text-amber-200'
                                        : pattern.confidence >= 0.70
                                            ? 'bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300'
                                            : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                        }`}>
                                        {pattern.confidence >= 0.85
                                            ? t('confidenceStrong')
                                            : pattern.confidence >= 0.70
                                                ? t('confidenceModerate')
                                                : t('confidenceWeak')}
                                    </span>
                                    <span className="text-[10px] text-amber-400 dark:text-amber-500/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {Math.round(pattern.confidence * 100)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Info footer - only show once if patterns are visible */}
            <p className="text-xs text-text-light dark:text-dark-text-muted flex items-center gap-1 px-1">
                <AlertTriangle className="w-3 h-3" />
                {t('patternDisclaimer')}
            </p>
        </div>
    )
}
