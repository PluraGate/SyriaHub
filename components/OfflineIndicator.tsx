'use client'

import { usePathname } from 'next/navigation'
import { WifiOff, Cloud } from 'lucide-react'
import { useServiceWorker } from '@/hooks/useServiceWorker'
import { useTranslations } from 'next-intl'

/**
 * Offline Indicator Component
 * Shows connection status and pending sync count
 */
export function OfflineIndicator() {
    const t = useTranslations('PWA')
    const pathname = usePathname()
    const { isOffline, pendingSync, isReady } = useServiceWorker()

    // Hide on coming-soon page or when not needed
    if (pathname?.includes('/coming-soon')) {
        return null
    }

    // Don't show anything if service worker isn't ready or we're online with no pending
    if (!isReady || (!isOffline && pendingSync === 0)) {
        return null
    }

    const getSyncingText = () => {
        if (pendingSync === 1) {
            return t('syncing', { count: pendingSync })
        }
        return t('syncingPlural', { count: pendingSync })
    }

    return (
        <div className="fixed bottom-4 right-4 z-40">
            {isOffline ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm">
                    <WifiOff className="w-4 h-4" />
                    <span>{t('offline')}</span>
                </div>
            ) : pendingSync > 0 ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm">
                    <Cloud className="w-4 h-4 animate-pulse" />
                    <span>{getSyncingText()}</span>
                </div>
            ) : null}
        </div>
    )
}

