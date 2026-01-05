'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { hasSeenOnboarding, markOnboardingShown } from '@/lib/sessionContext'
import {
    X,
    BookOpen,
    Scale,
    Lightbulb,
    Search,
    Users,
    FileText,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    Target,
    Globe,
    Calendar,
    PenSquare,
    Bot,
    GitFork,
    MessageSquare,
    BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Step {
    id: number
    titleKey: string
    subtitleKey: string
    content: React.ReactNode
    icon: React.ElementType
    iconBg: string
}

export function EpistemicOnboarding() {
    const t = useTranslations('Onboarding')
    const [isOpen, setIsOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        // Session-based onboarding - only shows once per session
        if (!hasSeenOnboarding()) {
            const timer = setTimeout(() => setIsOpen(true), 800)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleDismiss = () => {
        markOnboardingShown()
        setIsOpen(false)
    }

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            handleDismiss()
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const steps: Step[] = [
        {
            id: 0,
            titleKey: 'welcome.title',
            subtitleKey: 'welcome.subtitle',
            icon: Globe,
            iconBg: 'bg-primary/10 text-primary',
            content: (
                <div className="space-y-6">
                    <p className="text-base text-text-light dark:text-dark-text-muted leading-relaxed">
                        {t('welcome.description')}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <HighlightCard
                            icon={Target}
                            title={t('welcome.mission')}
                            description={t('welcome.missionDesc')}
                        />
                        <HighlightCard
                            icon={Users}
                            title={t('welcome.community')}
                            description={t('welcome.communityDesc')}
                        />
                    </div>

                    <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-xl border border-primary/10">
                        <p className="text-sm text-text dark:text-dark-text text-center font-medium">
                            {t('welcome.tagline')}
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 1,
            titleKey: 'create.title',
            subtitleKey: 'create.subtitle',
            icon: PenSquare,
            iconBg: 'bg-secondary/10 text-secondary',
            content: (
                <div className="space-y-5">
                    <p className="text-base text-text-light dark:text-dark-text-muted leading-relaxed">
                        {t('create.description')}
                    </p>


                    <div className="grid gap-4">
                        <FeatureRow
                            icon={FileText}
                            title={t('create.articles')}
                            description={t('create.articlesDesc')}
                            highlight
                        />
                        <FeatureRow
                            icon={GitFork}
                            title={t('create.fork')}
                            description={t('create.forkDesc')}
                            highlight
                        />
                        <FeatureRow
                            icon={MessageSquare}
                            title={t('create.questions')}
                            description={t('create.questionsDesc')}
                        />
                        <FeatureRow
                            icon={Calendar}
                            title={t('create.events')}
                            description={t('create.eventsDesc')}
                        />
                    </div>
                </div>
            )
        },
        {
            id: 2,
            titleKey: 'researchLab.title',
            subtitleKey: 'researchLab.subtitle',
            icon: Lightbulb,
            iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
            content: (
                <div className="space-y-5">
                    <p className="text-base text-text-light dark:text-dark-text-muted leading-relaxed">
                        {t('researchLab.description')}
                    </p>

                    <div className="grid gap-4">
                        <FeatureRow
                            icon={Search}
                            title={t('researchLab.search')}
                            description={t('researchLab.searchDesc')}
                            tag="Available Now"
                        />
                        <FeatureRow
                            icon={Bot}
                            title={t('researchLab.advisor')}
                            description={t('researchLab.advisorDesc')}
                            tag="Coming Soon"
                        />
                        <FeatureRow
                            icon={BarChart3}
                            title={t('researchLab.surveys')}
                            description={t('researchLab.surveysDesc')}
                            tag="Coming Soon"
                        />
                        <FeatureRow
                            icon={Sparkles}
                            title={t('researchLab.graph')}
                            description={t('researchLab.graphDesc')}
                            tag="Coming Soon"
                        />
                    </div>
                </div>
            )
        },
        {
            id: 3,
            titleKey: 'epistemic.title',
            subtitleKey: 'epistemic.subtitle',
            icon: Scale,
            iconBg: 'bg-accent/10 text-accent',
            content: (
                <div className="space-y-5">
                    <p className="text-base text-text-light dark:text-dark-text-muted leading-relaxed">
                        {t('epistemic.description')}
                    </p>

                    <div className="space-y-4">
                        <PrincipleCard
                            number="1"
                            title={t('epistemic.principle1')}
                            description={t('epistemic.principle1Desc')}
                        />
                        <PrincipleCard
                            number="2"
                            title={t('epistemic.principle2')}
                            description={t('epistemic.principle2Desc')}
                        />
                        <PrincipleCard
                            number="3"
                            title={t('epistemic.principle3')}
                            description={t('epistemic.principle3Desc')}
                        />
                    </div>

                    <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
                        <p className="text-sm text-text dark:text-dark-text italic text-center leading-relaxed">
                            {t('epistemic.tagline')}
                        </p>
                    </div>
                </div>
            )
        }
    ]

    if (!isOpen) return null

    const CurrentIcon = steps[currentStep].icon

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-2xl bg-white dark:bg-dark-surface rounded-3xl shadow-2xl overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-5 right-5 z-10 p-2 rounded-full text-text-light dark:text-dark-text-muted hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                    aria-label={t('closeOnboarding')}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Progress Indicator */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {steps.map((step, idx) => (
                        <button
                            key={step.id}
                            onClick={() => setCurrentStep(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep
                                ? 'bg-primary w-8'
                                : idx < currentStep
                                    ? 'bg-primary/40 w-2'
                                    : 'bg-gray-200 dark:bg-dark-border w-2'
                                }`}
                            aria-label={`Step ${idx + 1}`}
                        />
                    ))}
                </div>

                {/* Main Content */}
                <div className="pt-16 pb-8 px-8 sm:px-12">
                    {/* Icon & Title */}
                    <div className="text-center mb-8">
                        <div className={`inline-flex p-4 rounded-2xl ${steps[currentStep].iconBg} mb-5`}>
                            <CurrentIcon className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-text dark:text-dark-text mb-2">
                            {t(steps[currentStep].titleKey)}
                        </h2>
                        <p className="text-base text-text-light dark:text-dark-text-muted">
                            {t(steps[currentStep].subtitleKey)}
                        </p>
                    </div>

                    {/* Step Content */}
                    <div className="min-h-[280px] sm:min-h-[300px]">
                        {steps[currentStep].content}
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="px-8 sm:px-12 pb-8 flex items-center justify-between gap-4">
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className={`gap-2 text-base ${currentStep === 0 ? 'invisible' : ''}`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('back')}
                    </Button>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-text-light dark:text-dark-text-muted font-medium">
                            {currentStep + 1}
                        </span>
                        <span className="text-text-light/50 dark:text-dark-text-muted/50">/</span>
                        <span className="text-sm text-text-light dark:text-dark-text-muted">
                            {steps.length}
                        </span>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleNext}
                        className="gap-2 bg-primary hover:bg-primary-dark text-white text-base px-6"
                    >
                        {currentStep === steps.length - 1 ? (
                            <>{t('beginResearch')}</>
                        ) : (
                            <>
                                {t('next')}
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

// Highlight card for welcome step
function HighlightCard({
    icon: Icon,
    title,
    description
}: {
    icon: React.ElementType
    title: string
    description: string
}) {
    return (
        <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl text-center">
            <div className="inline-flex p-2 bg-white dark:bg-dark-surface rounded-lg shadow-sm mb-2">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <h4 className="text-sm font-semibold text-text dark:text-dark-text mb-1">{title}</h4>
            <p className="text-xs text-text-light dark:text-dark-text-muted leading-relaxed">{description}</p>
        </div>
    )
}

// Feature row for create & research lab steps
function FeatureRow({
    icon: Icon,
    title,
    description,
    highlight = false,
    tag
}: {
    icon: React.ElementType
    title: string
    description: string
    highlight?: boolean
    tag?: string
}) {
    return (
        <div className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${highlight
                ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20'
                : 'bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-bg/80'
            }`}>
            <div className={`flex-shrink-0 p-2.5 rounded-xl shadow-sm ${highlight ? 'bg-white dark:bg-dark-surface text-primary' : 'bg-white dark:bg-dark-surface text-text-light dark:text-dark-text-muted'
                }`}>
                <Icon className={`w-5 h-5 ${highlight ? 'text-primary' : ''}`} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h4 className={`text-base font-semibold ${highlight ? 'text-primary dark:text-primary-light' : 'text-text dark:text-dark-text'}`}>
                        {title}
                    </h4>
                    {tag && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${tag === 'Available Now'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                            {tag}
                        </span>
                    )}
                </div>
                <p className="text-sm text-text-light dark:text-dark-text-muted leading-relaxed">{description}</p>
            </div>
        </div>
    )
}

// Principle card for epistemic step
function PrincipleCard({
    number,
    title,
    description
}: {
    number: string
    title: string
    description: string
}) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                {number}
            </div>
            <div className="flex-1 pt-0.5">
                <h4 className="text-base font-semibold text-text dark:text-dark-text mb-0.5">{title}</h4>
                <p className="text-sm text-text-light dark:text-dark-text-muted leading-relaxed">{description}</p>
            </div>
        </div>
    )
}
