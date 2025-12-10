import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { PostCard } from '@/components/PostCard'
import { Bookmark } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Saved Posts | Syrealize',
    description: 'Your saved posts for later reference',
}

export default async function SavedPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get bookmarked posts
    const { data: bookmarks } = await supabase
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
        created_at,
        updated_at,
        author_id,
        forked_from_id,
        license,
        comment_count,
        citation_count,
        author:users!posts_author_id_fkey(id, name, email)
      )
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Filter out any null posts and format the data
    const savedPosts = (bookmarks || [])
        .filter((b: any) => b.post)
        .map((b: any) => b.post)

    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <main className="flex-1 section pt-20 md:pt-24">
                <div className="container-custom max-w-4xl">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-dark-surface">
                            <Bookmark className="w-5 h-5 text-text dark:text-dark-text" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-display font-semibold text-primary dark:text-dark-text">
                                Saved Posts
                            </h1>
                            <p className="text-sm text-text-light dark:text-dark-text-muted">
                                {savedPosts.length} saved for later
                            </p>
                        </div>
                    </div>

                    {/* Saved Posts Grid */}
                    {savedPosts.length > 0 ? (
                        <div className="space-y-6">
                            {savedPosts.map((post: any) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Bookmark className="w-12 h-12 mx-auto text-gray-300 dark:text-dark-border mb-4" />
                            <h2 className="text-lg font-medium text-text dark:text-dark-text mb-2">
                                No saved posts yet
                            </h2>
                            <p className="text-text-light dark:text-dark-text-muted mb-6">
                                Click the bookmark icon on any post to save it for later.
                            </p>
                            <Link
                                href="/feed"
                                className="btn btn-primary"
                            >
                                Explore Posts
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
