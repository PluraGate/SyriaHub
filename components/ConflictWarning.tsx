'use client'

import { AlertTriangle, ExternalLink, FileText, Info } from 'lucide-react'
import Link from 'next/link'
import type { DataConflict } from '@/types/advanced'

interface ConflictWarningProps {
    conflicts: DataConflict[]
    compact?: boolean
}

export function ConflictWarning({ conflicts, compact = false }: ConflictWarningProps) {
    if (!conflicts || conflicts.length === 0) return null

    if (compact) {
        return (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{conflicts.length} data conflict{conflicts.length !== 1 ? 's' : ''} detected</span>
            </div>
        )
    }

    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
                <div className="shrink-0 p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                        Data Conflict Detected
                    </h4>

                    <div className="space-y-3">
                        {conflicts.map((conflict) => (
                            <ConflictItem key={conflict.id} conflict={conflict} />
                        ))}
                    </div>

                    <p className="mt-3 text-xs text-red-600/80 dark:text-red-400/80">
                        Contradictions are surfaced, not averaged. Review both sources to understand the discrepancy.
                    </p>
                </div>
            </div>
        </div>
    )
}

interface ConflictItemProps {
    conflict: DataConflict
}

function ConflictItem({ conflict }: ConflictItemProps) {
    const getConflictTypeLabel = (type: string) => {
        switch (type) {
            case 'existence': return 'Existence Conflict'
            case 'state': return 'State/Condition Conflict'
            case 'attribute': return 'Attribute Conflict'
            case 'temporal': return 'Temporal Conflict'
            default: return 'Data Conflict'
        }
    }

    const getResolutionBadge = (resolution: string) => {
        switch (resolution) {
            case 'field_wins':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Field data prioritized</span>
            case 'external_wins':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">External data prioritized</span>
            case 'needs_review':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">Needs review</span>
            case 'unresolved':
                return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">Unresolved</span>
            default:
                return null
        }
    }

    return (
        <div className="bg-white/50 dark:bg-dark-bg/50 rounded-lg p-3 text-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-red-700 dark:text-red-300">
                    {getConflictTypeLabel(conflict.conflict_type)}
                </span>
                {getResolutionBadge(conflict.resolution)}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* External claim */}
                <div className="space-y-1">
                    <div className="text-xs text-text-light flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        External ({conflict.external_source_id.toUpperCase()})
                    </div>
                    <p className="text-red-600 dark:text-red-400">{conflict.external_claim}</p>
                    {conflict.external_timestamp && (
                        <p className="text-xs text-text-light">
                            {new Date(conflict.external_timestamp).toLocaleDateString()}
                        </p>
                    )}
                </div>

                {/* Field claim */}
                <div className="space-y-1">
                    <div className="text-xs text-text-light flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Field Data
                    </div>
                    <p className="text-green-600 dark:text-green-400">{conflict.field_claim}</p>
                    {conflict.field_timestamp && (
                        <p className="text-xs text-text-light">
                            {new Date(conflict.field_timestamp).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            {conflict.conflict_detail && (
                <p className="mt-2 text-xs text-text-light border-t border-red-200 dark:border-red-800 pt-2">
                    {conflict.conflict_detail}
                </p>
            )}

            {conflict.suggested_action && !conflict.action_taken && (
                <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <Info className="w-3 h-3" />
                    Suggested: {conflict.suggested_action.replace(/_/g, ' ')}
                </div>
            )}
        </div>
    )
}

// Inline warning for search results
interface InlineConflictBadgeProps {
    count: number
    onClick?: () => void
}

export function InlineConflictBadge({ count, onClick }: InlineConflictBadgeProps) {
    if (count === 0) return null

    return (
        <button
            onClick={onClick}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
            <AlertTriangle className="w-3 h-3" />
            {count} conflict{count !== 1 ? 's' : ''}
        </button>
    )
}
