'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * PWA Install Prompt Component
 * Shows a banner to install the app when the browser supports it
 */
export function InstallPWA() {
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
                            Install SyriaHub
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Add to your home screen for quick access and offline reading
                        </p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-gray-500 hover:text-gray-300 transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={handleInstall}
                        className="flex-1 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        Install
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-3 py-2 text-gray-400 text-sm hover:text-gray-200 transition-colors"
                    >
                        Not now
                    </button>
                </div>
            </div>
        </div>
    )
}
