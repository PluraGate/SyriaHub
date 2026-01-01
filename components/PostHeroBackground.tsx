'use client'

import { useCoverWithFallback } from '@/lib/coverImages'

interface PostHeroBackgroundProps {
    coverImageUrl: string | null | undefined
}

/**
 * Client component that provides theme-aware cover image background for post pages.
 * Uses Pluragate cover images as fallback when post has no cover image.
 */
export function PostHeroBackground({ coverImageUrl }: PostHeroBackgroundProps) {
    const coverImage = useCoverWithFallback(coverImageUrl, 'large')

    return (
        <>
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${coverImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30 transition-opacity duration-500 group-hover:opacity-60" />
        </>
    )
}
