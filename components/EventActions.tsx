'use client'

import Link from 'next/link'
import { Edit, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface EventActionsProps {
    eventId: string
    isAuthor: boolean
}

export function EventActions({ eventId, isAuthor }: EventActionsProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)

    if (!isAuthor) return null

    const handleDeleteClick = () => {
        setShowConfirmation(true)
    }

    const handleCancelDelete = () => {
        setShowConfirmation(false)
    }

    const handleConfirmDelete = async () => {
        setIsDeleting(true)
        const supabase = createClient()

        try {
            const { data, error } = await supabase
                .from('posts')
                .delete()
                .eq('id', eventId)
                .select()

            if (error) {
                console.error('Error deleting event:', error)
                alert('Failed to delete event: ' + error.message)
                setIsDeleting(false)
                setShowConfirmation(false)
            } else if (!data || data.length === 0) {
                alert('Could not delete event. You may not have permission.')
                setIsDeleting(false)
                setShowConfirmation(false)
            } else {
                router.push('/events')
                router.refresh()
            }
        } catch (error: any) {
            console.error('Error:', error)
            alert('An error occurred: ' + (error.message || 'Unknown error'))
            setIsDeleting(false)
            setShowConfirmation(false)
        }
    }

    return (
        <div className="space-y-3 mb-6">
            <Link
                href={`/events/${eventId}/edit`}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-secondary/10 text-secondary-dark rounded-lg hover:bg-secondary/20 transition-colors font-medium"
            >
                <Edit className="w-4 h-4" />
                Edit Event
            </Link>

            {showConfirmation ? (
                <div className="flex gap-2">
                    <button
                        onClick={handleCancelDelete}
                        disabled={isDeleting}
                        className="flex-1 px-3 py-2 text-sm text-text dark:text-dark-text rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                        className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-1.5"
                    >
                        {isDeleting ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                        )}
                        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleDeleteClick}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Event
                </button>
            )}
        </div>
    )
}
