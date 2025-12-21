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
import { RejectionBanner } from '@/components/RejectionBanner'
import { EventActions } from '@/components/EventActions'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { BookmarkButton } from '@/components/BookmarkButton'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch Event
    const { data: event } = await supabase
        .from('posts')
        .select(`
      *,
      author:users!author_id(name, email, avatar_url)
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

    // Get translations
    const t = await getTranslations('Events')

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <main className="flex-1 container-custom py-12">
                <div className="grid gap-8 lg:grid-cols-[1fr_350px]">

                    {/* Main Content */}
                    <div className="space-y-8">
                        {/* Rejection Banner - shown only to event authors */}
                        <RejectionBanner
                            postId={event.id}
                            postTitle={event.title}
                            rejectionReason={event.rejection_reason}
                            approvalStatus={event.approval_status || 'approved'}
                            isAuthor={user?.id === event.author_id}
                            contentType="event"
                        />

                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                            {/* Status Banner */}
                            {event.metadata.status && event.metadata.status !== 'scheduled' && (
                                <div className={`w-full py-3 px-6 text-center font-bold uppercase tracking-wider text-sm ${event.metadata.status === 'cancelled'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-amber-500 text-white'
                                    }`}>
                                    {event.metadata.status === 'cancelled' ? t('eventCancelled') : t('eventPostponed')}
                                </div>
                            )}

                            {/* Hero Banner Component */}
                            <div className="relative h-48 md:h-80 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden">
                                {event.cover_image_url ? (
                                    <>
                                        <div className="absolute inset-0">
                                            <img
                                                src={event.cover_image_url}
                                                alt={event.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50" />
                                        </div>
                                        <div className="relative z-10 text-center p-6 max-w-2xl">
                                            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 drop-shadow-md">
                                                {event.title}
                                            </h1>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.04] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                                        <div className="relative z-10 text-center p-6 max-w-2xl">
                                            <h1 className="text-3xl md:text-4xl font-display font-bold text-text dark:text-dark-text mb-4 drop-shadow-sm">
                                                {event.title}
                                            </h1>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="p-8">
                                <div className="flex flex-wrap gap-6 mb-8 text-text-light dark:text-dark-text-muted border-b border-gray-100 dark:border-dark-border pb-8">
                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-dark-bg p-3 rounded-lg border border-gray-100 dark:border-dark-border">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-dark-text-muted">{t('date')}</span>
                                            <span className="font-medium text-text dark:text-dark-text">{format(startDate, 'MMM d, yyyy')}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-dark-bg p-3 rounded-lg border border-gray-100 dark:border-dark-border">
                                        <Clock className="w-5 h-5 text-primary" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-dark-text-muted">{t('time')}</span>
                                            <span className="font-medium text-text dark:text-dark-text">
                                                {format(startDate, 'h:mm a')}
                                                {endDate && ` - ${format(endDate, 'h:mm a')}`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-dark-bg p-3 rounded-lg border border-gray-100 dark:border-dark-border flex-1 min-w-[200px]">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-dark-text-muted">{t('location')}</span>
                                            <span className="font-medium text-text dark:text-dark-text truncate">{event.metadata.location}</span>
                                        </div>
                                    </div>

                                    {event.metadata.link && (
                                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-dark-bg p-3 rounded-lg border border-gray-100 dark:border-dark-border w-full md:w-auto">
                                            <LinkIcon className="w-5 h-5 text-primary" />
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted dark:text-dark-text-muted">{t('onlineLink')}</span>
                                                <a href={event.metadata.link} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline truncate max-w-[200px]">
                                                    {event.metadata.link.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="prose prose-lg dark:prose-invert max-w-none text-text dark:text-dark-text mb-8">
                                    {event.content}
                                </div>

                                {event.tags && event.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-dark-border">
                                        {event.tags.map((tag: string) => (
                                            <TagChip key={tag} tag={tag} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <CommentsSection postId={id} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* RSVP Card */}
                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <EventActions
                                    eventId={id}
                                    isAuthor={user?.id === event.author_id}
                                />
                                <BookmarkButton postId={id} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg border border-gray-100 dark:border-dark-border" />
                            </div>

                            <h3 className="text-lg font-bold text-text dark:text-dark-text mb-4">
                                {t('areYouGoing')}
                            </h3>

                            <RsvpButton
                                eventId={id}
                                initialStatus={userRsvp}
                                eventDate={event.metadata.start_time}
                            />

                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-border">
                                <h4 className="font-semibold text-text dark:text-dark-text mb-3">
                                    {t('organizedBy')}
                                </h4>
                                <div className="flex items-center gap-3">
                                    <UserAvatar
                                        name={event.author.name}
                                        email={event.author.email}
                                        avatarUrl={event.author.avatar_url}
                                        size="md"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-text dark:text-dark-text">
                                            {event.author.name || event.author.email?.split('@')[0]}
                                        </span>
                                        <span className="text-xs text-text-light dark:text-dark-text-muted">
                                            {t('eventHost')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-border">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-text dark:text-dark-text flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        {t('attendees')}
                                    </h4>
                                    <span className="text-sm text-text-light dark:text-dark-text-muted">
                                        {t('goingCount', { count: going.length })}
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
                                                {t('moreAttendees', { count: going.length - 5 })}
                                            </li>
                                        )}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-text-light dark:text-dark-text-muted italic">
                                        {t('beFirstToRsvp')}
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
