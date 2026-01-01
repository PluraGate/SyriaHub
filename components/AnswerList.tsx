'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnswerCard } from './AnswerCard'
import { Post } from '@/types'
import { useToast } from './ui/toast'

interface AnswerListProps {
    answers: Post[]
    isQuestionAuthor: boolean
}

export function AnswerList({ answers: initialAnswers, isQuestionAuthor }: AnswerListProps) {
    const [answers, setAnswers] = useState(initialAnswers)
    const { showToast } = useToast()
    const router = useRouter()

    const handleAccept = async (answerId: string) => {
        try {
            const response = await fetch(`/api/posts/${answerId}/accept`, {
                method: 'POST'
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to accept answer')
            }

            // Update local state
            setAnswers(prev => prev.map(a => ({
                ...a,
                is_accepted: a.id === answerId
            })).sort((a, b) => (a.id === answerId ? -1 : 1))) // Move accepted to top

            showToast('Answer marked as accepted', 'success')
            router.refresh() // Refresh server data to ensure consistency
        } catch (error: any) {
            console.error('Accept error:', error)
            showToast(error.message, 'error')
        }
    }

    return (
        <div className="space-y-6">
            {answers.map(answer => (
                <AnswerCard
                    key={answer.id}
                    answer={answer}
                    isQuestionAuthor={isQuestionAuthor}
                    onAccept={() => handleAccept(answer.id)}
                />
            ))}
        </div>
    )
}
