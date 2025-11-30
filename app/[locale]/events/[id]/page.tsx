import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CommentsSection } from '@/components/CommentsSection'
import { RsvpButton } from '@/components/RsvpButton'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, Clock, Link as LinkIcon, Users } from 'lucide-react'
import { format } from 'date-fns'
import { TagChip } from '@/components/TagChip'
import { ViewTracker } from '@/components/ViewTracker'

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch Event
    const { data: event } = await supabase
        .from('posts')
        .select(`
      *,
      author:users(name, email)
    `)
        .eq('id', id)
        .single()

    if (!event || event.content_type !== 'event') notFound()

    // Fetch RSVPs
    const { data: rsvps } = await supabase
        .from('event_rsvps')
        .select(`
      status,
      user:users(name, email, id)
    `)
        .eq('event_id', id)

    const going = rsvps?.filter(r => r.status === 'going') || []
    const maybe = rsvps?.filter(r => r.status === 'maybe') || []

    // Get current user's RSVP status
    const userRsvp = rsvps?.find(r => {
        const u = Array.isArray(r.user) ? r.user[0] : r.user
        return u?.id === user?.id
    })?.status as 'going' | 'maybe' | 'not_going' | undefined

    const startDate = new Date(event.metadata.start_time)
    const endDate = event.metadata.end_time ? new Date(event.metadata.end_time) : null

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <main className="flex-1 container-custom py-12">
                <div className="grid gap-8 lg:grid-cols-[1fr_350px]">

                    {/* Main Content */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden p-8">
                            <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-6">
                                {event.title}
                            </h1>

                            <div className="flex flex-col gap-4 mb-8 text-text dark:text-dark-text">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    <span className="font-medium">
                                        {format(startDate, 'EEEE, MMMM d, yyyy')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <span>
                                        {format(startDate, 'h:mm a')}
                                        {endDate && ` - ${format(endDate, 'h:mm a')}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    <span>{event.metadata.location}</span>
                                </div>
                                {event.metadata.link && (
                                    <div className="flex items-center gap-3">
                                        <LinkIcon className="w-5 h-5 text-primary" />
                                        <a href={event.metadata.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                                            {event.metadata.link}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="prose dark:prose-invert max-w-none text-text dark:text-dark-text mb-8">
                                {event.content}
                            </div>

                            {event.tags && event.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {event.tags.map((tag: string) => (
                                        <TagChip key={tag} tag={tag} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <CommentsSection postId={id} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* RSVP Card */}
                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-text dark:text-dark-text mb-4">
                                Are you going?
                            </h3>

                            <RsvpButton
                                eventId={id}
                                initialStatus={userRsvp}
                            />

                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-border">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-text dark:text-dark-text flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Attendees
                                    </h4>
                                    <span className="text-sm text-text-light dark:text-dark-text-muted">
                                        {going.length} going
                                    </span>
                                </div>

                                {going.length > 0 ? (
                                    <ul className="space-y-3">
                                        {going.slice(0, 5).map((rsvp: any) => (
                                            <li key={rsvp.user.id} className="flex items-center gap-2 text-sm text-text dark:text-dark-text">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                    {rsvp.user.name?.[0] || rsvp.user.email?.[0] || '?'}
                                                </div>
                                                <span>{rsvp.user.name || rsvp.user.email?.split('@')[0]}</span>
                                            </li>
                                        ))}
                                        {going.length > 5 && (
                                            <li className="text-xs text-text-light dark:text-dark-text-muted pl-8">
                                                +{going.length - 5} more
                                            </li>
                                        )}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-text-light dark:text-dark-text-muted italic">
                                        Be the first to RSVP!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
                <ViewTracker postId={id} />
            </main>

            <Footer />
        </div>
    )
}
