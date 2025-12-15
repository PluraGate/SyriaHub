'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send, Star } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Question {
    id: string
    question_text: string
    question_type: string
    options?: { id: string; text: string }[]
    required: boolean
    description?: string
}

interface SurveyTakeFormProps {
    surveyId: string
    questions: Question[]
    isAnonymous: boolean
}

export function SurveyTakeForm({ surveyId, questions, isAnonymous }: SurveyTakeFormProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const [answers, setAnswers] = useState<Record<string, unknown>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const updateAnswer = (questionId: string, value: unknown) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate required fields
        const missingRequired = questions
            .filter(q => q.required)
            .filter(q => !answers[q.id] || (typeof answers[q.id] === 'string' && !(answers[q.id] as string).trim()))

        if (missingRequired.length > 0) {
            showToast({
                type: 'error',
                title: 'Required Fields Missing',
                message: `Please answer all required questions (${missingRequired.length} missing)`
            })
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/surveys/${surveyId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to submit response')
            }

            setSubmitted(true)
            showToast({
                type: 'success',
                title: 'Response Submitted',
                message: 'Thank you for completing this survey!'
            })

        } catch (error) {
            showToast({
                type: 'error',
                title: 'Error',
                message: error instanceof Error ? error.message : 'Failed to submit response'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-2">
                    Thank you!
                </h2>
                <p className="text-text-light dark:text-dark-text-muted mb-6">
                    Your response has been recorded.
                </p>
                <button
                    onClick={() => router.push('/research-lab/surveys')}
                    className="btn btn-primary"
                >
                    Back to Surveys
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {isAnonymous && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        🔒 This is an anonymous survey. Your identity will not be recorded.
                    </p>
                </div>
            )}

            {questions.map((question, index) => (
                <div
                    key={question.id}
                    className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6"
                >
                    <div className="flex items-start gap-3 mb-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                            {index + 1}
                        </span>
                        <div className="flex-1">
                            <label className="font-medium text-text dark:text-dark-text">
                                {question.question_text}
                                {question.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {question.description && (
                                <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                                    {question.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="ml-9">
                        {renderQuestionInput(question, answers[question.id], (value) => updateAnswer(question.id, value))}
                    </div>
                </div>
            ))}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Submit Response
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}

function renderQuestionInput(
    question: Question,
    value: unknown,
    onChange: (value: unknown) => void
) {
    switch (question.question_type) {
        case 'single_choice':
            return (
                <div className="space-y-2">
                    {question.options?.map(option => (
                        <label
                            key={option.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-dark-border hover:border-primary/50 cursor-pointer transition-colors"
                        >
                            <input
                                type="radio"
                                name={question.id}
                                value={option.id}
                                checked={value === option.id}
                                onChange={() => onChange(option.id)}
                                className="w-4 h-4 text-primary"
                            />
                            <span className="text-text dark:text-dark-text">{option.text}</span>
                        </label>
                    ))}
                </div>
            )

        case 'multiple_choice':
            const selectedValues = (value as string[]) || []
            return (
                <div className="space-y-2">
                    {question.options?.map(option => (
                        <label
                            key={option.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-dark-border hover:border-primary/50 cursor-pointer transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={selectedValues.includes(option.id)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        onChange([...selectedValues, option.id])
                                    } else {
                                        onChange(selectedValues.filter(v => v !== option.id))
                                    }
                                }}
                                className="w-4 h-4 text-primary rounded"
                            />
                            <span className="text-text dark:text-dark-text">{option.text}</span>
                        </label>
                    ))}
                </div>
            )

        case 'text':
            return (
                <input
                    type="text"
                    value={(value as string) || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Your answer..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
            )

        case 'long_text':
            return (
                <textarea
                    value={(value as string) || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Your answer..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                />
            )

        case 'scale':
            return (
                <div className="flex items-center justify-between gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => onChange(num)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${value === num
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 dark:bg-dark-bg text-text dark:text-dark-text hover:bg-primary/10'
                                }`}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            )

        case 'rating':
            const rating = (value as number) || 0
            return (
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => onChange(num)}
                            className="p-1 transition-colors"
                        >
                            <Star
                                className={`w-8 h-8 ${num <= rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300 dark:text-dark-border'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            )

        case 'number':
            return (
                <input
                    type="number"
                    value={(value as number) || ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Enter a number..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
            )

        case 'date':
            return (
                <input
                    type="date"
                    value={(value as string) || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
            )

        default:
            return (
                <input
                    type="text"
                    value={(value as string) || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Your answer..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
            )
    }
}
