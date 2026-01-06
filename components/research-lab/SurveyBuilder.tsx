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
    AlignLeft,
    X
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

const QUESTION_TYPES_CONFIG = [
    { id: 'single_choice', labelKey: 'questionTypes.singleChoice', icon: List },
    { id: 'multiple_choice', labelKey: 'questionTypes.multipleChoice', icon: CheckSquare },
    { id: 'text', labelKey: 'questionTypes.shortText', icon: Type },
    { id: 'long_text', labelKey: 'questionTypes.longText', icon: AlignLeft },
    { id: 'scale', labelKey: 'questionTypes.scale', icon: Sliders },
    { id: 'rating', labelKey: 'questionTypes.rating', icon: Star },
    { id: 'number', labelKey: 'questionTypes.number', icon: Hash },
    { id: 'date', labelKey: 'questionTypes.date', icon: Calendar },
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
    const [showAddQuestion, setShowAddQuestion] = useState(false)

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
        setShowAddQuestion(false) // Close the panel after adding
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
        const config = QUESTION_TYPES_CONFIG.find(t => t.id === type)
        return config?.icon || Type
    }

    return (
        <div>
            {/* Header - Mobile responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-text dark:text-dark-text">
                    {existingSurvey ? t('editSurvey') : t('createSurvey')}
                </h1>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-1 px-1 scrollbar-hide">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="btn btn-ghost text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                    >
                        <Settings className="w-4 h-4 sm:me-2" />
                        <span className="hidden sm:inline">{t('settings')}</span>
                    </button>
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="btn btn-ghost text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                    >
                        <Eye className="w-4 h-4 sm:me-2" />
                        <span className="hidden sm:inline">{t('preview')}</span>
                    </button>
                    <button
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="btn btn-outline text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin sm:me-2" /> : <Save className="w-4 h-4 sm:me-2" />}
                        <span className="hidden sm:inline">{t('saveDraft')}</span>
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        className="btn btn-primary text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4"
                    >
                        <Send className="w-4 h-4 sm:me-2" />
                        <span className="hidden sm:inline">{t('publish')}</span>
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4 sm:p-6 mb-4 sm:mb-6">
                    <h3 className="font-semibold text-sm sm:text-base text-text dark:text-dark-text mb-3 sm:mb-4">
                        {t('surveySettings')}
                    </h3>
                    <div className="space-y-4">
                        <label className="flex items-start sm:items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary mt-0.5 sm:mt-0"
                            />
                            <div>
                                <span className="text-sm sm:text-base text-text dark:text-dark-text font-medium">{tPolls('anonymous')}</span>
                                <p className="text-xs sm:text-sm text-text-light dark:text-dark-text-muted">
                                    {t('anonymousDesc')}
                                </p>
                            </div>
                        </label>
                    </div>
                </div>
            )}

            {/* Main Layout - Single column on mobile, two columns on desktop */}
            <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-[1fr_280px] lg:gap-6">
                {/* Main Form - Full width on mobile */}
                <div className="space-y-4">
                    {/* Title & Description */}
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4 sm:p-6">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('titlePlaceholder')}
                            className="w-full text-lg sm:text-2xl font-display font-bold border-none bg-transparent text-text dark:text-dark-text placeholder-text-light dark:placeholder-dark-text-muted focus:outline-none focus:ring-0"
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('descriptionPlaceholder')}
                            rows={2}
                            className="w-full mt-2 sm:mt-3 text-sm sm:text-base border-none bg-transparent text-text-light dark:text-dark-text-muted placeholder-text-light dark:placeholder-dark-text-muted focus:outline-none focus:ring-0 resize-none"
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
                                            {question.question_text || t('questionPlaceholder2', { number: index + 1 })}
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

                                            {question.options && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text dark:text-dark-text">
                                                        {t('optionsLabel')}
                                                    </label>
                                                    {question.options.map((option, optIndex) => (
                                                        <div key={option.id} className="flex items-center gap-2">
                                                            <span className="text-sm text-text-light w-6">{optIndex + 1}.</span>
                                                            <input
                                                                type="text"
                                                                value={option.text}
                                                                onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                                                                placeholder={t('optionPlaceholder', { number: optIndex + 1 })}
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
                                                        + {t('addOption')}
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
                                                    {t('requiredQuestion')}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* Mobile: Add Question Button */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setShowAddQuestion(!showAddQuestion)}
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-colors text-primary"
                        >
                            {showAddQuestion ? (
                                <>
                                    <X className="w-5 h-5" />
                                    <span className="font-medium">{t('cancel') || 'Cancel'}</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    <span className="font-medium">{t('addQuestionTitle')}</span>
                                </>
                            )}
                        </button>

                        {/* Collapsible Question Types Grid */}
                        {showAddQuestion && (
                            <div className="mt-3 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4 animate-in slide-in-from-top-2 duration-200">
                                <p className="text-xs text-text-light dark:text-dark-text-muted mb-3">
                                    {t('selectQuestionType') || 'Select a question type:'}
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {QUESTION_TYPES_CONFIG.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => addQuestion(type.id)}
                                            className="flex items-center gap-2 p-3 text-start rounded-lg border border-gray-200 dark:border-dark-border hover:border-primary hover:bg-primary/5 active:bg-primary/10 transition-colors"
                                        >
                                            <type.icon className="w-4 h-4 text-primary flex-shrink-0" />
                                            <span className="text-sm text-text dark:text-dark-text truncate">
                                                {t(type.labelKey)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Empty State - Only show when no questions */}
                    {questions.length === 0 && !showAddQuestion && (
                        <div className="text-center py-8 sm:py-12 bg-gray-50 dark:bg-dark-surface/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-dark-border">
                            <List className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-gray-300 dark:text-dark-text-muted mb-2 sm:mb-3" />
                            <p className="text-sm sm:text-base text-text-light dark:text-dark-text-muted mb-1 sm:mb-2">
                                {t('noQuestions')}
                            </p>
                            <p className="text-xs sm:text-sm text-text-light dark:text-dark-text-muted lg:hidden">
                                {t('addQuestionsHintMobile') || 'Tap the button above to add questions'}
                            </p>
                            <p className="text-xs sm:text-sm text-text-light dark:text-dark-text-muted hidden lg:block">
                                {t('addQuestionsHint')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Question Types Sidebar - Desktop only */}
                <div className="hidden lg:block space-y-4">
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4 sticky top-24">
                        <h3 className="font-semibold text-text dark:text-dark-text mb-4">
                            {t('addQuestionTitle')}
                        </h3>
                        <div className="space-y-2">
                            {QUESTION_TYPES_CONFIG.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => addQuestion(type.id)}
                                    className="w-full flex items-center gap-3 p-3 text-start rounded-lg border border-gray-200 dark:border-dark-border hover:border-primary hover:bg-primary/5 transition-colors"
                                >
                                    <type.icon className="w-4 h-4 text-primary" />
                                    <span className="text-sm text-text dark:text-dark-text">
                                        {t(type.labelKey)}
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
