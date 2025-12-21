'use client'

import { useState } from 'react'
import {
    Bug,
    Lightbulb,
    AlertTriangle,
    Shuffle,
    HelpCircle,
    X,
    Loader2,
    CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'

interface FeedbackDialogProps {
    isOpen: boolean
    onClose: () => void
    defaultPageUrl?: string
}

type Category = 'bug' | 'ux' | 'section' | 'alternative' | 'other'

const categories: { id: Category; icon: typeof Bug; colorClass: string }[] = [
    { id: 'bug', icon: Bug, colorClass: 'text-red-500 dark:text-red-400' },
    { id: 'ux', icon: Lightbulb, colorClass: 'text-yellow-500 dark:text-yellow-400' },
    { id: 'section', icon: AlertTriangle, colorClass: 'text-orange-500 dark:text-orange-400' },
    { id: 'alternative', icon: Shuffle, colorClass: 'text-blue-500 dark:text-blue-400' },
    { id: 'other', icon: HelpCircle, colorClass: 'text-gray-500 dark:text-gray-400' },
]

export function FeedbackDialog({ isOpen, onClose, defaultPageUrl }: FeedbackDialogProps) {
    const [category, setCategory] = useState<Category>('bug')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const { showToast } = useToast()
    const t = useTranslations('Feedback')
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim() || !description.trim()) {
            showToast(t('fillRequired'), 'error')
            return
        }

        setIsSubmitting(true)

        try {
            const { data, error } = await supabase.rpc('create_feedback_ticket', {
                p_category: category,
                p_title: title.trim(),
                p_description: description.trim(),
                p_page_url: defaultPageUrl || window.location.href,
                p_browser_info: navigator.userAgent
            })

            if (error) throw error
            if (!data?.success) throw new Error(data?.error || 'Failed to submit feedback')

            setIsSuccess(true)
            showToast(t('submitSuccess'), 'success')

            // Reset and close after a short delay
            setTimeout(() => {
                setTitle('')
                setDescription('')
                setCategory('bug')
                setIsSuccess(false)
                onClose()
            }, 1500)
        } catch (error) {
            console.error('Failed to submit feedback:', error)
            showToast(t('submitError'), 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-border">
                    <h2 className="text-xl font-display font-semibold text-text dark:text-dark-text">
                        {t('title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border text-text-light dark:text-dark-text-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isSuccess ? (
                    <div className="p-12 text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <p className="text-lg font-medium text-text dark:text-dark-text">
                            {t('thankYou')}
                        </p>
                        <p className="text-text-light dark:text-dark-text-muted mt-2">
                            {t('reviewSoon')}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Category Selection */}
                        <div>
                            <label className="block text-sm font-medium text-text dark:text-dark-text mb-3">
                                {t('category')}
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                                {categories.map(cat => {
                                    const Icon = cat.icon
                                    const isSelected = category === cat.id
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${isSelected
                                                ? 'border-primary bg-primary/10'
                                                : 'border-gray-200 dark:border-dark-border hover:border-primary/50'
                                                }`}
                                        >
                                            <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : cat.colorClass}`} />
                                            <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-text-light dark:text-dark-text-muted'}`}>
                                                {t(`categories.${cat.id}`)}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label htmlFor="feedback-title" className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                {t('titleLabel')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="feedback-title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('titlePlaceholder')}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder-text-light/60 dark:placeholder-dark-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                maxLength={200}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="feedback-description" className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                {t('descriptionLabel')} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="feedback-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('descriptionPlaceholder')}
                                rows={5}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder-text-light/60 dark:placeholder-dark-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                            />
                        </div>

                        {/* Page URL (auto-filled, read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-text-light dark:text-dark-text-muted mb-2">
                                {t('pageUrl')}
                            </label>
                            <input
                                type="text"
                                value={defaultPageUrl || (typeof window !== 'undefined' ? window.location.href : '')}
                                readOnly
                                className="w-full px-4 py-2 rounded-xl border border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text-light dark:text-dark-text-muted text-sm truncate"
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !title.trim() || !description.trim()}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        {t('submitting')}
                                    </>
                                ) : (
                                    t('submit')
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
