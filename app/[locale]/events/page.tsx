import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { EventCard } from '@/components/EventCard'
import Link from 'next/link'
import { PlusCircle, Calendar } from 'lucide-react'

export default async function EventsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch events with RSVP count
    const { data: events } = await supabase
        .from('posts')
        .select(`
      *,
      author:users!author_id(name, email),
      rsvp_count:event_rsvps(count)
    `)
        .eq('content_type', 'event')
        .eq('status', 'published')
        .order('metadata->>start_time', { ascending: true })

    // Transform for EventCard
    const formattedEvents = events?.map(e => ({
        ...e,
        rsvp_count: e.rsvp_count?.[0]?.count || 0
    })) || []

    const now = new Date()
    const upcomingEvents = formattedEvents.filter(e => new Date(e.metadata.start_time) >= now)
    const pastEvents = formattedEvents.filter(e => new Date(e.metadata.start_time) < now).reverse()

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <main className="flex-1 container-custom py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-2">
                            Events
                        </h1>
                        <p className="text-text-light dark:text-dark-text-muted">
                            Discover workshops, webinars, and meetups.
                        </p>
                    </div>

                    <Link
                        href="/events/create"
                        className="btn btn-primary flex items-center justify-center gap-2"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Create Event
                    </Link>
                </div>

                <div className="space-y-12">
                    {/* Upcoming Events */}
                    <section>
                        <h2 className="text-xl font-bold text-text dark:text-dark-text mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            Upcoming Events
                        </h2>

                        <div className="grid gap-6">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                                    <p className="text-text-light dark:text-dark-text-muted">
                                        No upcoming events scheduled.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Past Events */}
                    {pastEvents.length > 0 && (
                        <section>
                            <h2 className="text-xl font-bold text-text dark:text-dark-text mb-6 opacity-70">
                                Past Events
                            </h2>

                            <div className="grid gap-6 opacity-70 hover:opacity-100 transition-opacity">
                                {pastEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
