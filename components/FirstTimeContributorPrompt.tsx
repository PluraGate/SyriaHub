'use client'

import { useState } from 'react'
import { Lightbulb, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface FirstTimeContributorPromptProps {
    onDismiss: () => void
}

/**
 * A subtle epistemic prompt shown to first-time contributors on the editor.
 * Reinforces the research commons identity with guiding questions.
 */
export function FirstTimeContributorPrompt({ onDismiss }: FirstTimeContributorPromptProps) {
    const t = useTranslations('Editor')
    const [dismissed, setDismissed] = useState(false)

    const handleDismiss = () => {
        setDismissed(true)
        // Mark as seen in sessionStorage
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('firstTimePromptSeen', 'true')
        }
        onDismiss()
    }

    if (dismissed) return null

    return (
        <div className="relative p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
            {/* Dismiss button */}
            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1 rounded-lg hover:bg-primary/10 dark:hover:bg-white/10 transition-colors"
                aria-label={t('firstTimePrompt.dismiss') || 'Dismiss'}
            >
                <X className="w-4 h-4 text-primary/60 dark:text-white/80" />
            </button>

            <div className="flex items-start gap-3 pr-6">
                {/* Icon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 dark:bg-secondary-light/20 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-primary dark:text-secondary-light" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-primary dark:text-secondary-light">
                        {t('firstTimePrompt.title')}
                    </h4>
                    <p className="text-sm text-text-light dark:text-dark-text-muted">
                        {t('firstTimePrompt.description')}
                    </p>
                    <ul className="text-xs text-text-light dark:text-dark-text-muted space-y-1 list-disc list-inside pl-1">
                        <li>{t('firstTimePrompt.question1')}</li>
                        <li>{t('firstTimePrompt.question2')}</li>
                        <li>{t('firstTimePrompt.question3')}</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

/**
 * Hook to check if this is the user's first contribution
 */
export function useFirstTimeContributor(userId: string | undefined) {
    const [isFirstTime, setIsFirstTime] = useState(false)
    const [loading, setLoading] = useState(true)

    // Check on mount if the user has contributed before
    useState(() => {
        async function checkContributions() {
            if (!userId) {
                setLoading(false)
                return
            }

            // First check sessionStorage for quick response
            if (typeof window !== 'undefined') {
                const seen = sessionStorage.getItem('firstTimePromptSeen')
                if (seen === 'true') {
                    setIsFirstTime(false)
                    setLoading(false)
                    return
                }
            }

            try {
                const { createClient } = await import('@/lib/supabase/client')
                const supabase = createClient()

                // Check if user has any published posts
                const { count, error } = await supabase
                    .from('posts')
                    .select('id', { count: 'exact', head: true })
                    .eq('author_id', userId)
                    .eq('status', 'published')

                if (error) {
                    console.error('Error checking contributions:', error)
                    setIsFirstTime(false)
                } else {
                    setIsFirstTime(count === 0)
                }
            } catch (err) {
                console.error('Failed to check first-time contributor status:', err)
                setIsFirstTime(false)
            } finally {
                setLoading(false)
            }
        }

        checkContributions()
    })

    return { isFirstTime, loading }
}
