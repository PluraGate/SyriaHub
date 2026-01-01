'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, User, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Response {
    id: string
    answers: Record<string, unknown>
    completed_at: string
    respondent?: { name?: string; email?: string } | null
}

interface Question {
    id: string
    question_text: string
    question_type: string
    options?: Array<{ id: string; text: string }>
}

interface SurveyResponsesListProps {
    responses: Response[]
    questions: Question[]
    totalCount: number
}

const PAGE_SIZE = 10

export function SurveyResponsesList({
    responses,
    questions,
    totalCount
}: SurveyResponsesListProps) {
    const [currentPage, setCurrentPage] = useState(0)
    const [expandedResponse, setExpandedResponse] = useState<string | null>(null)

    const totalPages = Math.ceil(responses.length / PAGE_SIZE)
    const startIndex = currentPage * PAGE_SIZE
    const endIndex = Math.min(startIndex + PAGE_SIZE, responses.length)
    const currentResponses = responses.slice(startIndex, endIndex)

    const getAnswerDisplay = (questionId: string, answer: unknown): string => {
        const question = questions.find(q => q.id === questionId)
        if (!question) return String(answer)

        if (question.question_type === 'single_choice' || question.question_type === 'multiple_choice') {
            const options = question.options || []
            if (Array.isArray(answer)) {
                return answer
                    .map(id => options.find(o => o.id === id)?.text || id)
                    .join(', ')
            }
            return options.find(o => o.id === answer)?.text || String(answer)
        }

        return String(answer)
    }

    if (responses.length === 0) {
        return (
            <div className="text-center py-8 text-text-light dark:text-dark-text-muted">
                No individual responses to display.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header with count */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text dark:text-dark-text">
                    Individual Responses
                    <span className="ml-2 text-sm font-normal text-text-light dark:text-dark-text-muted">
                        ({totalCount} total{totalCount > responses.length && `, showing ${responses.length}`})
                    </span>
                </h3>
                {totalPages > 1 && (
                    <div className="text-sm text-text-light dark:text-dark-text-muted">
                        Page {currentPage + 1} of {totalPages}
                    </div>
                )}
            </div>

            {/* Response cards */}
            <div className="space-y-3">
                {currentResponses.map((response, index) => (
                    <div
                        key={response.id}
                        className="bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden"
                    >
                        {/* Response header */}
                        <button
                            onClick={() => setExpandedResponse(
                                expandedResponse === response.id ? null : response.id
                            )}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-dark-border/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                                    {startIndex + index + 1}
                                </span>
                                <div className="text-left">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                                        <span className="text-text dark:text-dark-text">
                                            {response.respondent?.name ||
                                                response.respondent?.email?.split('@')[0] ||
                                                'Anonymous'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-text-light dark:text-dark-text-muted mt-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(response.completed_at), { addSuffix: true })}
                                    </div>
                                </div>
                            </div>
                            <ChevronRight
                                className={`w-5 h-5 text-text-light dark:text-dark-text-muted transition-transform ${expandedResponse === response.id ? 'rotate-90' : ''
                                    }`}
                            />
                        </button>

                        {/* Expanded response details */}
                        {expandedResponse === response.id && (
                            <div className="px-4 pb-4 border-t border-gray-200 dark:border-dark-border">
                                <div className="pt-4 space-y-3">
                                    {questions.map(question => {
                                        const answer = response.answers[question.id]
                                        if (answer === undefined || answer === null || answer === '') {
                                            return null
                                        }
                                        return (
                                            <div key={question.id} className="text-sm">
                                                <p className="font-medium text-text dark:text-dark-text mb-1">
                                                    {question.question_text}
                                                </p>
                                                <p className="text-text-light dark:text-dark-text-muted pl-3 border-l-2 border-gray-200 dark:border-dark-border">
                                                    {getAnswerDisplay(question.id, answer)}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="p-2 rounded-lg border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number
                            if (totalPages <= 5) {
                                pageNum = i
                            } else if (currentPage < 3) {
                                pageNum = i
                            } else if (currentPage > totalPages - 4) {
                                pageNum = totalPages - 5 + i
                            } else {
                                pageNum = currentPage - 2 + i
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === pageNum
                                            ? 'bg-primary text-white'
                                            : 'hover:bg-gray-100 dark:hover:bg-dark-border text-text dark:text-dark-text'
                                        }`}
                                >
                                    {pageNum + 1}
                                </button>
                            )
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage === totalPages - 1}
                        className="p-2 rounded-lg border border-gray-200 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Load more indicator */}
            {totalCount > responses.length && (
                <p className="text-center text-sm text-text-light dark:text-dark-text-muted">
                    Showing first {responses.length} of {totalCount} responses.
                    Export to CSV to see all responses.
                </p>
            )}
        </div>
    )
}
