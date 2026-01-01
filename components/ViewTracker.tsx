'use client'

import { useEffect, useRef } from 'react'

export function ViewTracker({ postId }: { postId: string }) {
    const hasTracked = useRef(false)

    useEffect(() => {
        if (hasTracked.current) return

        const trackView = async () => {
            try {
                await fetch(`/api/posts/${postId}/view`, { method: 'POST' })
                hasTracked.current = true
            } catch (error) {
                console.error('Failed to track view:', error)
            }
        }

        // Small delay to ensure it's a real visit
        const timer = setTimeout(trackView, 2000)

        return () => clearTimeout(timer)
    }, [postId])

    return null
}
