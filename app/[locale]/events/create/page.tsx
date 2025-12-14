'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Calendar as CalendarIcon } from 'lucide-react'

export default function CreateEventPage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [location, setLocation] = useState('')
    const [link, setLink] = useState('')
    const [loading, setLoading] = useState(false)

    const supabase = createClient()
    const router = useRouter()
    const { showToast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                showToast('Please sign in to create an event.', 'error')
                router.push('/login')
                return
            }

            const { data, error } = await supabase
                .from('posts')
                .insert({
                    title,
                    content: description,
                    content_type: 'event',
                    author_id: user.id,
                    status: 'published',
                    metadata: {
                        start_time: new Date(startTime).toISOString(),
                        end_time: endTime ? new Date(endTime).toISOString() : null,
                        location,
                        link
                    }
                })
                .select()
                .single()

            if (error) throw error

            showToast('Your event has been successfully created.', 'success')

            router.push(`/events/${data.id}`)
        } catch (error: any) {
            console.error('Error creating event:', JSON.stringify(error, null, 2))
            showToast(error?.message || 'Failed to create event.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar />

            <main className="flex-1 container-custom max-w-3xl py-12">
                <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-8">
                    Create Event
                </h1>

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

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading} size="lg">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {loading ? 'Creating...' : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </main>

            <Footer />
        </div>
    )
}
