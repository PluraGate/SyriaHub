'use client'

import { CheckCircle, AlertTriangle, HelpCircle, Clock, Users, FileText, Link2 } from 'lucide-react'
import type { TrustProfile } from '@/types/advanced'

interface TrustProfileCardProps {
    profile: TrustProfile
    compact?: boolean
}

export function TrustProfileCard({ profile, compact = false }: TrustProfileCardProps) {
    const dimensions = [
        { key: 't1', label: 'Source', score: profile.t1_source_score, icon: Users },
        { key: 't2', label: 'Method', score: profile.t2_method_score, icon: FileText },
        { key: 't3', label: 'Proximity', score: profile.t3_proximity_score, icon: Link2 },
        { key: 't4', label: 'Temporal', score: profile.t4_temporal_score, icon: Clock },
        { key: 't5', label: 'Validation', score: profile.t5_validation_score, icon: CheckCircle },
    ]

    const avgScore = Math.round(
        (profile.t1_source_score + profile.t2_method_score + profile.t3_proximity_score +
            profile.t4_temporal_score + profile.t5_validation_score) / 5
    )

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getScoreColor(avgScore)}`} />
                <span className="text-xs text-text-light">{profile.trust_summary || 'Trust profile available'}</span>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getScoreColor(avgScore)}`} />
                    Trust Profile
                </h4>
                <span className="text-sm text-text-light">
                    Overall: {avgScore}/100
                </span>
            </div>

            {/* Trust Summary */}
            {profile.trust_summary && (
                <p className="text-sm text-text-light mb-4 italic">
                    &quot;{profile.trust_summary}&quot;
                </p>
            )}

            {/* 5 Dimension Bars */}
            <div className="space-y-3">
                {dimensions.map(({ key, label, score, icon: Icon }) => (
                    <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-text-light">
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </span>
                            <span className={getScoreTextColor(score)}>{score}</span>
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

// Compact badge version
interface TrustBadgeProps {
    score: number
    size?: 'sm' | 'md'
}

export function TrustBadge({ score, size = 'md' }: TrustBadgeProps) {
    const getLabel = (s: number) => {
        if (s >= 80) return 'High Trust'
        if (s >= 60) return 'Medium Trust'
        if (s >= 40) return 'Low Trust'
        return 'Unverified'
    }

    // More subtle badge styles per design guidelines
    const getBadgeStyle = (s: number) => {
        if (s >= 80) return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50'
        if (s >= 60) return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50'
        if (s >= 40) return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
        return 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
    }

    const sizeClasses = size === 'sm'
        ? 'text-xs px-2 py-0.5 gap-1'
        : 'text-sm px-2.5 py-1 gap-1.5'

    return (
        <span className={`inline-flex items-center rounded-md font-medium ${sizeClasses} ${getBadgeStyle(score)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${getScoreColor(score)}`} />
            {getLabel(score)}
        </span>
    )
}
