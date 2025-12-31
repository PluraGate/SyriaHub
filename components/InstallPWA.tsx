'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * PWA Install Prompt Component
 * Shows a banner to install the app when the browser supports it
 */
export function InstallPWA() {
    const t = useTranslations('PWA')
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        // Check if user previously dismissed
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (dismissed) return

        const handleBeforeInstall = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setShowBanner(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstall)

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional check during initialization
            setShowBanner(false)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setShowBanner(false)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setShowBanner(false)
        localStorage.setItem('pwa-install-dismissed', 'true')
    }

    if (!showBanner) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-4">
            <div className="bg-dark-surface border border-dark-border rounded-xl p-4 shadow-lg">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Download className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-100">
                            {t('installTitle')}
                        </h3>
                        <p className="text-xs text-secondary/70 dark:text-dark-text-muted mt-0.5">
                            {t('installDescription')}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDismiss}
                        className="text-gray-500 hover:text-gray-300 -mr-2"
                        aria-label={t('dismiss')}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Operational Disclosure */}
                <div className="mt-3 space-y-2">
                    <p className="text-[10px] leading-tight text-text-muted/60 dark:text-dark-text-muted/40 border-l-2 border-primary/20 ps-2">
                        {t('constraintsNote')}
                    </p>
                    <p className="text-[10px] leading-tight text-text-muted/60 dark:text-dark-text-muted/40 italic">
                        {t('governanceNote')}
                    </p>
                </div>

                <div className="flex gap-2 mt-4">
                    <Button
                        onClick={handleInstall}
                        className="flex-1"
                    >
                        {t('install')}
                    </Button>
                    <Button
                        onClick={handleDismiss}
                        variant="ghost"
                        className="text-gray-400 hover:text-gray-200 hover:bg-white/5"
                    >
                        {t('notNow')}
                    </Button>
                </div>
            </div>
        </div>
    )
}

