'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
    Scale, Clock, Users, CheckCircle, XCircle,
    MinusCircle, AlertTriangle, Loader2, ChevronRight
} from 'lucide-react'
import type { JuryCase, JuryVoteValue } from '@/types/advanced'

interface JuryPanelProps {
    userId: string
}

export function JuryPanel({ userId }: JuryPanelProps) {
    const [cases, setCases] = useState<JuryCase[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCase, setSelectedCase] = useState<JuryCase | null>(null)
    const [voteDialogOpen, setVoteDialogOpen] = useState(false)
    const supabase = useMemo(() => createClient(), [])
    const { showToast } = useToast()


    const fetchCases = useCallback(async () => {
        try {
            const response = await fetch('/api/jury?status=active')
            const data = await response.json()

            if (data.cases) {
                setCases(data.cases)
            }
        } catch (error) {
            console.error('Error fetching jury cases:', error)
            showToast('Failed to load jury cases', 'error')
        } finally {
            setLoading(false)
        }
    }, [showToast])

    useEffect(() => {
        fetchCases()
    }, [fetchCases])


    function getTimeRemaining(deadline: string): string {
        const now = new Date()
        const end = new Date(deadline)
        const diff = end.getTime() - now.getTime()

        if (diff <= 0) return 'Expired'

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        if (hours > 24) {
            const days = Math.floor(hours / 24)
            return `${days}d ${hours % 24}h remaining`
        }

        return `${hours}h ${minutes}m remaining`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (cases.length === 0) {
        return (
            <div className="text-center py-12 bg-background-alt/50 rounded-xl">
                <Scale className="w-12 h-12 mx-auto mb-4 text-text-light/50" />
                <h3 className="text-lg font-medium mb-2">No Active Jury Cases</h3>
                <p className="text-text-light">You don&apos;t have any jury assignments at the moment.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    Jury Duty
                </h2>
                <span className="text-sm text-text-light">
                    {cases.length} active case{cases.length !== 1 ? 's' : ''}
                </span>
            </div>

            {cases.map((juryCase) => (
                <JuryCaseCard
                    key={juryCase.id}
                    juryCase={juryCase}
                    timeRemaining={getTimeRemaining(juryCase.deadline)}
                    onVote={() => {
                        setSelectedCase(juryCase)
                        setVoteDialogOpen(true)
                    }}
                />
            ))}

            {selectedCase && (
                <VoteDialog
                    open={voteDialogOpen}
                    onClose={() => setVoteDialogOpen(false)}
                    juryCase={selectedCase}
                    onVoteSubmitted={() => {
                        setVoteDialogOpen(false)
                        fetchCases()
                    }}
                />
            )}
        </div>
    )
}

interface JuryCaseCardProps {
    juryCase: JuryCase
    timeRemaining: string
    onVote: () => void
}

function JuryCaseCard({ juryCase, timeRemaining, onVote }: JuryCaseCardProps) {
    const appeal = juryCase.appeal
    const isUrgent = timeRemaining.includes('h') && !timeRemaining.includes('d')

    return (
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {/* Post title */}
                    <h3 className="font-medium text-lg mb-2 truncate">
                        {appeal?.post?.title || 'Appeal Case'}
                    </h3>

                    {/* Appeal reason preview */}
                    <p className="text-sm text-text-light dark:text-dark-text-muted line-clamp-2 mb-3">
                        <span className="font-medium">Appeal reason: </span>
                        {appeal?.dispute_reason}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-text-light">
                            <Users className="w-4 h-4" />
                            {juryCase.total_votes}/{juryCase.required_votes} votes
                        </span>
                        <span className={`flex items-center gap-1 ${isUrgent ? 'text-orange-600' : 'text-text-light'}`}>
                            <Clock className="w-4 h-4" />
                            {timeRemaining}
                        </span>
                    </div>
                </div>

                <Button onClick={onVote} className="shrink-0 gap-2">
                    Cast Vote
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

interface VoteDialogProps {
    open: boolean
    onClose: () => void
    juryCase: JuryCase
    onVoteSubmitted: () => void
}

function VoteDialog({ open, onClose, juryCase, onVoteSubmitted }: VoteDialogProps) {
    const [vote, setVote] = useState<JuryVoteValue | null>(null)
    const [reasoning, setReasoning] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const { showToast } = useToast()

    async function handleSubmit() {
        if (!vote || reasoning.length < 20) {
            showToast('Please select a vote and provide reasoning (min 20 chars)', 'error')
            return
        }

        setSubmitting(true)
        try {
            const response = await fetch('/api/jury', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deliberation_id: juryCase.id,
                    vote,
                    reasoning
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit vote')
            }

            showToast(data.message || 'Vote submitted successfully', 'success')
            onVoteSubmitted()
        } catch (error: any) {
            showToast(error.message || 'Failed to submit vote', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const appeal = juryCase.appeal

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-primary" />
                        Cast Your Vote
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Case Details */}
                    <div className="bg-background-alt dark:bg-dark-bg rounded-lg p-4">
                        <h4 className="font-medium mb-2">Flagged Content</h4>
                        <p className="font-semibold">{appeal?.post?.title}</p>
                        <p className="text-sm text-text-light mt-1 line-clamp-3">
                            {typeof appeal?.post?.content === 'string'
                                ? appeal.post.content.substring(0, 200) + '...'
                                : ''}
                        </p>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                        <h4 className="font-medium mb-2 text-orange-800 dark:text-orange-300">
                            Author&apos;s Appeal
                        </h4>
                        <p className="text-sm">{appeal?.dispute_reason}</p>
                    </div>

                    {/* Vote Options */}
                    <div>
                        <h4 className="font-medium mb-3">Your Decision</h4>
                        <div className="grid grid-cols-3 gap-3">
                            <VoteOption
                                value="uphold"
                                label="Uphold Flag"
                                description="Content should remain flagged"
                                icon={<XCircle className="w-5 h-5" />}
                                selected={vote === 'uphold'}
                                onClick={() => setVote('uphold')}
                                color="red"
                            />
                            <VoteOption
                                value="overturn"
                                label="Overturn"
                                description="Restore the content"
                                icon={<CheckCircle className="w-5 h-5" />}
                                selected={vote === 'overturn'}
                                onClick={() => setVote('overturn')}
                                color="green"
                            />
                            <VoteOption
                                value="abstain"
                                label="Abstain"
                                description="Cannot decide"
                                icon={<MinusCircle className="w-5 h-5" />}
                                selected={vote === 'abstain'}
                                onClick={() => setVote('abstain')}
                                color="gray"
                            />
                        </div>
                    </div>

                    {/* Reasoning */}
                    <div>
                        <label className="block font-medium mb-2">
                            Explain Your Decision <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reasoning}
                            onChange={(e) => setReasoning(e.target.value)}
                            placeholder="Provide your reasoning for this decision (minimum 20 characters)..."
                            className="w-full h-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg resize-none"
                        />
                        <p className="text-xs text-text-light mt-1">
                            {reasoning.length}/20 minimum characters
                        </p>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>
                            Your vote is anonymous until the deliberation concludes.
                            Once submitted, you cannot change your vote.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!vote || reasoning.length < 20 || submitting}
                        className="gap-2"
                    >
                        {submitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Scale className="w-4 h-4" />
                        )}
                        Submit Vote
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface VoteOptionProps {
    value: JuryVoteValue
    label: string
    description: string
    icon: React.ReactNode
    selected: boolean
    onClick: () => void
    color: 'red' | 'green' | 'gray'
}

function VoteOption({ label, description, icon, selected, onClick, color }: VoteOptionProps) {
    const colorClasses = {
        red: selected
            ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            : 'border-gray-200 dark:border-dark-border hover:border-red-300',
        green: selected
            ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'border-gray-200 dark:border-dark-border hover:border-green-300',
        gray: selected
            ? 'border-gray-500 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            : 'border-gray-200 dark:border-dark-border hover:border-gray-400'
    }

    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-lg border-2 text-center transition-all ${colorClasses[color]}`}
        >
            <div className="flex justify-center mb-2">{icon}</div>
            <div className="font-medium text-sm">{label}</div>
            <div className="text-xs text-text-light mt-1">{description}</div>
        </button>
    )
}
