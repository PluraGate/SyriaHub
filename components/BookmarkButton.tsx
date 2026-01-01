'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

interface BookmarkButtonProps {
    postId: string
    className?: string
    showCount?: boolean
}



export function BookmarkButton({ postId, className, showCount = false }: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [bookmarkCount, setBookmarkCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()
    const { showToast } = useToast()

    useEffect(() => {
        let isMounted = true

        const checkBookmarkStatus = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    const { data, error } = await supabase
                        .from('bookmarks')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('post_id', postId)
                        .maybeSingle()

                    if (!error && data && isMounted) {
                        setIsBookmarked(true)
                    }
                }

                if (showCount) {
                    const { count, error } = await supabase
                        .from('bookmarks')
                        .select('*', { count: 'exact', head: true })
                        .eq('post_id', postId)

                    if (!error && count !== null && isMounted) {
                        setBookmarkCount(count)
                    }
                }
            } catch (error) {
                console.error('Error checking bookmark status:', error)
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        checkBookmarkStatus()

        return () => {
            isMounted = false
        }
    }, [postId, supabase, showCount])

    const toggleBookmark = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // Store previous state for rollback
        const previousBookmarked = isBookmarked
        const previousCount = bookmarkCount

        // Optimistic update
        setIsBookmarked(!previousBookmarked)
        if (showCount) {
            setBookmarkCount(prev => previousBookmarked ? Math.max(0, prev - 1) : prev + 1)
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                // Not logged in, revert
                setIsBookmarked(previousBookmarked)
                setBookmarkCount(previousCount)
                showToast('Please sign in to save posts', 'error')
                return
            }

            if (previousBookmarked) {
                // Remove bookmark
                const { error } = await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('post_id', postId)

                if (error) throw error
                showToast('Removed from saved posts', 'success')
            } else {
                // Add bookmark
                const { error } = await supabase
                    .from('bookmarks')
                    .insert({ user_id: user.id, post_id: postId })

                if (error) throw error
                showToast('Saved for later', 'success')
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error)
            // Revert on error
            setIsBookmarked(previousBookmarked)
            setBookmarkCount(previousCount)
            showToast('Failed to update bookmark', 'error')
        }
    }

    if (isLoading) {
        return (
            <div className={cn("p-2.5", className)}>
                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
        )
    }

    return (
        <button
            type="button"
            onClick={toggleBookmark}
            className={cn(
                'relative z-10 p-2.5 rounded-full transition-all duration-200 group',
                'hover:bg-gray-100 dark:hover:bg-dark-surface/80',
                isBookmarked
                    ? 'text-primary dark:text-primary'
                    : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text',
                className
            )}
            title={isBookmarked ? 'Remove from saved' : 'Save for later'}
            aria-label={isBookmarked ? 'Remove from saved' : 'Save for later'}
        >
            <Bookmark
                className={cn(
                    "w-5 h-5 transition-transform duration-200 group-active:scale-95",
                    isBookmarked && "fill-current"
                )}
            />
            {showCount && bookmarkCount > 0 && (
                <span className="ml-1 text-xs font-medium">{bookmarkCount}</span>
            )}
        </button>
    )
}
