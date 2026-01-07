'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { X, BookOpen, MessageSquare, Quote, PenSquare, ArrowRight, Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { hasSeenOnboarding } from '@/lib/sessionContext'

const FIRST_CONTRIBUTION_KEY = 'syriahub_first_contribution_shown'
const FIRST_CONTRIBUTION_COMPLETED_KEY = 'syriahub_first_contribution_completed'

interface ContributionStep {
    id: 'browse' | 'comment' | 'cite' | 'publish'
    icon: React.ElementType
    titleKey: string
    descriptionKey: string
    actionKey: string
    href: string
}

export function FirstContributionPrompt() {
    const t = useTranslations('FirstContribution')
    const router = useRouter()
    const [isVisible, setIsVisible] = useState(false)
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [completedSteps, setCompletedSteps] = useState<string[]>([])

    const steps: ContributionStep[] = [
        {
            id: 'browse',
            icon: BookOpen,
            titleKey: 'browse.title',
            descriptionKey: 'browse.description',
            actionKey: 'browse.action',
            href: '/insights'
        },
        {
            id: 'comment',
            icon: MessageSquare,
            titleKey: 'comment.title',
            descriptionKey: 'comment.description',
            actionKey: 'comment.action',
            href: '/insights'
        },
        {
            id: 'cite',
            icon: Quote,
            titleKey: 'cite.title',
            descriptionKey: 'cite.description',
            actionKey: 'cite.action',
            href: '/research-lab'
        },
        {
            id: 'publish',
            icon: PenSquare,
            titleKey: 'publish.title',
            descriptionKey: 'publish.description',
            actionKey: 'publish.action',
            href: '/editor'
        }
    ]

    useEffect(() => {
        // Load completed steps from local storage
        if (typeof window === 'undefined') return

        try {
            const saved = localStorage.getItem('syriahub_contribution_steps')
            if (saved) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCompletedSteps(JSON.parse(saved))
            }
        } catch {
            // Ignore parse errors
        }
    }, [])

    useEffect(() => {
        // Only show after onboarding has been completed
        if (typeof window === 'undefined') return

        const hasSeenPrompt = localStorage.getItem(FIRST_CONTRIBUTION_KEY)
        const hasCompletedPrompt = localStorage.getItem(FIRST_CONTRIBUTION_COMPLETED_KEY)

        // Show prompt if:
        // 1. User has completed onboarding
        // 2. User hasn't dismissed this prompt
        // 3. User hasn't completed all steps
        if (hasSeenOnboarding() && !hasSeenPrompt && !hasCompletedPrompt) {
            // Delay appearance to not overwhelm
            const timer = setTimeout(() => setIsVisible(true), 2000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleDismiss = () => {
        localStorage.setItem(FIRST_CONTRIBUTION_KEY, 'true')
        setIsVisible(false)
    }

    const handleStepClick = (step: ContributionStep, index: number) => {
        // Mark this step as the current focus
        setCurrentStepIndex(index)

        // Navigate to the relevant page
        router.push(step.href)

        // Mark step as completed (optimistically)
        const newCompleted = [...completedSteps, step.id]
        setCompletedSteps(newCompleted)
        localStorage.setItem('syriahub_contribution_steps', JSON.stringify(newCompleted))

        // If all steps completed, mark the whole prompt as done
        if (newCompleted.length >= steps.length) {
            localStorage.setItem(FIRST_CONTRIBUTION_COMPLETED_KEY, 'true')
            setIsVisible(false)
        }
    }

    const handleSkipAll = () => {
        localStorage.setItem(FIRST_CONTRIBUTION_KEY, 'true')
        setIsVisible(false)
    }

    if (!isVisible) return null

    const CurrentIcon = steps[currentStepIndex].icon

    return (
        <div className="fixed bottom-6 end-6 z-40 w-full max-w-sm animate-slide-up">
            <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-border overflow-hidden">
                {/* Header */}
                <div className="relative px-5 pt-5 pb-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 dark:from-primary/10 dark:via-secondary/10 dark:to-accent/10">
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 end-3 p-1.5 rounded-full text-text-light dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                        aria-label={t('dismiss')}
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-xl">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-text dark:text-dark-text">
                                {t('title')}
                            </h3>
                            <p className="text-xs text-text-light dark:text-dark-text-muted">
                                {t('subtitle')}
                            </p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex gap-1.5 mt-4">
                        {steps.map((step, idx) => (
                            <div
                                key={step.id}
                                className={`h-1.5 flex-1 rounded-full transition-colors ${completedSteps.includes(step.id)
                                    ? 'bg-primary'
                                    : 'bg-gray-200 dark:bg-dark-border'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Steps */}
                <div className="px-3 py-3 space-y-1 max-h-64 overflow-y-auto">
                    {steps.map((step, idx) => {
                        const StepIcon = step.icon
                        const isCompleted = completedSteps.includes(step.id)
                        const isCurrent = idx === currentStepIndex && !isCompleted

                        return (
                            <button
                                key={step.id}
                                onClick={() => handleStepClick(step, idx)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-start transition-all ${isCompleted
                                    ? 'bg-primary/5 dark:bg-primary/10'
                                    : isCurrent
                                        ? 'bg-gray-50 dark:bg-dark-bg ring-2 ring-primary/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-dark-bg'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${isCompleted
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-gray-100 dark:bg-dark-border text-text-light dark:text-dark-text-muted'
                                    }`}>
                                    <StepIcon className="w-4 h-4" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-medium ${isCompleted
                                            ? 'text-primary line-through'
                                            : 'text-text dark:text-dark-text'
                                            }`}>
                                            {t(step.titleKey)}
                                        </span>
                                        {isCompleted && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                                                ✓
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-text-light dark:text-dark-text-muted truncate">
                                        {t(step.descriptionKey)}
                                    </p>
                                </div>

                                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isCompleted
                                    ? 'text-primary'
                                    : 'text-gray-300 dark:text-dark-border'
                                    }`} />
                            </button>
                        )
                    })}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
                    <button
                        onClick={handleSkipAll}
                        className="text-xs text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text transition-colors"
                    >
                        {t('skipForNow')}
                    </button>

                    <span className="text-xs text-text-light/60 dark:text-dark-text-muted/60">
                        {completedSteps.length}/{steps.length} {t('completed')}
                    </span>
                </div>
            </div>
        </div>
    )
}
