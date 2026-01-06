'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/UserAvatar'
import {
    Sparkles,
    User,
    BookOpen,
    ArrowRight,
    Upload,
    Check
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface OnboardingModalProps {
    userId: string
    userEmail: string
    userName?: string
}

const ONBOARDING_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to SyriaHub',
        description: 'Your journey into collaborative research begins here.',
        icon: Sparkles,
    },
    {
        id: 'profile',
        title: 'Complete Your Profile',
        description: 'Tell the community about yourself and your research interests.',
        icon: User,
    },
    {
        id: 'explore',
        title: 'Start Exploring',
        description: 'Browse topics, follow researchers, and engage with the community.',
        icon: BookOpen,
    },
]

export function OnboardingModal({ userId, userEmail, userName }: OnboardingModalProps) {
    const t = useTranslations('Onboarding')
    const tProfile = useTranslations('Profile')
    const tCommon = useTranslations('Common')
    const [isOpen, setIsOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [name, setName] = useState(userName || '')
    const [bio, setBio] = useState('')
    const [affiliation, setAffiliation] = useState('')
    const [saving, setSaving] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Check if user needs onboarding
    useEffect(() => {
        const checkOnboarding = async () => {
            const onboardingComplete = localStorage.getItem(`onboarding_complete_${userId}`)
            if (onboardingComplete) return

            // Check if user has completed profile
            const { data: profile } = await supabase
                .from('users')
                .select('bio, affiliation')
                .eq('id', userId)
                .single()

            // Show onboarding if bio and affiliation are empty
            if (!profile?.bio && !profile?.affiliation) {
                setIsOpen(true)
            }
        }

        checkOnboarding()
    }, [userId, supabase])

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSaveProfile = async () => {
        setSaving(true)
        try {
            await supabase
                .from('users')
                .update({
                    name: name || userName,
                    bio,
                    affiliation,
                })
                .eq('id', userId)

            localStorage.setItem(`onboarding_complete_${userId}`, 'true')
            setIsOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Failed to save profile:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleSkip = () => {
        localStorage.setItem(`onboarding_complete_${userId}`, 'true')
        setIsOpen(false)
    }

    const currentStepData = ONBOARDING_STEPS[currentStep]
    const StepIcon = currentStepData.icon

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-dark-surface max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pt-2 sm:pt-0">
                    <div className="flex items-center justify-center mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center">
                            <StepIcon className="w-5 h-5 sm:w-6 sm:h-6 text-text dark:text-dark-text" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-lg sm:text-xl">
                        {currentStepData.title}
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm sm:text-base">
                        {currentStepData.description}
                    </DialogDescription>
                </DialogHeader>

                {/* Step content */}
                <div className="py-3 sm:py-4">
                    {currentStep === 0 && (
                        <div className="text-center space-y-3 sm:space-y-4">
                            <div className="flex justify-center">
                                <UserAvatar name={userName} email={userEmail} size="xl" />
                            </div>
                            <p className="text-xs sm:text-sm text-text-light dark:text-dark-text-muted">
                                {userName ? `Welcome, ${userName}.` : 'Welcome.'} Ready to contribute?
                            </p>
                            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4">
                                <div className="text-center p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-dark-border">
                                    <div className="text-xs sm:text-sm font-medium text-text dark:text-dark-text">Publish</div>
                                    <div className="text-[10px] sm:text-xs text-text-light dark:text-dark-text-muted mt-0.5">Share research</div>
                                </div>
                                <div className="text-center p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-dark-border">
                                    <div className="text-xs sm:text-sm font-medium text-text dark:text-dark-text">Deliberate</div>
                                    <div className="text-[10px] sm:text-xs text-text-light dark:text-dark-text-muted mt-0.5">Collaborate</div>
                                </div>
                                <div className="text-center p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-dark-border">
                                    <div className="text-xs sm:text-sm font-medium text-text dark:text-dark-text">Grow</div>
                                    <div className="text-[10px] sm:text-xs text-text-light dark:text-dark-text-muted mt-0.5">Establish credibility</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                                    {tProfile('displayName')}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="input dark:bg-dark-bg dark:text-dark-text dark:border-dark-border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                                    {tProfile('bio')}
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself and your research interests..."
                                    rows={3}
                                    className="input resize-none dark:bg-dark-bg dark:text-dark-text dark:border-dark-border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                                    {tProfile('affiliation')}
                                </label>
                                <input
                                    type="text"
                                    value={affiliation}
                                    onChange={(e) => setAffiliation(e.target.value)}
                                    placeholder="University, Organization, or Independent"
                                    className="input dark:bg-dark-bg dark:text-dark-text dark:border-dark-border"
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-3 sm:space-y-4 text-center">
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-dark-bg text-left">
                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm text-text dark:text-dark-text">
                                        Browse the <strong>Research Stream</strong> for latest work
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-dark-bg text-left">
                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm text-text dark:text-dark-text">
                                        <strong>Explore</strong> topics and trending tags
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-dark-bg text-left">
                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm text-text dark:text-dark-text">
                                        Join <strong>Groups</strong> to collaborate
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gray-50 dark:bg-dark-bg text-left">
                                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-xs sm:text-sm text-text dark:text-dark-text">
                                        Ask <strong>Questions</strong> to solve problems
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step indicators */}
                <div className="flex justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    {ONBOARDING_STEPS.map((_, index) => (
                        <div
                            key={index}
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${index === currentStep
                                ? 'w-5 sm:w-6 bg-primary dark:bg-accent-light'
                                : index < currentStep
                                    ? 'bg-primary/50 dark:bg-accent-light/50'
                                    : 'bg-gray-200 dark:bg-dark-border'
                                }`}
                        />
                    ))}
                </div>

                <DialogFooter className="gap-2 flex-col-reverse sm:flex-row">
                    {currentStep > 0 && (
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            className="w-full sm:w-auto sm:flex-none"
                        >
                            {tCommon('back')}
                        </Button>
                    )}

                    {currentStep === 0 && (
                        <button
                            onClick={handleSkip}
                            className="text-xs sm:text-sm text-text-light dark:text-dark-text-muted hover:underline py-2 sm:py-0"
                        >
                            {t('skipForNow')}
                        </button>
                    )}

                    {currentStep < ONBOARDING_STEPS.length - 1 ? (
                        <Button onClick={handleNext} className="w-full sm:w-auto sm:flex-none btn-press">
                            {tCommon('next')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="w-full sm:w-auto sm:flex-none btn-press"
                        >
                            {saving ? t('saving') : t('getStarted')}
                            <Sparkles className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
