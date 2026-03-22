'use client'

import { CheckCircle, AlertTriangle, Clock, Users, FileText, Link2, HelpCircle } from 'lucide-react'
import type { TrustProfile } from '@/types/advanced'

interface TrustProfileCardProps {
    profile: TrustProfile
    compact?: boolean
}

export function TrustProfileCard({ profile, compact = false }: TrustProfileCardProps) {
    const dimensions = [
        { key: 't1', label: 'Source',    score: profile.t1_source_score,     icon: Users },
        { key: 't2', label: 'Method',    score: profile.t2_method_score,      icon: FileText },
        { key: 't3', label: 'Proximity', score: profile.t3_proximity_score,   icon: Link2 },
        { key: 't4', label: 'Temporal',  score: profile.t4_temporal_score,    icon: Clock },
        { key: 't5', label: 'Validation',score: profile.t5_validation_score,  icon: CheckCircle },
    ]

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                {/* 5 micro-dots — one per dimension, no aggregation */}
                <div className="flex items-center gap-0.5" title="T1 Source · T2 Method · T3 Proximity · T4 Temporal · T5 Validation">
                    {dimensions.map(({ key, label, score }) => (
                        <span
                            key={key}
                            className={`w-2 h-2 rounded-full ${getScoreColor(score)}`}
                            title={`${label}: ${score}/100`}
                        />
                    ))}
                </div>
                <span className="text-xs text-text-light">
                    {profile.trust_summary || 'Trust profile available'}
                </span>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-text-light" />
                    Trust Profile
                </h4>
                {/* No composite score — five dimensions are the signal */}
            </div>

            {/* Trust Summary */}
            {profile.trust_summary && (
                <p className="text-sm text-text-light mb-4 italic">
                    &quot;{profile.trust_summary}&quot;
                </p>
            )}

            {/* 5 Dimension Bars — always shown separately, never averaged */}
            <div className="space-y-3">
                {dimensions.map(({ key, label, score, icon: Icon }) => (
                    <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-text-light">
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </span>
                            <span className={getScoreTextColor(score)}>{score}/100</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${getBarColor(score)}`}
                                style={{ width: `${score}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* T5 source independence warning */}
            {profile.t5_sources_independent === false && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Corroborating sources may not be independent — circular citation risk.</span>
                    </div>
                </div>
            )}

            {/* Contradictions Warning */}
            {profile.t5_contradicting_count > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2 text-sm text-red-700 dark:text-red-400">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-medium">Contradicted by {profile.t5_contradicting_count} source(s)</span>
                            {profile.t5_contradictions && profile.t5_contradictions.length > 0 && (
                                <p className="text-xs mt-1">{profile.t5_contradictions[0].detail}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Corroboration Info */}
            {profile.t5_corroborating_count > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    Corroborated by {profile.t5_corroborating_count} source(s)
                    {profile.t5_sources_independent === true && (
                        <span className="text-xs text-text-light">(verified independent)</span>
                    )}
                </div>
            )}

            {/* Time Sensitivity */}
            {profile.t4_is_time_sensitive && (
                <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <Clock className="w-4 h-4" />
                    Time-sensitive data
                    {profile.t4_data_timestamp && (
                        <span className="text-text-light">
                            (from {new Date(profile.t4_data_timestamp).toLocaleDateString()})
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

function getScoreColor(score: number): string {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    if (score >= 40) return 'bg-amber-500'
    return 'bg-red-500'
}

function getBarColor(score: number): string {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    if (score >= 40) return 'bg-amber-500'
    return 'bg-red-500'
}

function getScoreTextColor(score: number): string {
    if (score >= 80) return 'text-green-600 dark:text-green-400 font-medium'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
}

// Compact inline trust display — shows 5 dimension dots + summary.
// Replaces the old single-score TrustBadge.
// Accepts the full TrustProfile so no information is collapsed.
interface TrustDimensionsProps {
    profile: TrustProfile
    size?: 'sm' | 'md'
}

export function TrustDimensions({ profile, size = 'md' }: TrustDimensionsProps) {
    const dimensions = [
        { key: 't1', label: 'Source',     score: profile.t1_source_score },
        { key: 't2', label: 'Method',     score: profile.t2_method_score },
        { key: 't3', label: 'Proximity',  score: profile.t3_proximity_score },
        { key: 't4', label: 'Temporal',   score: profile.t4_temporal_score },
        { key: 't5', label: 'Validation', score: profile.t5_validation_score },
    ]

    const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

    return (
        <span className={`inline-flex items-center gap-1.5 ${textSize} text-text-light`}>
            <span className="flex items-center gap-0.5">
                {dimensions.map(({ key, label, score }) => (
                    <span
                        key={key}
                        className={`${dotSize} rounded-full ${getScoreColor(score)}`}
                        title={`${label}: ${score}/100`}
                    />
                ))}
            </span>
            {profile.trust_summary && (
                <span className="hidden sm:inline">{profile.trust_summary}</span>
            )}
        </span>
    )
}
