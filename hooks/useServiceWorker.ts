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

        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional initialization in effect
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
        let reg: ServiceWorkerRegistration | null = null
        navigator.serviceWorker
            .register('/sw.js', { scope: '/' })
            .then((registration) => {
                reg = registration
                console.log('[SW Hook] Service worker registered:', registration.scope)
                setState((prev) => ({ ...prev, isReady: true }))

                // Check for updates
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing
                    if (!installingWorker) return

                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // New update available — notify the user
                                console.log('[SW Hook] New content available')
                                setState((prev) => ({ ...prev, updateAvailable: true }))
                            } else {
                                // Content cached for offline use
                                console.log('[SW Hook] Content cached for offline use')
                            }
                        }
                    }
                }

                // Also handle the case where an update was already waiting
                // (e.g. user opened a stale tab)
                if (registration.waiting) {
                    console.log('[SW Hook] Update already waiting')
                    setState((prev) => ({ ...prev, updateAvailable: true }))
                }
            })
            .catch((error) => {
                console.error('[SW Hook] Service worker registration failed:', error)
            })

        // Periodically ask the browser to check for a new sw.js
        const swPollInterval = setInterval(() => {
            reg?.update().catch(() => {})
        }, 60_000)

        // Also check for SW update when the tab regains focus
        function onVisibilityChange() {
            if (document.visibilityState === 'visible') {
                reg?.update().catch(() => {})
            }
        }
        document.addEventListener('visibilitychange', onVisibilityChange)

        // When a new SW takes control (after user accepts update),
        // reload to get fresh assets. This only fires after SKIP_WAITING
        // is sent from updateServiceWorker(), not automatically on deploy.
        let refreshing = false
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return
            refreshing = true
            window.location.reload()
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

        return () => {
            cleanup()
            clearInterval(swPollInterval)
            document.removeEventListener('visibilitychange', onVisibilityChange)
        }
    }, [])

    /**
     * Apply pending service worker update — clears caches and reloads.
     * Only call this when the user explicitly accepts the update.
     */
    const updateServiceWorker = async () => {
        // Clear all SW caches so the reload fetches fresh assets
        if ('caches' in window) {
            const keys = await caches.keys()
            await Promise.all(keys.map(key => caches.delete(key)))
        }
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration?.waiting) {
            // This triggers controllerchange → reload above
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        } else {
            // No waiting worker — just reload
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
