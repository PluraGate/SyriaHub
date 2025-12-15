'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ClipboardList, Check, Loader2, AlertTriangle } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { generateBrowserFingerprint } from '@/lib/fingerprint'

interface Question {
    id: string
    question_text: string
    question_type: string
    options?: Array<{ id: string; text: string }>
    required: boolean
    description?: string
}

interface Survey {
    id: string
    title: string
    description?: string
    questions: Question[]
}

export default function PublicSurveyPage() {
    const params = useParams()
    const token = params.token as string
    const { showToast } = useToast()

    const [survey, setSurvey] = useState<Survey | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [answers, setAnswers] = useState<Record<string, unknown>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [hasResponded, setHasResponded] = useState(false)
    const [browserFingerprint, setBrowserFingerprint] = useState<string | null>(null)

    useEffect(() => {
        async function fetchSurvey() {
            try {
                // Generate fingerprint first
                const fp = await generateBrowserFingerprint()
                setBrowserFingerprint(fp)

                const response = await fetch(`/api/public/survey/${token}`, {
                    headers: { 'x-browser-fingerprint': fp }
                })
                const data = await response.json()

                if (!response.ok) {
                    setError(data.error || 'Survey not found')
                    return
                }

                setSurvey(data.survey)
                setHasResponded(data.hasResponded)
            } catch (err) {
                setError('Failed to load survey')
            } finally {
                setLoading(false)
            }
        }

        if (token) {
            fetchSurvey()
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!survey) return

        // Validate required questions
        const unanswered = survey.questions
            .filter(q => q.required && !answers[q.id])
            .map(q => q.question_text)

        if (unanswered.length > 0) {
            showToast(`Please answer: ${unanswered[0]}`, 'error')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch(`/api/public/survey/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-browser-fingerprint': browserFingerprint || ''
                },
                body: JSON.stringify({ answers })
            })

            const data = await response.json()

            if (!response.ok) {
                showToast(data.error || 'Failed to submit', 'error')
                return
            }

            setSubmitted(true)
        } catch (err) {
            showToast('Failed to submit response', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const updateAnswer = (questionId: string, value: unknown) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-text-light dark:text-dark-text-muted">Loading survey...</p>
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
                        Survey Not Available
                    </h1>
                    <p className="text-text-light dark:text-dark-text-muted">
                        {error}
                    </p>
                </div>
            </div>
        )
    }

    if (hasResponded) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-8 max-w-md w-full text-center">
                    <Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h1 className="text-xl font-semibold text-text dark:text-dark-text mb-2">
                        Already Responded
                    </h1>
                    <p className="text-text-light dark:text-dark-text-muted">
                        You have already submitted a response to this survey.
                    </p>
                </div>
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface flex items-center justify-center p-4">
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h1 className="text-xl font-semibold text-text dark:text-dark-text mb-2">
                        Thank You!
                    </h1>
                    <p className="text-text-light dark:text-dark-text-muted">
                        Your response has been recorded.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-surface py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="text-xl font-semibold text-text dark:text-dark-text">
                            {survey?.title}
                        </h1>
                    </div>
                    {survey?.description && (
                        <p className="text-text-light dark:text-dark-text-muted">
                            {survey.description}
                        </p>
                    )}
                </div>

                {/* Questions */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {survey?.questions.map((question, index) => (
                            <div
                                key={question.id}
                                className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-text dark:text-dark-text">
                                            {question.question_text}
                                            {question.required && (
                                                <span className="text-red-500 ml-1">*</span>
                                            )}
                                        </h3>
                                        {question.description && (
                                            <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                                                {question.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="ml-9">
                                    <QuestionInput
                                        question={question}
                                        value={answers[question.id]}
                                        onChange={(value) => updateAnswer(question.id, value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn btn-primary py-3 text-base"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Response'
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-text-light dark:text-dark-text-muted">
                    Powered by SyriaHub Research Lab
                </div>
            </div>
        </div>
    )
}

function QuestionInput({
    question,
    value,
    onChange
}: {
    question: Question
    value: unknown
    onChange: (value: unknown) => void
}) {
    const baseInputClass = "w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"

    switch (question.question_type) {
        case 'single_choice':
            return (
                <div className="space-y-2">
                    {question.options?.map((option) => (
                        <label
                            key={option.id}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${value === option.id
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 dark:border-dark-border hover:border-primary/50'
                                }`}
                        >
                            <input
                                type="radio"
                                name={question.id}
                                checked={value === option.id}
                                onChange={() => onChange(option.id)}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${value === option.id ? 'border-primary bg-primary' : 'border-gray-300 dark:border-dark-border'
                                }`}>
                                {value === option.id && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                            </div>
                            <span className="text-text dark:text-dark-text">{option.text}</span>
                        </label>
                    ))}
                </div>
            )

        case 'multiple_choice':
            const selectedIds = (value as string[]) || []
            return (
                <div className="space-y-2">
                    {question.options?.map((option) => (
                        <label
                            key={option.id}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedIds.includes(option.id)
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 dark:border-dark-border hover:border-primary/50'
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(option.id)}
                                onChange={() => {
                                    const newValue = selectedIds.includes(option.id)
                                        ? selectedIds.filter(id => id !== option.id)
                                        : [...selectedIds, option.id]
                                    onChange(newValue)
                                }}
                                className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedIds.includes(option.id) ? 'border-primary bg-primary' : 'border-gray-300 dark:border-dark-border'
                                }`}>
                                {selectedIds.includes(option.id) && (
                                    <Check className="w-3 h-3 text-white" />
                                )}
                            </div>
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
                    className={baseInputClass}
                    placeholder="Your answer..."
                />
            )

        case 'long_text':
            return (
                <textarea
                    value={(value as string) || ''}
                    onChange={(e) => onChange(e.target.value)}
                    rows={4}
                    className={`${baseInputClass} resize-none`}
                    placeholder="Your answer..."
                />
            )

        case 'number':
            return (
                <input
                    type="number"
                    value={(value as number) ?? ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                    className={baseInputClass}
                    placeholder="Enter a number..."
                />
            )

        case 'scale':
            return (
                <div className="flex gap-2 justify-between">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => onChange(n)}
                            className={`w-10 h-10 rounded-lg border-2 font-medium transition-colors ${value === n
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-200 dark:border-dark-border hover:border-primary/50 text-text dark:text-dark-text'
                                }`}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            )

        case 'rating':
            return (
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => onChange(n)}
                            className={`w-12 h-12 rounded-lg border-2 font-medium text-lg transition-colors ${value === n
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-200 dark:border-dark-border hover:border-primary/50 text-text dark:text-dark-text'
                                }`}
                        >
                            {n}
                        </button>
                    ))}
                </div>
            )

        case 'date':
            return (
                <input
                    type="date"
                    value={(value as string) || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={baseInputClass}
                />
            )

        default:
            return (
                <input
                    type="text"
                    value={(value as string) || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={baseInputClass}
                    placeholder="Your answer..."
                />
            )
    }
}
