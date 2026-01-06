'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface EventData {
    id: string
    title: string
    content: string
    author_id: string
    approval_status: string | null
    metadata: {
        start_time?: string
        end_time?: string
        location?: string
        link?: string
        status?: string
    } | null
}

export default function EditEventPage() {
    const [event, setEvent] = useState<EventData | null>(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [location, setLocation] = useState('')
    const [link, setLink] = useState('')
    const [status, setStatus] = useState('scheduled')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [unauthorized, setUnauthorized] = useState(false)

    const supabase = createClient()
    const router = useRouter()
    const params = useParams()
    const { showToast } = useToast()
    const eventId = params?.id as string

    // Load event data
    useEffect(() => {
        const loadEvent = async () => {
            if (!eventId) return

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                showToast('Please sign in to edit this event.', 'error')
                router.push('/login')
                return
            }

            const { data, error } = await supabase
                .from('posts')
                .select('id, title, content, author_id, approval_status, metadata')
                .eq('id', eventId)
                .eq('content_type', 'event')
                .single()

            if (error || !data) {
                showToast('Event not found.', 'error')
                router.push('/events')
                return
            }

            // Check if user is the author
            if (data.author_id !== user.id) {
                setUnauthorized(true)
                setLoading(false)
                return
            }

            setEvent(data)

            // Populate form fields
            setTitle(data.title || '')
            setDescription(data.content || '')

            if (data.metadata) {
                // Convert ISO to datetime-local format
                if (data.metadata.start_time) {
                    const startDate = new Date(data.metadata.start_time)
                    setStartTime(startDate.toISOString().slice(0, 16))
                }
                if (data.metadata.end_time) {
                    const endDate = new Date(data.metadata.end_time)
                    setEndTime(endDate.toISOString().slice(0, 16))
                }
                setLocation(data.metadata.location || '')
                setLink(data.metadata.link || '')
                setStatus(data.metadata.status || 'scheduled')
            }

            setLoading(false)
        }

        loadEvent()
    }, [eventId, supabase, router, showToast])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Update the event
            const { error } = await supabase
                .from('posts')
                .update({
                    title,
                    content: description,
                    metadata: {
                        start_time: new Date(startTime).toISOString(),
                        end_time: endTime ? new Date(endTime).toISOString() : null,
                        location,
                        link,
                        status
                    },
                    updated_at: new Date().toISOString()
                })
                .eq('id', eventId)

            if (error) throw error

            // If there's a revision_requested appeal, update it to pending (awaiting re-review)
            const { error: appealError } = await supabase
                .from('moderation_appeals')
                .update({
                    status: 'pending',
                    dispute_reason: 'Content revised as requested. Awaiting re-review.',
                    updated_at: new Date().toISOString()
                })
                .eq('post_id', eventId)
                .eq('user_id', user.id)
                .eq('status', 'revision_requested')

            if (appealError) {
                console.error('Error updating appeal:', appealError)
            }

            showToast('Event updated and submitted for review.', 'success')
            router.refresh()
            router.push(`/events/${eventId}`)
        } catch (error: any) {
            console.error('Error updating event:', error)
            showToast(error?.message || 'Failed to update event.', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </main>
            </div>
        )
    }

    if (unauthorized) {
        return (
            <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
                <Navbar />
                <main className="flex-1 container-custom max-w-3xl py-12">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                            Unauthorized
                        </h2>
                        <p className="text-red-600 dark:text-red-300 mb-4">
                            You can only edit events that you created.
                        </p>
                        <Link href="/events">
                            <Button variant="outline">Back to Events</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar />

            <main className="flex-1 container-custom max-w-3xl py-12">
                <Link
                    href={`/events/${eventId}`}
                    className="inline-flex items-center gap-2 text-text-light dark:text-dark-text-muted hover:text-primary mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Event
                </Link>

                <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-8">
                    Edit Event
                </h1>

                {event?.approval_status === 'rejected' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            <strong>Note:</strong> Make the requested changes and save. Once saved, an admin will review your updated event.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-dark-surface p-8 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">

                    <div className="space-y-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Weekly Research Sync"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                id="startTime"
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time (Optional)</Label>
                            <Input
                                id="endTime"
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Zoom, Conference Room A, or Online"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="link">Event Link (Optional)</Label>
                        <Input
                            id="link"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="e.g. https://zoom.us/j/..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the event agenda and details..."
                            required
                            className="min-h-[150px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Event Status</Label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="select-input"
                        >
                            <option value="scheduled">Scheduled</option>
                            <option value="postponed">Postponed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <p className="text-sm text-text-light dark:text-dark-text-muted">
                            Update the status if the event has been cancelled or postponed.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Link href={`/events/${eventId}`}>
                            <Button type="button" variant="outline" disabled={saving}>
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={saving} size="lg">
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    )
}
