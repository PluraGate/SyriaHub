'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThumbsUp, ThumbsDown, Check, User as UserIcon } from 'lucide-react'
import { Post } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface AnswerCardProps {
    answer: Post
    userVote?: number // 1, -1, or undefined
    isQuestionAuthor: boolean
    onVote?: (value: 1 | -1) => void
    onAccept?: () => void
}

export function AnswerCard({ answer, userVote: initialUserVote, isQuestionAuthor, onVote, onAccept }: AnswerCardProps) {
    const [voteCount, setVoteCount] = useState(answer.vote_count || 0)
    const [userVote, setUserVote] = useState<number | undefined>(initialUserVote)
    const [isVoting, setIsVoting] = useState(false)
    const [isAccepting, setIsAccepting] = useState(false)

    const handleVote = async (value: 1 | -1) => {
        if (isVoting) return

        const previousVote = userVote
        const previousCount = voteCount

        let newVoteCount = voteCount
        if (userVote === value) {
            setUserVote(undefined)
            newVoteCount -= value
        } else {
            if (userVote) {
                newVoteCount -= userVote
            }
            setUserVote(value)
            newVoteCount += value
        }
        setVoteCount(newVoteCount)
        setIsVoting(true)

        try {
            const response = await fetch(`/api/posts/${answer.id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value })
            })

            if (!response.ok) throw new Error('Vote failed')

            const data = await response.json()
            if (data.voteCount !== undefined) {
                setVoteCount(data.voteCount)
            }
        } catch (error) {
            setUserVote(previousVote)
            setVoteCount(previousCount)
            console.error('Failed to vote:', error)
        } finally {
            setIsVoting(false)
        }
    }

    const handleAccept = async () => {
        if (isAccepting || answer.is_accepted) return
        setIsAccepting(true)
        try {
            await onAccept?.()
        } finally {
            setIsAccepting(false)
        }
    }

    return (
        <div className={cn(
            "card transition-colors group relative",
            answer.is_accepted ? "border-green-500/50 bg-green-50/10 dark:bg-green-900/10" : "hover:border-primary/50"
        )}>
            <div className="p-6 flex gap-6">
                {/* Voting Side */}
                <div className="flex flex-col items-center gap-2 pt-1">
                    <button
                        onClick={() => handleVote(1)}
                        disabled={isVoting}
                        className={cn(
                            "p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors",
                            userVote === 1 ? "text-primary" : "text-gray-400"
                        )}
                    >
                        <ThumbsUp className="w-5 h-5" />
                    </button>

                    <span className="font-bold text-lg text-text dark:text-dark-text">
                        {voteCount}
                    </span>

                    <button
                        onClick={() => handleVote(-1)}
                        disabled={isVoting}
                        className={cn(
                            "p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors",
                            userVote === -1 ? "text-red-500" : "text-gray-400"
                        )}
                    >
                        <ThumbsDown className="w-5 h-5" />
                    </button>

                    {answer.is_accepted && (
                        <div className="mt-2 text-green-600 dark:text-green-400 flex flex-col items-center" title="Accepted Answer">
                            <Check className="w-6 h-6" />
                        </div>
                    )}
                </div>

                {/* Content Side */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-text-light dark:text-dark-text-muted">
                            <Link
                                href={`/profile/${answer.author_id}`}
                                className="flex items-center gap-2 hover:text-primary dark:hover:text-accent-light transition-colors"
                            >
                                <UserIcon className="w-4 h-4" />
                                <span className="font-medium">
                                    {answer.author?.full_name || answer.author?.email?.split('@')[0] || 'Anonymous'}
                                </span>
                            </Link>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}</span>
                        </div>

                        {isQuestionAuthor && !answer.is_accepted && (
                            <button
                                onClick={handleAccept}
                                disabled={isAccepting}
                                className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 dark:border-dark-border hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" />
                                Accept Answer
                            </button>
                        )}
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-text dark:text-dark-text">
                        <p className="whitespace-pre-wrap">{answer.content}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
