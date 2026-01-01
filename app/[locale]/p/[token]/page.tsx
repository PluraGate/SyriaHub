'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Vote, Check, Loader2, AlertTriangle, Users } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { generateBrowserFingerprint } from '@/lib/fingerprint'

interface PollOption {
    id: string
    text: string
    vote_count: number
}

interface Poll {
    id: string
    question: string
    description?: string
    options: PollOption[]
    is_multiple_choice: boolean
    show_results_before_vote: boolean
    total_votes: number
}

export default function PublicPollPage() {
    const params = useParams()
    const token = params.token as string
    const { showToast } = useToast()

    const [poll, setPoll] = useState<Poll | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])
    const [isVoting, setIsVoting] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    const [userVote, setUserVote] = useState<string[] | null>(null)
    const [browserFingerprint, setBrowserFingerprint] = useState<string | null>(null)

    useEffect(() => {
        async function fetchPoll() {
            try {
                // Generate fingerprint first
                const fp = await generateBrowserFingerprint()
                setBrowserFingerprint(fp)

                const response = await fetch(`/api/public/poll/${token}`, {
                    headers: { 'x-browser-fingerprint': fp }
                })
                const data = await response.json()

                if (!response.ok) {
                    setError(data.error || 'Poll not found')
                    return
                }

                setPoll(data.poll)
                setHasVoted(data.hasVoted)
                setUserVote(data.userVote)
            } catch (err) {
                setError('Failed to load poll')
            } finally {
                setLoading(false)
            }
        }

        if (token) {
            fetchPoll()
        }
    }, [token])

    const handleOptionClick = (optionId: string) => {
        if (hasVoted) return

        if (poll?.is_multiple_choice) {
            setSelectedOptions(prev =>
                prev.includes(optionId)
                    ? prev.filter(id => id !== optionId)
                    : [...prev, optionId]
            )
        } else {
            setSelectedOptions([optionId])
        }
    }

    const handleVote = async () => {
        if (selectedOptions.length === 0) {
            showToast('Please select an option', 'error')
            return
        }

        setIsVoting(true)

        try {
            const response = await fetch(`/api/public/poll/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-browser-fingerprint': browserFingerprint || ''
                },
                body: JSON.stringify({ option_ids: selectedOptions })
            })

            const data = await response.json()

            if (!response.ok) {
                showToast(data.error || 'Failed to vote', 'error')
                return
            }

            // Update poll options with new counts
            if (data.options) {
                setPoll(prev => prev ? { ...prev, options: data.options, total_votes: prev.total_votes + 1 } : null)
            }

            setHasVoted(true)
            setUserVote(selectedOptions)
            showToast('Vote recorded!', 'success')
        } catch (err) {
            showToast('Failed to submit vote', 'error')
        } finally {
            setIsVoting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-text-light dark:text-dark-text-muted">Loading poll...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-8 max-w-md w-full text-center">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-xl font-semibold text-text dark:text-dark-text mb-2">
                        Poll Not Available
                    </h1>
                    <p className="text-text-light dark:text-dark-text-muted">
                        {error}
                    </p>
                </div>
            </div>
        )
    }

    const totalVotes = poll?.options.reduce((sum, opt) => sum + (opt.vote_count || 0), 0) || 0
    const showResults = hasVoted || poll?.show_results_before_vote

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface py-8 px-4">
            <div className="max-w-lg mx-auto">
                {/* Poll Card */}
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                            <Vote className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold text-text dark:text-dark-text">
                                {poll?.question}
                            </h1>
                            {poll?.is_multiple_choice && !hasVoted && (
                                <p className="text-xs text-text-light dark:text-dark-text-muted">
                                    Select multiple options
                                </p>
                            )}
                        </div>
                    </div>

                    {poll?.description && (
                        <p className="text-text-light dark:text-dark-text-muted mb-4">
                            {poll.description}
                        </p>
                    )}

                    {/* Options */}
                    <div className="space-y-2 mb-4">
                        {poll?.options.map((option) => {
                            const percentage = totalVotes > 0
                                ? Math.round((option.vote_count / totalVotes) * 100)
                                : 0
                            const isSelected = selectedOptions.includes(option.id)
                            const wasVotedFor = userVote?.includes(option.id)

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionClick(option.id)}
                                    disabled={hasVoted || isVoting}
                                    className={`
                                        w-full relative text-left p-4 rounded-lg border transition-all
                                        ${hasVoted
                                            ? 'cursor-default'
                                            : isSelected
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 dark:border-dark-border hover:border-primary/50'
                                        }
                                    `}
                                >
                                    {/* Progress bar */}
                                    {showResults && (
                                        <div
                                            className={`absolute inset-0 rounded-lg transition-all ${wasVotedFor
                                                ? 'bg-primary/20'
                                                : 'bg-gray-100 dark:bg-dark-border/50'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    )}

                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {!hasVoted && (
                                                <div className={`
                                                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                                                    ${isSelected
                                                        ? 'border-primary bg-primary text-white'
                                                        : 'border-gray-300 dark:border-dark-border'
                                                    }
                                                `}>
                                                    {isSelected && <Check className="w-3 h-3" />}
                                                </div>
                                            )}
                                            {wasVotedFor && (
                                                <Check className="w-5 h-5 text-primary" />
                                            )}
                                            <span className="text-text dark:text-dark-text font-medium">
                                                {option.text}
                                            </span>
                                        </div>
                                        {showResults && (
                                            <span className="text-sm font-medium text-text-light dark:text-dark-text-muted">
                                                {percentage}%
                                            </span>
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                        <div className="flex items-center gap-2 text-sm text-text-light dark:text-dark-text-muted">
                            <Users className="w-4 h-4" />
                            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                        </div>

                        {!hasVoted && selectedOptions.length > 0 && (
                            <button
                                onClick={handleVote}
                                disabled={isVoting}
                                className="btn btn-primary"
                            >
                                {isVoting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Voting...
                                    </>
                                ) : (
                                    'Vote'
                                )}
                            </button>
                        )}

                        {hasVoted && (
                            <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <Check className="w-4 h-4" />
                                Voted
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-text-light dark:text-dark-text-muted">
                    Powered by SyriaHub Research Lab
                </div>
            </div>
        </div>
    )
}
