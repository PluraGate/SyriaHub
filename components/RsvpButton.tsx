'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { CheckCircle, HelpCircle, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface RsvpButtonProps {
    eventId: string
    initialStatus?: 'going' | 'maybe' | 'not_going' | null
    onRsvpChange?: (status: string) => void
    eventDate?: string // ISO date string for the event start time
}

export function RsvpButton({ eventId, initialStatus, onRsvpChange, eventDate }: RsvpButtonProps) {
    const [status, setStatus] = useState(initialStatus)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const { showToast } = useToast()
    const t = useTranslations('RSVP')

    // Check if event has passed
    const isPastEvent = eventDate ? new Date(eventDate) < new Date() : false

    const handleRsvp = async (newStatus: 'going' | 'maybe' | 'not_going') => {
        if (loading || isPastEvent) return
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
                    }, {
                        onConflict: 'event_id, user_id'
                    })

                if (error) throw error
                setStatus(newStatus)
                onRsvpChange?.(newStatus)
            }

        } catch (error: any) {
            console.error('RSVP error:', error.message || error)
            showToast('Failed to update RSVP. ' + (error.message || ''), 'error')
        } finally {
            setLoading(false)
        }
    }

    // Show "Event has ended" message for past events
    if (isPastEvent) {
        return (
            <div className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-gray-100 dark:bg-dark-surface text-gray-500 dark:text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>{t('eventEnded')}</span>
            </div>
        )
    }

    return (
        <div className="flex gap-2 w-full">
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleRsvp('going')}
                disabled={loading}
                className={cn(
                    "relative overflow-hidden transition-all duration-300 border flex-1 whitespace-nowrap",
                    status === 'going'
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                        : "hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 dark:hover:border-emerald-800/50"
                )}
            >
                <CheckCircle className={cn(
                    "w-4 h-4 mr-1.5 flex-shrink-0 transition-transform",
                    status === 'going' && "scale-110"
                )} />
                <span className="font-medium">{t('going')}</span>
                {status === 'going' && (
                    <span className="absolute inset-0 border-2 border-emerald-500/50 rounded-md pointer-events-none" />
                )}
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={() => handleRsvp('maybe')}
                disabled={loading}
                className={cn(
                    "relative overflow-hidden transition-all duration-300 border flex-1 whitespace-nowrap",
                    status === 'maybe'
                        ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
                        : "hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/20 dark:hover:text-amber-400 dark:hover:border-amber-800/50"
                )}
            >
                <HelpCircle className={cn(
                    "w-4 h-4 mr-1.5 flex-shrink-0 transition-transform",
                    status === 'maybe' && "scale-110"
                )} />
                <span className="font-medium">{t('maybe')}</span>
                {status === 'maybe' && (
                    <span className="absolute inset-0 border-2 border-amber-500/50 rounded-md pointer-events-none" />
                )}
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={() => handleRsvp('not_going')}
                disabled={loading}
                className={cn(
                    "relative overflow-hidden transition-all duration-300 border flex-1 whitespace-nowrap",
                    status === 'not_going'
                        ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800"
                        : "hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 dark:hover:border-rose-800/50"
                )}
            >
                <XCircle className={cn(
                    "w-4 h-4 mr-1.5 flex-shrink-0 transition-transform",
                    status === 'not_going' && "scale-110"
                )} />
                <span className="font-medium">{t('cantGo')}</span>
                {status === 'not_going' && (
                    <span className="absolute inset-0 border-2 border-rose-500/50 rounded-md pointer-events-none" />
                )}
            </Button>
        </div>
    )
}

