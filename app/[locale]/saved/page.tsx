import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { SavedItemsManager } from '@/components/SavedItemsManager'
import { Bookmark } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const metadata = {
    title: 'Saved | SyriaHub',
    description: 'Your saved posts, events, and web references',
}

async function getSavedContent(userId: string, supabase: any) {
    // Get bookmarked posts
    const { data: bookmarks, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select(`
            id,
            created_at,
            post:posts(
                id,
                title,
                content,
                tags,
                status,
                content_type,
                metadata,
                created_at,
                updated_at,
                author_id,
                author:users!posts_author_id_fkey(id, name, email)
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (bookmarksError) {
        console.error('Error fetching bookmarks:', bookmarksError.message)
    }

    // Get saved web references
    const { data: references, error: referencesError } = await supabase
        .from('saved_references')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (referencesError) {
        console.error('Error fetching references:', referencesError.message)
    }

    // Get saved events (from event_rsvps with status 'saved' or bookmarks linking to events)
    // For now, keeping events empty - can be extended when events bookmarking is added
    const events: any[] = []

    return {
        bookmarks: bookmarks || [],
        references: references || [],
        events
    }
}

export default async function SavedPage() {
    const supabase = await createClient()
    const t = await getTranslations('Saved')
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { bookmarks, references, events } = await getSavedContent(user.id, supabase)

    // Filter and transform bookmarks by content_type
    const savedPosts = bookmarks
        .filter((b: any) => b.post && b.post.content_type !== 'event')
        .map((b: any) => ({
            ...b.post,
            bookmark_id: b.id,
            created_at: b.created_at
        }))

    const savedEvents = bookmarks
        .filter((b: any) => b.post && b.post.content_type === 'event')
        .map((b: any) => ({
            ...b.post,
            bookmark_id: b.id,
            event_date: b.post.metadata?.start_time,
            location: b.post.metadata?.location,
            created_at: b.created_at
        }))

    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <main className="flex-1 section pt-20 md:pt-24">
                <div className="container-custom max-w-4xl">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-surface">
                            <Bookmark className="w-5 h-5 text-text dark:text-dark-text" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-semibold text-primary dark:text-dark-text">
                                {t('title')}
                            </h1>
                            <p className="text-sm text-text-light dark:text-dark-text-muted">
                                {t('itemsCount', { count: savedPosts.length + references.length + savedEvents.length })}
                            </p>
                        </div>
                    </div>

                    {/* Saved Items Manager (Client Component) */}
                    <SavedItemsManager
                        posts={savedPosts}
                        references={references}
                        events={savedEvents}
                    />
                </div>
            </main>
        </div>
    )
}
