'use client'

import { WifiOff, Cloud } from 'lucide-react'
import { useServiceWorker } from '@/hooks/useServiceWorker'

/**
 * Offline Indicator Component
 * Shows connection status and pending sync count
 */
export function OfflineIndicator() {
    const { isOffline, pendingSync, isReady } = useServiceWorker()

    // Don't show anything if service worker isn't ready or we're online with no pending
    if (!isReady || (!isOffline && pendingSync === 0)) {
        return null
    }

    return (
        <div className="fixed bottom-4 right-4 z-40">
            {isOffline ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm">
                    <WifiOff className="w-4 h-4" />
                    <span>Offline</span>
                </div>
            ) : pendingSync > 0 ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm">
                    <Cloud className="w-4 h-4 animate-pulse" />
                    <span>Syncing {pendingSync} item{pendingSync > 1 ? 's' : ''}...</span>
                </div>
            ) : null}
        </div>
    )
}
