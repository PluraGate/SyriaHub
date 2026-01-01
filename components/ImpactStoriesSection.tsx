'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { ResearchOutcomeCard } from './ResearchOutcomeCard'
import { Award, ArrowRight, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

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

interface ImpactStoriesSectionProps {
    limit?: number
    className?: string
}

export function ImpactStoriesSection({ limit = 3, className }: ImpactStoriesSectionProps) {
    const t = useTranslations('ResearchImpact')
    const [outcomes, setOutcomes] = useState<ResearchOutcome[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchOutcomes() {
            const supabase = createClient()

            const { data, error } = await supabase
                .from('research_outcomes')
                .select(`
                    id,
                    gap_id,
                    resolving_post_id,
                    external_url,
                    external_title,
                    external_authors,
                    publication_date,
                    outcome_type,
                    impact_description,
                    verified_at,
                    created_by,
                    created_at,
                    research_gaps!gap_id (title),
                    posts!resolving_post_id (title),
                    users!created_by (name)
                `)
                .not('verified_at', 'is', null)
                .order('verified_at', { ascending: false })
                .limit(limit)

            if (!error && data) {
                const formatted = data.map((item: Record<string, unknown>) => ({
                    ...item,
                    gap_title: (item.research_gaps as Record<string, string> | null)?.title,
                    resolving_post_title: (item.posts as Record<string, string> | null)?.title,
                    creator_name: (item.users as Record<string, string> | null)?.name
                })) as ResearchOutcome[]
                setOutcomes(formatted)
            }
            setLoading(false)
        }

        fetchOutcomes()
    }, [limit])

    // Don't render if no outcomes
    if (!loading && outcomes.length === 0) {
        return null
    }

    return (
        <section className={cn('py-12', className)}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-text dark:text-dark-text">
                                {t('impactStoriesTitle')}
                            </h2>
                            <p className="text-sm text-text-muted dark:text-dark-text-muted">
                                {t('impactStoriesSubtitle')}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/research-outcomes"
                        className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary dark:text-primary-light hover:underline"
                    >
                        {t('viewAll')}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Epistemic note */}
                <div className="mb-6 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
                    <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-800 dark:text-amber-200">
                            {t('epistemicNote')}
                        </p>
                    </div>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: limit }).map((_, i) => (
                            <div
                                key={i}
                                className="h-64 rounded-xl bg-gray-100 dark:bg-dark-surface animate-pulse"
                            />
                        ))}
                    </div>
                )}

                {/* Outcomes grid */}
                {!loading && outcomes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {outcomes.map((outcome) => (
                            <ResearchOutcomeCard key={outcome.id} outcome={outcome} />
                        ))}
                    </div>
                )}

                {/* Mobile view all link */}
                <div className="mt-6 sm:hidden">
                    <Link
                        href="/research-outcomes"
                        className="flex items-center justify-center gap-1.5 w-full py-3 text-sm font-medium text-primary dark:text-primary-light border border-primary/30 dark:border-primary-light/30 rounded-lg hover:bg-primary/5 transition-colors"
                    >
                        {t('viewAll')}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
