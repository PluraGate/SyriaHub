'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseViewTrackingOptions {
    postId: string
    enabled?: boolean
}

export function useViewTracking({ postId, enabled = true }: UseViewTrackingOptions) {
    const startTimeRef = useRef<number>(Date.now())
    const maxScrollDepthRef = useRef<number>(0)
    const hasTrackedRef = useRef<boolean>(false)
    const sessionIdRef = useRef<string>('')

    // Generate or retrieve session ID
    useEffect(() => {
        if (typeof window !== 'undefined') {
            let sessionId = sessionStorage.getItem('view_session_id')
            if (!sessionId) {
                sessionId = crypto.randomUUID()
                sessionStorage.setItem('view_session_id', sessionId)
            }
            sessionIdRef.current = sessionId
        }
    }, [])

    // Track scroll depth
    useEffect(() => {
        if (!enabled) return

        const handleScroll = () => {
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight - windowHeight
            const scrollTop = window.scrollY
            const scrollDepth = documentHeight > 0 ? scrollTop / documentHeight : 0

            if (scrollDepth > maxScrollDepthRef.current) {
                maxScrollDepthRef.current = Math.min(scrollDepth, 1)
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [enabled])

    // Track view on component unmount or page unload
    const trackView = useCallback(async () => {
        if (hasTrackedRef.current || !enabled) return
        hasTrackedRef.current = true

        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const referrer = document.referrer || undefined

        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId,
                    sessionId: sessionIdRef.current,
                    duration,
                    scrollDepth: maxScrollDepthRef.current,
                    referrer,
                }),
                keepalive: true, // Ensures request completes on page unload
            })
        } catch (error) {
            console.error('Failed to track view:', error)
        }
    }, [postId, enabled])

    // Track on unmount
    useEffect(() => {
        if (!enabled) return

        const handleBeforeUnload = () => {
            trackView()
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                trackView()
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            trackView()
        }
    }, [trackView, enabled])

    return { trackView }
}
