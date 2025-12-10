'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookmarkButtonProps {
    postId: string
    className?: string
    showCount?: boolean
}

export function BookmarkButton({ postId, className, showCount = false }: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [bookmarkCount, setBookmarkCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const checkBookmarkStatus = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    // Check if bookmarked
                    const { data } = await supabase
                        .from('bookmarks')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('post_id', postId)
                        .single()

                    setIsBookmarked(!!data)
                }

                if (showCount) {
                    // Get bookmark count
                    const { count } = await supabase
                        .from('bookmarks')
                        .select('*', { count: 'exact', head: true })
                        .eq('post_id', postId)

                    setBookmarkCount(count || 0)
                }
            } catch (error) {
                // User not logged in or error
            } finally {
                setLoading(false)
            }
        }

        checkBookmarkStatus()
    }, [postId, supabase, showCount])

    const toggleBookmark = async () => {
        setToggling(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                // Could redirect to login or show toast
                return
            }

            if (isBookmarked) {
                // Remove bookmark
                await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('post_id', postId)

                setIsBookmarked(false)
                if (showCount) setBookmarkCount(prev => Math.max(0, prev - 1))
            } else {
                // Add bookmark
                await supabase
                    .from('bookmarks')
                    .insert({ user_id: user.id, post_id: postId })

                setIsBookmarked(true)
                if (showCount) setBookmarkCount(prev => prev + 1)
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error)
        } finally {
            setToggling(false)
        }
    }

    if (loading) {
        return (
            <button
                disabled
                className={cn(
                    'p-2 rounded-md text-text-light dark:text-dark-text-muted',
                    className
                )}
            >
                <Bookmark className="w-4 h-4" />
            </button>
        )
    }

    return (
        <button
            onClick={toggleBookmark}
            disabled={toggling}
            className={cn(
                'p-2 rounded-md transition-colors',
                isBookmarked
                    ? 'text-primary dark:text-accent-light'
                    : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text',
                className
            )}
            title={isBookmarked ? 'Remove from saved' : 'Save for later'}
        >
            {toggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isBookmarked ? (
                <BookmarkCheck className="w-4 h-4" />
            ) : (
                <Bookmark className="w-4 h-4" />
            )}
            {showCount && bookmarkCount > 0 && (
                <span className="ml-1 text-xs">{bookmarkCount}</span>
            )}
        </button>
    )
}
