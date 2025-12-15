'use client'

import { useState } from 'react'
import {
    Sparkles,
    Send,
    Loader2,
    AlertCircle,
    CheckCircle,
    Lightbulb,
    Scale,
    Target,
    RefreshCw,
    Copy,
    Check,
    Zap
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface QuestionAdvisorProps {
    userId?: string
    usageLimits?: {
        can_use: boolean
        daily_remaining: number
        monthly_remaining: number
        reset_at: string
    }
}

interface AnalysisResult {
    clarity_score: number
    scope_analysis: {
        assessment: 'too_broad' | 'too_narrow' | 'appropriate'
        explanation: string
    }
    bias_detection: {
        has_bias: boolean
        biases: string[]
    }
    measurability: {
        score: number
        explanation: string
    }
    suggestions: string[]
    refined_versions: string[]
}

export function QuestionAdvisor({ userId, usageLimits }: QuestionAdvisorProps) {
    const [question, setQuestion] = useState('')
    const [context, setContext] = useState('')
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
    const [remainingUses, setRemainingUses] = useState(usageLimits?.daily_remaining ?? 10)
    const { showToast } = useToast()

    const handleAnalyze = async () => {
        if (!question.trim()) {
            showToast('Please enter a research question', 'error')
            return
        }

        if (!userId) {
            showToast('Please log in to use the Question Advisor', 'error')
            return
        }

        if (remainingUses <= 0) {
            showToast('Daily limit reached. Try again tomorrow!', 'error')
            return
        }

        setAnalyzing(true)

        try {
            const response = await fetch('/api/question-advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, context })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to analyze question')
            }

            const data = await response.json()
            setResult(data)
            setRemainingUses(prev => Math.max(0, prev - 1))
        } catch (error: any) {
            showToast(error.message || 'Failed to analyze question', 'error')
        } finally {
            setAnalyzing(false)
        }
    }

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
        showToast('Copied to clipboard!', 'success')
    }

    const useRefinedVersion = (text: string) => {
        setQuestion(text)
        setResult(null)
        showToast('Question updated!', 'success')
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500'
        if (score >= 60) return 'text-amber-500'
        return 'text-red-500'
    }

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-emerald-100 dark:bg-emerald-900/30'
        if (score >= 60) return 'bg-amber-100 dark:bg-amber-900/30'
        return 'bg-red-100 dark:bg-red-900/30'
    }

    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-display font-bold text-text dark:text-dark-text flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-amber-500" />
                        Question Advisor
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-text-light dark:text-dark-text-muted">
                        <Zap className="w-4 h-4" />
                        {remainingUses} uses remaining today
                    </div>
                </div>
                <p className="text-text-light dark:text-dark-text-muted">
                    AI-powered analysis to refine your research questions for clarity, scope, and measurability
                </p>
            </div>

            <div className="grid lg:grid-cols-[1fr_400px] gap-6">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                            Research Question
                        </label>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Enter your research question here..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder-text-light dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-lg"
                        />

                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-2 mt-4">
                            Context (Optional)
                        </label>
                        <textarea
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="Provide additional context about your research field, methodology, or constraints..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder-text-light dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />

                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing || !question.trim() || remainingUses <= 0}
                            className="btn btn-primary w-full mt-4"
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Analyze Question
                                </>
                            )}
                        </button>
                    </div>

                    {/* Results */}
                    {result && (
                        <div className="space-y-4">
                            {/* Scores Overview */}
                            <div className="grid grid-cols-2 gap-4">
                                <ScoreCard
                                    label="Clarity Score"
                                    score={result.clarity_score}
                                    icon={CheckCircle}
                                />
                                <ScoreCard
                                    label="Measurability"
                                    score={result.measurability.score}
                                    icon={Target}
                                />
                            </div>

                            {/* Scope Analysis */}
                            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Scale className="w-5 h-5 text-blue-500" />
                                    <h3 className="font-semibold text-text dark:text-dark-text">
                                        Scope Analysis
                                    </h3>
                                    <span className={`
                                        px-2 py-0.5 rounded-full text-xs font-medium
                                        ${result.scope_analysis.assessment === 'appropriate'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                        }
                                    `}>
                                        {result.scope_analysis.assessment.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-text-light dark:text-dark-text-muted">
                                    {result.scope_analysis.explanation}
                                </p>
                            </div>

                            {/* Bias Detection */}
                            {result.bias_detection.has_bias && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600" />
                                        <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                                            Potential Biases Detected
                                        </h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {result.bias_detection.biases.map((bias, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                                {bias}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Suggestions */}
                            {result.suggestions.length > 0 && (
                                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Lightbulb className="w-5 h-5 text-amber-500" />
                                        <h3 className="font-semibold text-text dark:text-dark-text">
                                            Suggestions
                                        </h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {result.suggestions.map((suggestion, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-text-light dark:text-dark-text-muted">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Refined Versions Sidebar */}
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-primary/5 to-purple-50 dark:from-primary/10 dark:to-purple-900/10 rounded-xl border border-gray-200 dark:border-dark-border p-5">
                        <h3 className="font-semibold text-text dark:text-dark-text mb-3 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-primary" />
                            Refined Alternatives
                        </h3>

                        {result?.refined_versions && result.refined_versions.length > 0 ? (
                            <div className="space-y-3">
                                {result.refined_versions.map((version, i) => (
                                    <div
                                        key={i}
                                        className="bg-white dark:bg-dark-surface rounded-lg p-4 border border-gray-100 dark:border-dark-border"
                                    >
                                        <p className="text-sm text-text dark:text-dark-text mb-3">
                                            {version}
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => copyToClipboard(version, i)}
                                                className="flex items-center gap-1.5 px-2 py-1 text-xs text-text-light dark:text-dark-text-muted hover:text-primary transition-colors"
                                            >
                                                {copiedIndex === i ? (
                                                    <Check className="w-3.5 h-3.5" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                                Copy
                                            </button>
                                            <button
                                                onClick={() => useRefinedVersion(version)}
                                                className="flex items-center gap-1.5 px-2 py-1 text-xs text-primary hover:underline"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                                Use this
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-text-light dark:text-dark-text-muted">
                                Analyze your question to get refined alternatives
                            </p>
                        )}
                    </div>

                    {/* Tips Card */}
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
                        <h3 className="font-semibold text-text dark:text-dark-text mb-3">
                            Tips for Good Research Questions
                        </h3>
                        <ul className="space-y-2 text-sm text-text-light dark:text-dark-text-muted">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                Be specific and focused
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                Use clear, unambiguous language
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                Ensure it&apos;s measurable or testable
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                Avoid leading or loaded terms
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                Define your scope clearly
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ScoreCard({ label, score, icon: Icon }: { label: string; score: number; icon: any }) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500'
        if (score >= 60) return 'text-amber-500'
        return 'text-red-500'
    }

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-emerald-100 dark:bg-emerald-900/30'
        if (score >= 60) return 'bg-amber-100 dark:bg-amber-900/30'
        return 'bg-red-100 dark:bg-red-900/30'
    }

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
            <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${getScoreColor(score)}`} />
                <span className="text-sm text-text-light dark:text-dark-text-muted">
                    {label}
                </span>
            </div>
            <div className="flex items-end gap-2">
                <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                    {score}
                </span>
                <span className="text-text-light dark:text-dark-text-muted text-sm pb-1">
                    / 100
                </span>
            </div>
            <div className="mt-3 h-2 bg-gray-100 dark:bg-dark-bg rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${getScoreBg(score).replace('bg-', 'bg-')}`}
                    style={{ width: `${score}%`, backgroundColor: score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444' }}
                />
            </div>
        </div>
    )
}
