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
            <DialogContent className="sm:max-w-md bg-white dark:bg-dark-surface">
                <DialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-dark-bg flex items-center justify-center">
                            <StepIcon className="w-6 h-6 text-text dark:text-dark-text" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-xl">
                        {currentStepData.title}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {currentStepData.description}
                    </DialogDescription>
                </DialogHeader>

                {/* Step content */}
                <div className="py-4">
                    {currentStep === 0 && (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <UserAvatar name={userName} email={userEmail} size="xl" />
                            </div>
                            <p className="text-sm text-text-light dark:text-dark-text-muted">
                                {userName ? `Welcome, ${userName}.` : 'Welcome.'} Ready to contribute?
                            </p>
                            <div className="grid grid-cols-3 gap-3 pt-4">
                                <div className="text-center p-3 rounded-lg border border-gray-200 dark:border-dark-border">
                                    <div className="text-sm font-medium text-text dark:text-dark-text">Publish</div>
                                    <div className="text-xs text-text-light dark:text-dark-text-muted mt-0.5">Share research</div>
                                </div>
                                <div className="text-center p-3 rounded-lg border border-gray-200 dark:border-dark-border">
                                    <div className="text-sm font-medium text-text dark:text-dark-text">Deliberate</div>
                                    <div className="text-xs text-text-light dark:text-dark-text-muted mt-0.5">Collaborate</div>
                                </div>
                                <div className="text-center p-3 rounded-lg border border-gray-200 dark:border-dark-border">
                                    <div className="text-sm font-medium text-text dark:text-dark-text">Grow</div>
                                    <div className="text-xs text-text-light dark:text-dark-text-muted mt-0.5">Establish credibility</div>
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
                        <div className="space-y-4 text-center">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-bg text-left">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span className="text-sm text-text dark:text-dark-text">
                                        Browse the <strong>Research Stream</strong> for latest work
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-bg text-left">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span className="text-sm text-text dark:text-dark-text">
                                        <strong>Explore</strong> topics and trending tags
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-bg text-left">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span className="text-sm text-text dark:text-dark-text">
                                        Join <strong>Groups</strong> to collaborate
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-dark-bg text-left">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span className="text-sm text-text dark:text-dark-text">
                                        Ask <strong>Questions</strong> to solve problems
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step indicators */}
                <div className="flex justify-center gap-2 mb-4">
                    {ONBOARDING_STEPS.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentStep
                                ? 'w-6 bg-primary dark:bg-accent-light'
                                : index < currentStep
                                    ? 'bg-primary/50 dark:bg-accent-light/50'
                                    : 'bg-gray-200 dark:bg-dark-border'
                                }`}
                        />
                    ))}
                </div>

                <DialogFooter className="gap-2">
                    {currentStep > 0 && (
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            className="flex-1 sm:flex-none"
                        >
                            {tCommon('back')}
                        </Button>
                    )}

                    {currentStep === 0 && (
                        <button
                            onClick={handleSkip}
                            className="text-sm text-text-light dark:text-dark-text-muted hover:underline"
                        >
                            {t('skipForNow')}
                        </button>
                    )}

                    {currentStep < ONBOARDING_STEPS.length - 1 ? (
                        <Button onClick={handleNext} className="flex-1 sm:flex-none btn-press">
                            {tCommon('next')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="flex-1 sm:flex-none btn-press"
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
