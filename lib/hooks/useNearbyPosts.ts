'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { containsHumanitarianKeywords } from '@/lib/patternDetector'

interface NearbyPostsResult {
    postCount: number
    hasHumanitarianPosts: boolean
    loading: boolean
}

/**
 * Hook to fetch nearby post data for P5 pattern detection.
 * Queries posts that have spatial data overlapping with the given geometry.
 */
export function useNearbyPosts(
    geometry: { type: string; coordinates: number[] | number[][] | number[][][] } | null,
    governorate?: string
): NearbyPostsResult {
    const [postCount, setPostCount] = useState(0)
    const [hasHumanitarianPosts, setHasHumanitarianPosts] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!geometry || !governorate) {
            setPostCount(0)
            setHasHumanitarianPosts(false)
            return
        }

        async function fetchNearbyPosts() {
            setLoading(true)
            try {
                const supabase = createClient()

                // Query posts with spatial coverage in the same governorate
                // Using ilike for case-insensitive partial match
                const { data, error } = await supabase
                    .from('posts')
                    .select('id, title, content, spatial_coverage')
                    .not('spatial_coverage', 'is', null)
                    .ilike('spatial_coverage', `%${governorate}%`)
                    .eq('status', 'published')
                    .limit(20)

                if (error) {
                    // Log detailed error info - Supabase errors have message, code, details
                    console.error('Error fetching nearby posts:', {
                        message: error.message,
                        code: error.code,
                        details: error.details,
                        hint: error.hint
                    })
                    setPostCount(0)
                    setHasHumanitarianPosts(false)
                    return
                }

                const posts = data || []
                setPostCount(posts.length)

                // Check if any posts contain humanitarian keywords
                const humanitarian = posts.some(post =>
                    containsHumanitarianKeywords(post.title || '') ||
                    containsHumanitarianKeywords(post.content || '')
                )
                setHasHumanitarianPosts(humanitarian)

            } catch (err) {
                console.error('Failed to fetch nearby posts:', err instanceof Error ? err.message : err)
                setPostCount(0)
                setHasHumanitarianPosts(false)
            } finally {
                setLoading(false)
            }
        }

        fetchNearbyPosts()
    }, [geometry?.type, governorate])

    return { postCount, hasHumanitarianPosts, loading }
}
