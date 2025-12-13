'use client'

import { useEffect, useState } from 'react'
import { initOfflineStorage, isOnline, registerConnectivityListeners, getPendingCount } from '@/lib/offlineStorage'

interface ServiceWorkerState {
    isSupported: boolean
    isReady: boolean
    isOffline: boolean
    pendingSync: number
    updateAvailable: boolean
}

/**
 * Hook to manage service worker registration and offline state
 */
export function useServiceWorker() {
    const [state, setState] = useState<ServiceWorkerState>({
        isSupported: false,
        isReady: false,
        isOffline: false,
        pendingSync: 0,
        updateAvailable: false,
    })

    useEffect(() => {
        // Check if service workers are supported
        if (!('serviceWorker' in navigator)) {
            console.log('[SW Hook] Service workers not supported')
            return
        }

        setState((prev) => ({ ...prev, isSupported: true, isOffline: !isOnline() }))

        // Initialize offline storage
        initOfflineStorage()
            .then(() => {
                console.log('[SW Hook] Offline storage initialized')
                return getPendingCount()
            })
            .then((count) => {
                setState((prev) => ({ ...prev, pendingSync: count }))
            })
            .catch(console.error)

        // Register service worker
        navigator.serviceWorker
            .register('/sw.js', { scope: '/' })
            .then((registration) => {
                console.log('[SW Hook] Service worker registered:', registration.scope)
                setState((prev) => ({ ...prev, isReady: true }))

                // Check for updates
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing
                    if (!installingWorker) return

                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // New update available
                                console.log('[SW Hook] New content available')
                                setState((prev) => ({ ...prev, updateAvailable: true }))
                            } else {
                                // Content cached for offline use
                                console.log('[SW Hook] Content cached for offline use')
                            }
                        }
                    }
                }
            })
            .catch((error) => {
                console.error('[SW Hook] Service worker registration failed:', error)
            })

        // Register connectivity listeners
        const cleanup = registerConnectivityListeners(
            () => {
                setState((prev) => ({ ...prev, isOffline: false }))
                // Refresh pending count when coming back online
                getPendingCount().then((count) => {
                    setState((prev) => ({ ...prev, pendingSync: count }))
                })
            },
            () => {
                setState((prev) => ({ ...prev, isOffline: true }))
            }
        )

        return cleanup
    }, [])

    /**
     * Force update service worker
     */
    const updateServiceWorker = async () => {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration?.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            window.location.reload()
        }
    }

    /**
     * Update pending sync count
     */
    const refreshPendingCount = async () => {
        const count = await getPendingCount()
        setState((prev) => ({ ...prev, pendingSync: count }))
    }

    return {
        ...state,
        updateServiceWorker,
        refreshPendingCount,
    }
}
