'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface PresenceUser {
    id: string
    name: string
    avatar_url?: string
    color: string
    cursor_position?: number
    last_active: number
}

interface UseCollaborationOptions {
    documentId: string
    userId: string
    userName: string
    userAvatar?: string
}

const PRESENCE_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
]

/**
 * Hook for real-time collaborative editing presence
 */
export function useCollaboration({ documentId, userId, userName, userAvatar }: UseCollaborationOptions) {
    const [collaborators, setCollaborators] = useState<PresenceUser[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const channelRef = useRef<RealtimeChannel | null>(null)
    const supabase = createClient()

    // Assign a consistent color based on user ID
    const userColor = PRESENCE_COLORS[userId.charCodeAt(0) % PRESENCE_COLORS.length]

    const updatePresence = useCallback((cursorPosition?: number) => {
        if (!channelRef.current) return

        channelRef.current.track({
            id: userId,
            name: userName,
            avatar_url: userAvatar,
            color: userColor,
            cursor_position: cursorPosition,
            last_active: Date.now()
        })
    }, [userId, userName, userAvatar, userColor])

    useEffect(() => {
        if (!documentId || !userId) return

        const channel = supabase.channel(`document:${documentId}`, {
            config: {
                presence: { key: userId }
            }
        })

        channelRef.current = channel

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState()
                const users: PresenceUser[] = []

                for (const [key, presences] of Object.entries(state)) {
                    if (key !== userId && Array.isArray(presences) && presences.length > 0) {
                        const presence = presences[0] as unknown as PresenceUser
                        users.push(presence)
                    }
                }

                setCollaborators(users)
            })
            .on('presence', { event: 'join' }, ({ key }) => {
                console.log(`[Collab] User joined: ${key}`)
            })
            .on('presence', { event: 'leave' }, ({ key }) => {
                console.log(`[Collab] User left: ${key}`)
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    setIsConnected(true)
                    // Track our own presence
                    await channel.track({
                        id: userId,
                        name: userName,
                        avatar_url: userAvatar,
                        color: userColor,
                        last_active: Date.now()
                    })
                } else {
                    setIsConnected(false)
                }
            })

        return () => {
            channel.unsubscribe()
            channelRef.current = null
        }
    }, [documentId, userId, userName, userAvatar, userColor, supabase])

    return {
        collaborators,
        isConnected,
        updatePresence,
        userColor
    }
}
