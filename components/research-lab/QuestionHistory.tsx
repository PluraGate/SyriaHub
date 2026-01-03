'use client'

import { useState } from 'react'
import {
    History,
    ChevronDown,
    ChevronUp,
    Clock,
    CheckCircle,
    Target,
    Trash2,
    RefreshCw,
    Loader2
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'

interface QuestionHistoryItem {
    id: string
    question: string
    context: string | null
    clarity_score: number
    measurability_score: number
    scope_assessment: 'too_broad' | 'too_narrow' | 'appropriate'
    has_bias: boolean
    suggestions: string[]
    refined_versions: string[]
    created_at: string
}

interface QuestionHistoryProps {
    history: QuestionHistoryItem[]
    onSelectQuestion: (question: string) => void
    onRefresh: () => void
}

export function QuestionHistory({ history, onSelectQuestion, onRefresh }: QuestionHistoryProps) {
    const t = useTranslations('QuestionAdvisor')
    const [expanded, setExpanded] = useState(false)
    const [expandedItem, setExpandedItem] = useState<string | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)
    const { showToast } = useToast()

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setDeleting(id)
        try {
            const response = await fetch(`/api/question-advisor/history/${id}`, {
                method: 'DELETE'
            })
            if (response.ok) {
                showToast(t('historyDeleted'), 'success')
                onRefresh()
            } else {
                showToast(t('errors.deleteFailed'), 'error')
            }
        } catch {
            showToast(t('errors.deleteFailed'), 'error')
        } finally {
            setDeleting(null)
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500'
        if (score >= 60) return 'text-amber-500'
        return 'text-red-500'
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (history.length === 0) return null

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
            >
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-secondary" />
                    <span className="font-medium text-text dark:text-dark-text">
                        {t('questionHistory')}
                    </span>
                    <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-dark-bg rounded-full text-text-light dark:text-dark-text-muted">
                        {history.length}
                    </span>
                </div>
                {expanded ? (
                    <ChevronUp className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                )}
            </button>

            {expanded && (
                <div className="border-t border-gray-200 dark:border-dark-border max-h-80 overflow-y-auto">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            className="border-b border-gray-100 dark:border-dark-border last:border-b-0"
                        >
                            <div
                                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-dark-bg cursor-pointer"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-text dark:text-dark-text line-clamp-2">
                                            {item.question}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-text-light dark:text-dark-text-muted">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {formatDate(item.created_at)}
                                            </span>
                                            <span className={`flex items-center gap-1 ${getScoreColor(item.clarity_score)}`}>
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                {item.clarity_score}
                                            </span>
                                            <span className={`flex items-center gap-1 ${getScoreColor(item.measurability_score)}`}>
                                                <Target className="w-3.5 h-3.5" />
                                                {item.measurability_score}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onSelectQuestion(item.question)
                                            }}
                                            className="p-1.5 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                                            title={t('useThis')}
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(item.id, e)}
                                            disabled={deleting === item.id}
                                            className="p-1.5 text-text-light hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                            title={t('delete')}
                                        >
                                            {deleting === item.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {expandedItem === item.id && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border space-y-2">
                                        {item.refined_versions && item.refined_versions.length > 0 && (
                                            <div>
                                                <p className="text-xs font-medium text-text-light dark:text-dark-text-muted mb-1">
                                                    {t('refinedAlternatives')}:
                                                </p>
                                                <div className="space-y-1">
                                                    {item.refined_versions.slice(0, 2).map((version, i) => (
                                                        <p key={i} className="text-xs text-text dark:text-dark-text bg-gray-50 dark:bg-dark-bg p-2 rounded">
                                                            {version}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
