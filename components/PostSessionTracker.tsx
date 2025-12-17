'use client'

import { useEffect } from 'react'
import { addToResearchTrail } from '@/lib/sessionContext'

interface PostSessionTrackerProps {
    postId: string
    postTitle: string
    postTags: string[]
}

/**
 * Invisible client component that tracks post views in the session context.
 * This adds the current post to the research trail for epistemic recommendations.
 */
export function PostSessionTracker({ postId, postTitle, postTags }: PostSessionTrackerProps) {
    useEffect(() => {
        // Add this post to the research trail when viewed
        addToResearchTrail({
            id: postId,
            title: postTitle,
            tags: postTags
        })
    }, [postId, postTitle, postTags])

    // This component renders nothing - it just tracks
    return null
}
