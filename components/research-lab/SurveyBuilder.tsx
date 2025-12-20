'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Plus,
    Trash2,
    GripVertical,
    Save,
    Eye,
    Send,
    ChevronDown,
    ChevronUp,
    Loader2,
    Settings,
    Type,
    List,
    CheckSquare,
    Star,
    Sliders,
    Calendar,
    Hash,
    AlignLeft
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'

interface SurveyBuilderProps {
    userId: string
    existingSurvey?: any
}

interface Question {
    id: string
    question_text: string
    question_type: string
    options?: { id: string; text: string }[]
    required: boolean
    description?: string
}

const QUESTION_TYPES = [
    { id: 'single_choice', label: 'Single Choice', icon: List },
    { id: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquare },
    { id: 'text', label: 'Short Text', icon: Type },
    { id: 'long_text', label: 'Long Text', icon: AlignLeft },
    { id: 'scale', label: 'Scale (1-10)', icon: Sliders },
    { id: 'rating', label: 'Rating (Stars)', icon: Star },
    { id: 'number', label: 'Number', icon: Hash },
    { id: 'date', label: 'Date', icon: Calendar },
]

export function SurveyBuilder({ userId, existingSurvey }: SurveyBuilderProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const t = useTranslations('Surveys')
    const tPolls = useTranslations('Polls')

    const [title, setTitle] = useState(existingSurvey?.title || '')
    const [description, setDescription] = useState(existingSurvey?.description || '')
    const [questions, setQuestions] = useState<Question[]>(existingSurvey?.questions || [])
    const [isAnonymous, setIsAnonymous] = useState(existingSurvey?.is_anonymous || false)
    const [saving, setSaving] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
    const [showSettings, setShowSettings] = useState(false)

    const addQuestion = (type: string) => {
        const newQuestion: Question = {
            id: `q_${Date.now()}`,
            question_text: '',
            question_type: type,
            required: false,
            options: type === 'single_choice' || type === 'multiple_choice'
                ? [{ id: 'opt_1', text: '' }, { id: 'opt_2', text: '' }]
                : undefined
        }
        setQuestions([...questions, newQuestion])
        setExpandedQuestion(newQuestion.id)
    }

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, ...updates } : q
        ))
    }

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id))
    }

    const addOption = (questionId: string) => {
        setQuestions(questions.map(q => {
            if (q.id !== questionId || !q.options) return q
            return {
                ...q,
                options: [...q.options, { id: `opt_${q.options.length + 1}`, text: '' }]
            }
        }))
    }

    const updateOption = (questionId: string, optionId: string, text: string) => {
        setQuestions(questions.map(q => {
            if (q.id !== questionId || !q.options) return q
            return {
                ...q,
                options: q.options.map(opt =>
                    opt.id === optionId ? { ...opt, text } : opt
                )
            }
        }))
    }

    const removeOption = (questionId: string, optionId: string) => {
        setQuestions(questions.map(q => {
            if (q.id !== questionId || !q.options || q.options.length <= 2) return q
            return {
                ...q,
                options: q.options.filter(opt => opt.id !== optionId)
            }
        }))
    }

    const moveQuestion = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === questions.length - 1)
        ) return

        const newQuestions = [...questions]
        const newIndex = direction === 'up' ? index - 1 : index + 1
            ;[newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]]
        setQuestions(newQuestions)
    }

    const handleSave = async (publish: boolean = false) => {
        if (!title.trim()) {
            showToast('Please enter a survey title', 'error')
            return
        }

        if (questions.length === 0) {
            showToast('Please add at least one question', 'error')
            return
        }

        // Validate questions
        for (const q of questions) {
            if (!q.question_text.trim()) {
                showToast('Please fill in all question texts', 'error')
                return
            }
            if (q.options) {
                const emptyOptions = q.options.filter(opt => !opt.text.trim())
                if (emptyOptions.length > 0) {
                    showToast('Please fill in all options', 'error')
                    return
                }
            }
        }

        setSaving(true)

        try {
            const isEditing = !!existingSurvey?.id
            const url = isEditing ? `/api/surveys/${existingSurvey.id}` : '/api/surveys'
            const method = isEditing ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    questions,
                    is_anonymous: isAnonymous,
                    status: publish ? 'active' : 'draft'
                })
            })

            if (!response.ok) {
                throw new Error('Failed to save survey')
            }

            const survey = await response.json()
            showToast(publish ? 'Survey published!' : 'Survey saved!', 'success')
            router.push(`/research-lab/surveys/${survey.id || existingSurvey.id}`)
        } catch (error) {
            showToast('Failed to save survey', 'error')
        } finally {
            setSaving(false)
        }
    }

    const getQuestionTypeIcon = (type: string) => {
        const config = QUESTION_TYPES.find(t => t.id === type)
        return config?.icon || Type
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-display font-bold text-text dark:text-dark-text">
                    {existingSurvey ? 'Edit Survey' : 'Create Survey'}
                </h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="btn btn-ghost"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </button>
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="btn btn-ghost"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                    </button>
                    <button
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="btn btn-outline"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="btn btn-primary"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Publish
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 mb-6">
                    <h3 className="font-semibold text-text dark:text-dark-text mb-4">
                        Survey Settings
                    </h3>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div>
                                <span className="text-text dark:text-dark-text font-medium">{tPolls('anonymous')}</span>
                                <p className="text-sm text-text-light dark:text-dark-text-muted">
                                    Respondent identities will not be recorded
                                </p>
                            </div>
                        </label>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-[1fr_280px] gap-6">
                {/* Main Form */}
                <div className="space-y-6">
                    {/* Title & Description */}
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('titlePlaceholder')}
                            className="w-full text-2xl font-display font-bold border-none bg-transparent text-text dark:text-dark-text placeholder-text-light dark:placeholder-dark-text-muted focus:outline-none focus:ring-0"
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('descriptionPlaceholder')}
                            rows={2}
                            className="w-full mt-3 border-none bg-transparent text-text-light dark:text-dark-text-muted placeholder-text-light dark:placeholder-dark-text-muted focus:outline-none focus:ring-0 resize-none"
                        />
                    </div>

                    {/* Questions */}
                    {questions.map((question, index) => {
                        const QuestionIcon = getQuestionTypeIcon(question.question_type)
                        const isExpanded = expandedQuestion === question.id

                        return (
                            <div
                                key={question.id}
                                className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden"
                            >
                                {/* Question Header */}
                                <div
                                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg"
                                    onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                                >
                                    <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <QuestionIcon className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span className="text-sm text-text dark:text-dark-text truncate">
                                            {question.question_text || `Question ${index + 1}`}
                                        </span>
                                        {question.required && (
                                            <span className="text-xs text-red-500">*</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveQuestion(index, 'up') }}
                                            disabled={index === 0}
                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); moveQuestion(index, 'down') }}
                                            disabled={index === questions.length - 1}
                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeQuestion(question.id) }}
                                            className="p-1 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Question Body (Expanded) */}
                                {isExpanded && (
                                    <div className="p-4 pt-0 border-t border-gray-100 dark:border-dark-border">
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                value={question.question_text}
                                                onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })}
                                                placeholder={t('questionPlaceholder')}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text"
                                            />

                                            {/* Options for choice questions */}
                                            {question.options && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text dark:text-dark-text">
                                                        Options
                                                    </label>
                                                    {question.options.map((option, optIndex) => (
                                                        <div key={option.id} className="flex items-center gap-2">
                                                            <span className="text-sm text-text-light w-6">{optIndex + 1}.</span>
                                                            <input
                                                                type="text"
                                                                value={option.text}
                                                                onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                                                                placeholder={`Option ${optIndex + 1}`}
                                                                className="flex-1 px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text"
                                                            />
                                                            {question.options && question.options.length > 2 && (
                                                                <button
                                                                    onClick={() => removeOption(question.id, option.id)}
                                                                    className="p-1 text-gray-400 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => addOption(question.id)}
                                                        className="text-sm text-primary hover:underline"
                                                    >
                                                        + Add Option
                                                    </button>
                                                </div>
                                            )}

                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={question.required}
                                                    onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm text-text dark:text-dark-text">
                                                    Required question
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* Empty State */}
                    {questions.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 dark:bg-dark-surface/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-dark-border">
                            <List className="w-10 h-10 mx-auto text-gray-300 dark:text-dark-text-muted mb-3" />
                            <p className="text-text-light dark:text-dark-text-muted mb-2">
                                No questions yet
                            </p>
                            <p className="text-sm text-text-light dark:text-dark-text-muted">
                                Add questions from the sidebar to start building your survey
                            </p>
                        </div>
                    )}
                </div>

                {/* Question Types Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4 sticky top-24">
                        <h3 className="font-semibold text-text dark:text-dark-text mb-4">
                            Add Question
                        </h3>
                        <div className="space-y-2">
                            {QUESTION_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => addQuestion(type.id)}
                                    className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-gray-200 dark:border-dark-border hover:border-primary hover:bg-primary/5 transition-colors"
                                >
                                    <type.icon className="w-4 h-4 text-primary" />
                                    <span className="text-sm text-text dark:text-dark-text">
                                        {type.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
