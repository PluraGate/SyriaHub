'use client'

import { useTheme } from '@/contexts/PreferencesContext'
import { useEffect, useState } from 'react'

/**
 * Default cover images for SyriaHub
 * Located in /public/covers/
 * Available in light and dark variants at multiple resolutions
 */

export const COVER_IMAGES = {
    light: {
        small: '/covers/Pluragate_cover_Light_2560x960.jpeg',
        medium: '/covers/Pluragate_cover_Light_3200x1200.jpeg',
        large: '/covers/Pluragate_cover_Light_3840x1440.jpg',
    },
    dark: {
        small: '/covers/Pluragate_cover_Dark_2560x960.jpeg',
        medium: '/covers/Pluragate_cover_Dark_3200x1200.jpeg',
        large: '/covers/Pluragate_cover_Dark_3840x1440.jpg',
    },
} as const

export type CoverSize = 'small' | 'medium' | 'large'
export type CoverVariant = 'light' | 'dark'

/**
 * Get the default cover image URL based on theme and size
 * @param variant - 'light' | 'dark' | 'auto' (auto uses current theme)
 * @param size - 'small' | 'medium' | 'large'
 */
export function getDefaultCover(
    variant: CoverVariant | 'auto' = 'auto',
    size: CoverSize = 'medium'
): string {
    // For 'auto', we can't know the theme on server, default to dark for impact
    const resolvedVariant = variant === 'auto' ? 'dark' : variant
    return COVER_IMAGES[resolvedVariant][size]
}

/**
 * Hook to get theme-aware default cover image
 * Automatically switches between light/dark variants based on current theme
 */
export function useDefaultCover(size: CoverSize = 'medium'): string {
    const { isDark } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Before mounting, return dark variant (better for initial load to avoid flash)
    if (!mounted) {
        return COVER_IMAGES.dark[size]
    }

    const variant: CoverVariant = isDark ? 'dark' : 'light'
    return COVER_IMAGES[variant][size]
}

/**
 * Get cover image with fallback to theme-appropriate default
 * @param coverUrl - The custom cover URL (can be null/undefined)
 * @param variant - Theme variant for fallback
 * @param size - Size of fallback image
 */
export function getCoverWithFallback(
    coverUrl: string | null | undefined,
    variant: CoverVariant | 'auto' = 'auto',
    size: CoverSize = 'medium'
): string {
    if (coverUrl) return coverUrl
    return getDefaultCover(variant, size)
}

/**
 * Hook version that uses current theme for fallback
 */
export function useCoverWithFallback(
    coverUrl: string | null | undefined,
    size: CoverSize = 'medium'
): string {
    const defaultCover = useDefaultCover(size)
    return coverUrl || defaultCover
}
