'use client'

import { useEffect, useRef } from 'react'

const CHECK_INTERVAL = 60_000 // 60 seconds

/**
 * Polls /version.json to detect new deployments and auto-reload the page.
 * The file is generated at build time by scripts/generate-version.js.
 */
export function useVersionCheck() {
    const initialBuildId = useRef<string | null>(null)
    const reloading = useRef(false)

    useEffect(() => {
        async function fetchBuildId(): Promise<string | null> {
            try {
                const res = await fetch('/version.json', { cache: 'no-store' })
                if (!res.ok) return null
                const data = await res.json()
                return data.buildId ?? null
            } catch {
                return null
            }
        }

        async function clearAllCaches() {
            // Clear all SW caches so the next load fetches fresh assets
            if ('caches' in window) {
                const keys = await caches.keys()
                await Promise.all(keys.map(key => caches.delete(key)))
            }
            // Tell the SW to skip waiting if a new one is pending
            const reg = await navigator.serviceWorker?.getRegistration?.()
            if (reg?.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' })
            }
        }

        async function checkForUpdate() {
            if (reloading.current) return
            const currentBuildId = await fetchBuildId()
            if (!currentBuildId) return

            if (initialBuildId.current === null) {
                initialBuildId.current = currentBuildId
                return
            }

            if (currentBuildId !== initialBuildId.current) {
                console.log('[VersionCheck] New version detected, clearing caches and reloading...')
                reloading.current = true
                await clearAllCaches()
                window.location.reload()
            }
        }

        // Initial fetch to capture the current build ID
        checkForUpdate()

        // Periodic polling
        const interval = setInterval(checkForUpdate, CHECK_INTERVAL)

        // Also check when the user returns to the tab
        function onVisibilityChange() {
            if (document.visibilityState === 'visible') {
                checkForUpdate()
            }
        }
        document.addEventListener('visibilitychange', onVisibilityChange)

        return () => {
            clearInterval(interval)
            document.removeEventListener('visibilitychange', onVisibilityChange)
        }
    }, [])
}
