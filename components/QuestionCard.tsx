'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MessageSquare, ThumbsUp, ThumbsDown, ArrowRight } from 'lucide-react'
import { Post } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface QuestionCardProps {
    post: Post
    userVote?: number // 1, -1, or undefined
    onVote?: (value: 1 | -1) => void
}

export function QuestionCard({ post, userVote: initialUserVote, onVote }: QuestionCardProps) {
    const [voteCount, setVoteCount] = useState(post.vote_count || 0)
    const [userVote, setUserVote] = useState<number | undefined>(initialUserVote)
    const [isVoting, setIsVoting] = useState(false)

    const handleVote = async (value: 1 | -1) => {
        if (isVoting) return

        // Optimistic update
        const previousVote = userVote
        const previousCount = voteCount

        let newVoteCount = voteCount
        if (userVote === value) {
            // Toggle off
            setUserVote(undefined)
            newVoteCount -= value
        } else {
            // Change vote or new vote
            if (userVote) {
                newVoteCount -= userVote // Remove old vote
            }
            setUserVote(value)
            newVoteCount += value
        }
        setVoteCount(newVoteCount)
        setIsVoting(true)

        try {
            const response = await fetch(`/api/posts/${post.id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value })
            })

            if (!response.ok) {
                throw new Error('Vote failed')
            }

            // Optional: Update with server count if returned
            const data = await response.json()
            if (data.voteCount !== undefined) {
                setVoteCount(data.voteCount)
            }
        } catch (error) {
            // Revert on error
            setUserVote(previousVote)
            setVoteCount(previousCount)
            console.error('Failed to vote:', error)
        } finally {
            setIsVoting(false)
        }
    }

    return (
        <div className="card hover:border-primary/50 transition-colors group">
            <div className="p-6 flex gap-6">
                {/* Voting Side */}
                <div className="flex flex-col items-center gap-2 pt-1">
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            handleVote(1)
                        }}
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
                        onClick={(e) => {
                            e.preventDefault()
                            handleVote(-1)
                        }}
                        disabled={isVoting}
                        className={cn(
                            "p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition-colors",
                            userVote === -1 ? "text-red-500" : "text-gray-400"
                        )}
                    >
                        <ThumbsDown className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Side */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                            Question
                        </span>
                        <span className="text-sm text-text-light dark:text-dark-text-muted">
                            Posted by {post.author?.name || 'Anonymous'} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                    </div>

                    <Link href={`/post/${post.id}`} className="block group-hover:text-primary transition-colors">
                        <h3 className="text-xl font-bold text-text dark:text-dark-text mb-2 truncate">
                            {post.title}
                        </h3>
                    </Link>

                    <p className="text-text-light dark:text-dark-text-muted line-clamp-2 mb-4">
                        {post.content}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-sm text-text-light dark:text-dark-text-muted">
                                <MessageSquare className="w-4 h-4" />
                                <span>{post.comment_count || 0} answers</span>
                            </div>

                            <div className="flex gap-2">
                                {post.tags?.map(tag => (
                                    <span key={tag} className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-dark-surface-hover text-text-light dark:text-dark-text-muted">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <Link
                            href={`/post/${post.id}`}
                            className="btn btn-ghost btn-sm flex items-center gap-2"
                        >
                            Answer this
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div >
            </div >
        </div >
    )
}
