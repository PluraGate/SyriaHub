'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, CheckCircle, ExternalLink, FileSearch, X, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface PlagiarismMatch {
    source_url?: string
    source_title?: string
    matched_text?: string
    similarity?: number
}

interface PlagiarismDetailsProps {
    postId?: string
    postVersionId?: string
    score?: number
    matches?: PlagiarismMatch[]
    variant?: 'badge' | 'inline' | 'full'
}

/**
 * Displays plagiarism check results with:
 * - Visual similarity percentage
 * - Matched source links
 * - Highlighted matched text (in modal)
 */
export function PlagiarismDetails({
    postId,
    postVersionId,
    score: initialScore,
    matches: initialMatches,
    variant = 'badge'
}: PlagiarismDetailsProps) {
    const [score, setScore] = useState<number | null>(initialScore ?? null)
    const [matches, setMatches] = useState<PlagiarismMatch[]>(initialMatches || [])
    const [loading, setLoading] = useState(!initialScore && !initialMatches)
    const [showModal, setShowModal] = useState(false)
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        if (initialScore !== undefined || initialMatches) {
            setLoading(false)
            return
        }

        async function fetchPlagiarismData() {
            try {
                const { data, error } = await supabase
                    .from('plagiarism_checks')
                    .select('score, sources, status, flagged')
                    .eq(postVersionId ? 'post_version_id' : 'post_id', postVersionId || postId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single()

                if (error) {
                    // No plagiarism check exists yet
                    setScore(null)
                    return
                }

                setScore(data.score / 100) // Normalize to 0-1

                // Parse sources if available
                if (data.sources) {
                    try {
                        const parsedSources = typeof data.sources === 'string'
                            ? JSON.parse(data.sources)
                            : data.sources
                        setMatches(parsedSources)
                    } catch {
                        setMatches([])
                    }
                }
            } catch (error) {
                console.error('Error fetching plagiarism data:', error)
            } finally {
                setLoading(false)
            }
        }

        if (postId || postVersionId) {
            fetchPlagiarismData()
        }
    }, [postId, postVersionId, initialScore, initialMatches, supabase])

    if (loading) {
        return variant === 'badge' ? null : (
            <div className="animate-pulse h-4 w-20 bg-gray-200 dark:bg-dark-surface rounded" />
        )
    }

    // No plagiarism data or score is below threshold
    if (score === null || score < 0.3) {
        return null
    }

    const isHighRisk = score >= 0.7
    const isMediumRisk = score >= 0.5

    const getColorClasses = () => {
        if (isHighRisk) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
        if (isMediumRisk) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
    }

    const percentScore = Math.round(score * 100)

    // Badge variant - compact inline display
    if (variant === 'badge') {
        return (
            <>
                <button
                    onClick={() => setShowModal(true)}
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${getColorClasses()} hover:opacity-80 transition-opacity`}
                >
                    <AlertTriangle className="w-3 h-3" />
                    <span>{percentScore}% match</span>
                </button>

                <PlagiarismModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    score={score}
                    matches={matches}
                />
            </>
        )
    }

    // Inline variant - for cards/lists
    if (variant === 'inline') {
        return (
            <>
                <div className={`flex items-center gap-2 p-3 rounded-lg border ${getColorClasses()}`}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">
                            {isHighRisk ? 'High similarity detected' : 'Potential similarity detected'}
                        </span>
                        <span className="text-sm opacity-75 ml-1">({percentScore}% match)</span>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowModal(true)}
                        className="gap-1 text-xs"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                    </Button>
                </div>

                <PlagiarismModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    score={score}
                    matches={matches}
                />
            </>
        )
    }

    // Full variant - expanded view
    return (
        <>
            <div className={`p-4 rounded-xl border ${getColorClasses()}`}>
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/50 dark:bg-black/20">
                        <FileSearch className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                            {isHighRisk ? '⚠️ High Similarity Alert' : 'Similarity Notice'}
                        </h4>
                        <p className="text-sm mt-1 opacity-80">
                            This content shows {percentScore}% similarity with existing sources.
                        </p>

                        {/* Similarity Bar */}
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span>Similarity Score</span>
                                <span className="font-medium">{percentScore}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/50 dark:bg-black/20 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${isHighRisk ? 'bg-red-500' : isMediumRisk ? 'bg-orange-500' : 'bg-yellow-500'
                                        }`}
                                    style={{ width: `${percentScore}%` }}
                                />
                            </div>
                        </div>

                        {/* Sources Preview */}
                        {matches.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <span className="text-xs font-medium">Matched Sources:</span>
                                {matches.slice(0, 2).map((match, idx) => (
                                    <div key={idx} className="text-xs flex items-center gap-2">
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">
                                            {match.source_title || match.source_url || `Source ${idx + 1}`}
                                        </span>
                                    </div>
                                ))}
                                {matches.length > 2 && (
                                    <span className="text-xs opacity-75">+{matches.length - 2} more</span>
                                )}
                            </div>
                        )}

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowModal(true)}
                            className="mt-4 gap-1"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            View Matched Text
                        </Button>
                    </div>
                </div>
            </div>

            <PlagiarismModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                score={score}
                matches={matches}
            />
        </>
    )
}

interface PlagiarismModalProps {
    isOpen: boolean
    onClose: () => void
    score: number
    matches: PlagiarismMatch[]
}

function PlagiarismModal({ isOpen, onClose, score, matches }: PlagiarismModalProps) {
    const percentScore = Math.round(score * 100)
    const isHighRisk = score >= 0.7

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSearch className="w-5 h-5" />
                        Plagiarism Check Results
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 overflow-y-auto flex-1 pr-2">
                    {/* Score Summary */}
                    <div className={`p-4 rounded-xl ${isHighRisk
                            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                        }`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">Overall Similarity</span>
                            <span className={`text-2xl font-bold ${isHighRisk ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                                }`}>
                                {percentScore}%
                            </span>
                        </div>
                        <div className="h-3 rounded-full bg-white/50 dark:bg-black/20 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${isHighRisk ? 'bg-red-500' : 'bg-yellow-500'}`}
                                style={{ width: `${percentScore}%` }}
                            />
                        </div>
                        <p className="text-xs mt-2 opacity-75">
                            {isHighRisk
                                ? 'This content has significant overlap with existing sources. Review recommended.'
                                : 'Some similarity detected. May require attribution or revision.'}
                        </p>
                    </div>

                    {/* Matched Sources */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3">Matched Sources ({matches.length})</h3>
                        {matches.length === 0 ? (
                            <p className="text-sm text-text-light dark:text-dark-text-muted">
                                Detailed source information not available.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {matches.map((match, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h4 className="font-medium text-sm">
                                                {match.source_title || `Source ${idx + 1}`}
                                            </h4>
                                            {match.similarity !== undefined && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-dark-surface">
                                                    {Math.round(match.similarity * 100)}% match
                                                </span>
                                            )}
                                        </div>

                                        {match.source_url && (
                                            <a
                                                href={match.source_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline flex items-center gap-1 mb-2"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                {match.source_url}
                                            </a>
                                        )}

                                        {match.matched_text && (
                                            <div className="mt-2 p-3 rounded bg-yellow-50 dark:bg-yellow-900/10 border-l-2 border-yellow-400">
                                                <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400 block mb-1">
                                                    Matched Text:
                                                </span>
                                                <p className="text-sm text-text-light dark:text-dark-text-muted italic">
                                                    "{match.matched_text}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Help Text */}
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <h4 className="font-medium text-sm text-blue-700 dark:text-blue-400 mb-1">
                            What should I do?
                        </h4>
                        <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                            <li>• Review the matched sections and add proper citations if needed</li>
                            <li>• Paraphrase or rewrite content that's too similar to sources</li>
                            <li>• If you believe this is a false positive, you can file an appeal</li>
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
