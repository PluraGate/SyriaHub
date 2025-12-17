'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { getTrailPostIds } from '@/lib/sessionContext'
import {
    Lightbulb,
    Scale,
    MapPin,
    AlertTriangle,
    HelpCircle,
    Info,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Recommendation {
    id: string
    title: string
    recommendation_category: string
    diversity_objective: string
    explanation: string
    confidence: number
}

interface EpistemicRecommendationsProps {
    postId: string
    postTags?: string[]
}

// Category metadata for UI
const CATEGORY_CONFIG = {
    contrasting_findings: {
        label: 'Contrasting Findings',
        icon: Scale,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        description: 'Content that challenges or contradicts this work'
    },
    methodological_critiques: {
        label: 'Alternative Approaches',
        icon: Lightbulb,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        description: 'Different methodological or disciplinary perspectives'
    },
    same_site_different_view: {
        label: 'Same Site, Different View',
        icon: MapPin,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        description: 'Same geographic focus with alternative interpretations'
    },
    negative_failed_outcomes: {
        label: 'Negative or Failed Outcomes',
        icon: AlertTriangle,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        description: 'Documented failures, limitations, or negative results'
    },
    what_is_still_unknown: {
        label: 'What Is Still Unknown',
        icon: HelpCircle,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        description: 'Gaps in knowledge, unvalidated claims, open questions'
    }
}

const DIVERSITY_LABELS: Record<string, string> = {
    disciplinary: 'Cross-discipline',
    evidence_type: 'Different evidence',
    temporal: 'Different time period',
    institutional: 'Different source',
    methodological: 'Different method'
}

export function EpistemicRecommendations({ postId, postTags = [] }: EpistemicRecommendationsProps) {
    const t = useTranslations('Recommendations')
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [loading, setLoading] = useState(true)
    const [isExpanded, setIsExpanded] = useState(true)
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [showReasoning, setShowReasoning] = useState<string | null>(null)

    // Category config with translated labels
    const getCategoryConfig = (cat: string) => {
        const configs: Record<string, { labelKey: string; descKey: string; icon: any; color: string; bgColor: string }> = {
            contrasting_findings: { labelKey: 'contrastingFindings', descKey: 'contrastingDesc', icon: Scale, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
            methodological_critiques: { labelKey: 'alternativeApproaches', descKey: 'alternativeDesc', icon: Lightbulb, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
            same_site_different_view: { labelKey: 'sameSite', descKey: 'sameSiteDesc', icon: MapPin, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' },
            negative_failed_outcomes: { labelKey: 'negativeOutcomes', descKey: 'negativeDesc', icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20' },
            what_is_still_unknown: { labelKey: 'stillUnknown', descKey: 'stillUnknownDesc', icon: HelpCircle, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/20' }
        }
        return configs[cat] || configs.contrasting_findings
    }

    // Diversity labels translated
    const getDiversityLabel = (objective: string) => {
        const keys: Record<string, string> = {
            disciplinary: 'crossDiscipline',
            evidence_type: 'differentEvidence',
            temporal: 'differentPeriod',
            institutional: 'differentSource',
            methodological: 'differentMethod'
        }
        return t(keys[objective] || objective)
    }

    useEffect(() => {
        async function fetchRecommendations() {
            const supabase = createClient()
            const trailIds = getTrailPostIds()

            try {
                const { data, error } = await supabase.rpc('get_diverse_recommendations', {
                    p_post_id: postId,
                    p_session_trail: trailIds,
                    p_limit_per_category: 3
                })

                if (error) {
                    // RPC function may not exist yet (migration not applied)
                    // Silently fall back to tag-based recommendations
                    await loadFallbackRecommendations()
                } else {
                    setRecommendations(data || [])
                }
            } catch (err) {
                // Network or other error - use fallback
                await loadFallbackRecommendations()
            } finally {
                setLoading(false)
            }

            async function loadFallbackRecommendations() {
                if (postTags.length === 0) return

                const supabase = createClient()
                const { data: fallbackData } = await supabase
                    .from('posts')
                    .select('id, title, tags')
                    .eq('status', 'published')
                    .neq('id', postId)
                    .overlaps('tags', postTags)
                    .limit(6)

                if (fallbackData) {
                    setRecommendations(fallbackData.map(p => ({
                        id: p.id,
                        title: p.title,
                        recommendation_category: 'contrasting_findings',
                        diversity_objective: 'disciplinary',
                        explanation: 'Related topic - consider alternative perspectives',
                        confidence: 0.5
                    })))
                }
            }
        }

        fetchRecommendations()
    }, [postId, postTags])

    if (loading) {
        return null
    }

    if (recommendations.length === 0) {
        return null
    }

    // Group by category
    const byCategory = recommendations.reduce((acc, rec) => {
        const cat = rec.recommendation_category
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(rec)
        return acc
    }, {} as Record<string, Recommendation[]>)

    const categories = Object.keys(byCategory)
    const displayCategory = activeCategory || categories[0]
    const displayRecs = byCategory[displayCategory] || []

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors border-b border-gray-100 dark:border-dark-border"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <Lightbulb className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-text dark:text-dark-text">
                            {t('title')}
                        </h3>
                        <p className="text-xs text-text-light dark:text-dark-text-muted">
                            {t('perspectives', { count: recommendations.length, categories: categories.length })}
                        </p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-text-light" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-text-light" />
                )}
            </div>

            {isExpanded && (
                <>
                    {/* Category Tabs */}
                    <div className="flex overflow-x-auto border-b border-gray-100 dark:border-dark-border">
                        {categories.map(cat => {
                            const catConfig = getCategoryConfig(cat)
                            const Icon = catConfig.icon
                            const isActive = cat === displayCategory
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${isActive
                                        ? `${catConfig.color} border-b-2 border-current`
                                        : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {t(catConfig.labelKey)}
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? catConfig.bgColor : 'bg-gray-100 dark:bg-dark-border'}`}>
                                        {byCategory[cat]?.length || 0}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Category Description */}
                    {displayCategory && (
                        <div className={`px-5 py-2 text-xs ${getCategoryConfig(displayCategory).bgColor}`}>
                            <p className="text-text-light dark:text-dark-text-muted flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                {t(getCategoryConfig(displayCategory).descKey)}
                            </p>
                        </div>
                    )}

                    {/* Recommendations List */}
                    <div className="divide-y divide-gray-100 dark:divide-dark-border">
                        {displayRecs.map(rec => (
                            <div key={rec.id} className="p-4 hover:bg-gray-50 dark:hover:bg-dark-bg/30 transition-colors">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/post/${rec.id}`}
                                            className="text-sm font-medium text-text dark:text-dark-text hover:text-primary transition-colors line-clamp-2"
                                        >
                                            {rec.title}
                                        </Link>

                                        {/* Diversity Badge */}
                                        <div className="mt-1.5 flex items-center gap-2">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-border text-text-light dark:text-dark-text-muted">
                                                {getDiversityLabel(rec.diversity_objective)}
                                            </span>
                                            <button
                                                onClick={() => setShowReasoning(showReasoning === rec.id ? null : rec.id)}
                                                className="text-xs text-primary hover:underline flex items-center gap-1"
                                            >
                                                <Info className="w-3 h-3" />
                                                {t('whyThis')}
                                            </button>
                                        </div>

                                        {/* Explanation (expanded) */}
                                        {showReasoning === rec.id && (
                                            <div className="mt-2 p-2 bg-gray-50 dark:bg-dark-bg rounded-lg text-xs text-text-light dark:text-dark-text-muted">
                                                <p><strong>{t('reason')}:</strong> {rec.explanation}</p>
                                                <p className="mt-1"><strong>{t('confidence')}:</strong> {Math.round(rec.confidence * 100)}%</p>
                                                <p className="mt-1 text-[10px] opacity-70">
                                                    {t('diversityObjective', { objective: getDiversityLabel(rec.diversity_objective) })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 bg-gray-50 dark:bg-dark-bg/50 border-t border-gray-100 dark:border-dark-border">
                        <p className="text-[10px] text-text-light dark:text-dark-text-muted text-center">
                            {t('footer')}
                        </p>
                    </div>
                </>
            )}
        </div>
    )
}
