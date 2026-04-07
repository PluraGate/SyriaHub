'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FollowButtonProps {
    userId: string
    className?: string
    variant?: 'default' | 'compact'
}

export function FollowButton({ userId, className, variant = 'default' }: FollowButtonProps) {
    const { user: authUser } = useAuth()
    const [isFollowing, setIsFollowing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(false)
    const supabase = useMemo(() => createClient(), [])

    // Don't show button for own profile — resolved immediately from auth context
    const isOwnProfile = authUser?.id === userId

    useEffect(() => {
        if (!authUser?.id || isOwnProfile) {
            setLoading(false)
            return
        }

        const checkFollowStatus = async () => {
            try {
                const { data } = await supabase
                    .from('follows')
                    .select('id')
                    .eq('follower_id', authUser.id)
                    .eq('following_id', userId)
                    .maybeSingle()

                setIsFollowing(!!data)
            } catch {
                // Not following or error
            } finally {
                setLoading(false)
            }
        }

        checkFollowStatus()
    }, [userId, supabase, authUser?.id, isOwnProfile])

    const toggleFollow = async () => {
        if (!authUser?.id || isOwnProfile) return

        setToggling(true)
        try {
            if (isFollowing) {
                await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', authUser.id)
                    .eq('following_id', userId)

                setIsFollowing(false)
            } else {
                await supabase
                    .from('follows')
                    .insert({ follower_id: authUser.id, following_id: userId })

                setIsFollowing(true)
            }
        } catch (error) {
            console.error('Error toggling follow:', error)
        } finally {
            setToggling(false)
        }
    }

    if (loading || isOwnProfile) {
        return null
    }

    if (variant === 'compact') {
        return (
            <button
                onClick={toggleFollow}
                disabled={toggling}
                className={cn(
                    'p-1.5 rounded-md transition-colors',
                    isFollowing
                        ? 'text-primary dark:text-accent-light'
                        : 'text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text',
                    className
                )}
                title={isFollowing ? 'Unfollow' : 'Follow'}
            >
                {toggling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                    <UserCheck className="w-4 h-4" />
                ) : (
                    <UserPlus className="w-4 h-4" />
                )}
            </button>
        )
    }

    return (
        <button
            onClick={toggleFollow}
            disabled={toggling}
            className={cn(
                'px-3 py-1.5 text-sm rounded-md border transition-colors',
                isFollowing
                    ? 'border-primary dark:border-accent-light text-primary dark:text-accent-light'
                    : 'border-gray-300 dark:border-dark-border text-text-light dark:text-dark-text-muted hover:border-gray-400 dark:hover:border-gray-600',
                className
            )}
        >
            {toggling ? (
                <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
            ) : isFollowing ? (
                <>
                    <UserCheck className="w-4 h-4 inline mr-1" />
                    Following
                </>
            ) : (
                <>
                    <UserPlus className="w-4 h-4 inline mr-1" />
                    Follow
                </>
            )}
        </button>
    )
}
