'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { CheckCircle, HelpCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RsvpButtonProps {
    eventId: string
    initialStatus?: 'going' | 'maybe' | 'not_going' | null
    onRsvpChange?: (status: string) => void
}

export function RsvpButton({ eventId, initialStatus, onRsvpChange }: RsvpButtonProps) {
    const [status, setStatus] = useState(initialStatus)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const { showToast } = useToast()

    const handleRsvp = async (newStatus: 'going' | 'maybe' | 'not_going') => {
        if (loading) return
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                showToast('Please sign in to RSVP.', 'error')
                return
            }

            // If clicking same status, remove RSVP (toggle off)
            if (status === newStatus) {
                const { error } = await supabase
                    .from('event_rsvps')
                    .delete()
                    .eq('event_id', eventId)
                    .eq('user_id', user.id)

                if (error) throw error
                setStatus(null)
                onRsvpChange?.('removed')
            } else {
                // Upsert new status
                const { error } = await supabase
                    .from('event_rsvps')
                    .upsert({
                        event_id: eventId,
                        user_id: user.id,
                        status: newStatus
                    })

                if (error) throw error
                setStatus(newStatus)
                onRsvpChange?.(newStatus)
            }

        } catch (error: any) {
            console.error('RSVP error:', error)
            showToast('Failed to update RSVP.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant={status === 'going' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRsvp('going')}
                disabled={loading}
                className={cn(status === 'going' && "bg-green-600 hover:bg-green-700")}
            >
                <CheckCircle className="w-4 h-4 mr-2" />
                Going
            </Button>

            <Button
                variant={status === 'maybe' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRsvp('maybe')}
                disabled={loading}
                className={cn(status === 'maybe' && "bg-yellow-600 hover:bg-yellow-700")}
            >
                <HelpCircle className="w-4 h-4 mr-2" />
                Maybe
            </Button>

            <Button
                variant={status === 'not_going' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRsvp('not_going')}
                disabled={loading}
                className={cn(status === 'not_going' && "bg-red-600 hover:bg-red-700")}
            >
                <XCircle className="w-4 h-4 mr-2" />
                Can&apos;t Go
            </Button>
        </div>
    )
}
