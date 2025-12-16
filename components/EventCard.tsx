import Link from 'next/link'
import { Calendar, MapPin, Users, Clock, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { TagChip } from './TagChip'
import { getAvatarGradient, getInitials } from '@/lib/utils'

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
}

interface EventCardProps {
    event: EventPost
}

export function EventCard({ event }: EventCardProps) {
    const startDate = new Date(event.metadata.start_time)
    const endDate = event.metadata.end_time ? new Date(event.metadata.end_time) : null
    const status = event.metadata.status || 'scheduled'

    return (
        <div className="card hover:border-primary/50 transition-colors group flex flex-col md:flex-row overflow-hidden">
            {/* Date Badge */}
            <div className={`
                min-w-[120px] p-6 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-dark-border
                ${status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/10' :
                    status === 'postponed' ? 'bg-amber-50 dark:bg-amber-900/10' :
                        'bg-primary/5 dark:bg-primary/10'}
            `}>
                <span className={`text-sm font-bold uppercase tracking-wider ${status === 'cancelled' ? 'text-red-600 dark:text-red-400' :
                        status === 'postponed' ? 'text-amber-600 dark:text-amber-400' :
                            'text-primary'
                    }`}>
                    {status === 'scheduled' ? format(startDate, 'MMM') : status}
                </span>
                <span className="text-3xl font-bold text-text dark:text-dark-text my-1">
                    {format(startDate, 'd')}
                </span>
                <span className="text-sm text-text-light dark:text-dark-text-muted">
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
                                        Rejected
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
                            <span>{event.rsvp_count || 0} Attending</span>
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
