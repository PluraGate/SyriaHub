import Link from 'next/link'
import { Calendar, MapPin, Users, Clock, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { TagChip } from './TagChip'

interface EventMetadata {
    start_time: string
    end_time?: string
    location: string
    link?: string
}

interface EventPost {
    id: string
    title: string
    content: string
    created_at: string
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

    return (
        <div className="card hover:border-primary/50 transition-colors group flex flex-col md:flex-row overflow-hidden">
            {/* Date Badge */}
            <div className="bg-primary/5 dark:bg-primary/10 p-6 flex flex-col items-center justify-center min-w-[120px] text-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-dark-border">
                <span className="text-sm font-bold text-primary uppercase tracking-wider">
                    {format(startDate, 'MMM')}
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
                                <h3 className="text-xl font-bold text-text dark:text-dark-text line-clamp-2">
                                    {event.title}
                                </h3>
                            </Link>
                            {event.approval_status === 'rejected' && (
                                <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                                    <AlertTriangle className="w-3 h-3" />
                                    Rejected
                                </span>
                            )}
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
                </div>
            </div>
        </div>
    )
}
