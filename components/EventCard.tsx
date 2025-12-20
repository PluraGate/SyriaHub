'use client'

import Link from 'next/link'
import { Calendar, MapPin, Users, Clock, AlertTriangle, Trash2, X } from 'lucide-react'
import { format } from 'date-fns'
import { TagChip } from './TagChip'
import { getAvatarGradient, getInitials } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useTranslations } from 'next-intl'

interface EventMetadata {
    start_time: string
    end_time?: string
    location: string
    link?: string
    status?: 'scheduled' | 'cancelled' | 'postponed'
}

interface EventPost {
    id: string
    title: string
    content: string
    created_at: string
    author_id?: string
    author?: { name?: string | null, email?: string | null } | null
    tags?: string[]
    metadata: EventMetadata
    rsvp_count?: number
    approval_status?: 'pending' | 'approved' | 'rejected'
    cover_image_url?: string | null
}

interface EventCardProps {
    event: EventPost
    currentUser?: User | null
}

export function EventCard({ event, currentUser }: EventCardProps) {
    const router = useRouter()
    const t = useTranslations('Common')
    const tEvents = useTranslations('Events')
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)

    const startDate = new Date(event.metadata.start_time)
    const endDate = event.metadata.end_time ? new Date(event.metadata.end_time) : null
    const status = event.metadata.status || 'scheduled'
    const isAuthor = currentUser?.id === event.author_id

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setShowConfirmation(true)
    }

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setShowConfirmation(false)
    }

    const handleConfirmDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setIsDeleting(true)
        const supabase = createClient()

        try {
            const { data, error } = await supabase
                .from('posts')
                .delete()
                .eq('id', event.id)
                .select()

            if (error) {
                console.error('Error deleting event:', error)
                alert('Failed to delete event: ' + error.message)
            } else if (!data || data.length === 0) {
                alert('Could not delete event. You may not have permission.')
            } else {
                router.refresh()
            }
        } catch (error: any) {
            console.error('Error:', error)
            alert('An error occurred: ' + (error.message || 'Unknown error'))
        } finally {
            setIsDeleting(false)
            setShowConfirmation(false)
        }
    }

    if (isDeleting) {
        return (
            <div className="card h-[200px] flex items-center justify-center bg-gray-50 dark:bg-dark-surface/50 opacity-50">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-text-light">{t('deleting')}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="card hover:border-primary/50 transition-colors group flex flex-col md:flex-row overflow-hidden relative">
            {/* Delete Button / Confirmation for Author */}
            {isAuthor && (
                <div className="absolute top-2 right-2 z-20">
                    {showConfirmation ? (
                        <div className="flex items-center gap-1 bg-white dark:bg-dark-surface rounded-full shadow-md border border-gray-200 dark:border-dark-border p-1">
                            <button
                                onClick={handleCancelDelete}
                                className="p-1.5 text-text-light hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text rounded-full hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                                title={t('cancel')}
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-2.5 py-1 text-xs font-medium bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors flex items-center gap-1"
                            >
                                <Trash2 className="w-3 h-3" />
                                {t('delete')}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleDeleteClick}
                            className="p-2 text-text-light hover:text-red-600 dark:text-dark-text-muted dark:hover:text-red-400 bg-white/80 dark:bg-dark-surface/80 rounded-full shadow-sm border border-gray-100 dark:border-dark-border hover:border-red-200 dark:hover:border-red-800 transition-colors"
                            title={tEvents('deleteEvent')}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* Date Badge with optional background image */}
            <div className={`
                min-w-[120px] p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-dark-border relative overflow-hidden
                ${status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/10' :
                    status === 'postponed' ? 'bg-amber-50 dark:bg-amber-900/10' :
                        'bg-primary/5 dark:bg-primary/10'}
            `}>
                {/* Background image with overlay */}
                {event.cover_image_url && (
                    <>
                        <img
                            src={event.cover_image_url}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
                    </>
                )}
                <span className={`relative z-10 text-sm font-bold uppercase tracking-wider ${status === 'cancelled' ? 'text-red-600 dark:text-red-400' :
                    status === 'postponed' ? 'text-amber-600 dark:text-amber-400' :
                        event.cover_image_url ? 'text-white' : 'text-primary'
                    }`}>
                    {status === 'scheduled' ? format(startDate, 'MMM') : status}
                </span>
                <span className={`relative z-10 text-3xl font-bold my-1 ${event.cover_image_url ? 'text-white drop-shadow-md' : 'text-text dark:text-dark-text'}`}>
                    {format(startDate, 'd')}
                </span>
                <span className={`relative z-10 text-sm ${event.cover_image_url ? 'text-white/80' : 'text-text-light dark:text-dark-text-muted'}`}>
                    {format(startDate, 'yyyy')}
                </span>
            </div>

            <div className="p-6 flex-1 min-w-0">
                <div className="flex flex-col gap-4 h-full justify-between">
                    <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <Link href={`/events/${event.id}`} className="group-hover:text-primary transition-colors">
                                <h3 className={`text-xl font-bold line-clamp-2 ${status === 'cancelled' ? 'text-text-light dark:text-dark-text-muted line-through' : 'text-text dark:text-dark-text'}`}>
                                    {event.title}
                                </h3>
                            </Link>
                            <div className="flex gap-2">
                                {event.approval_status === 'rejected' && (
                                    <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                                        <AlertTriangle className="w-3 h-3" />
                                        {tEvents('rejected')}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-text-light dark:text-dark-text-muted mb-4">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>
                                    {format(startDate, 'h:mm a')}
                                    {endDate && ` - ${format(endDate, 'h:mm a')}`}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate max-w-[200px]">{event.metadata.location}</span>
                            </div>
                        </div>

                        <p className="text-text-light dark:text-dark-text-muted line-clamp-2 mb-4 text-sm">
                            {event.content}
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-dark-border">
                        <div className="flex flex-wrap gap-2">
                            {event.tags?.slice(0, 3).map(tag => (
                                <TagChip key={tag} tag={tag} size="sm" />
                            ))}
                        </div>

                        <div className="flex items-center gap-1.5 text-sm font-medium text-text dark:text-dark-text">
                            <Users className="w-4 h-4 text-primary" />
                            <span>{event.rsvp_count || 0} {t('attending')}</span>
                        </div>
                    </div>

                    {/* Author & Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                        {event.author && (
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white ${getAvatarGradient(event.author_id)}`}>
                                    {getInitials(event.author.name || undefined, event.author.email || undefined)}
                                </div>
                                <span className="text-sm text-text-light dark:text-dark-text-muted truncate max-w-[150px]">
                                    {event.author.name || event.author.email?.split('@')[0]}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
