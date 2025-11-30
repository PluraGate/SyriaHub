import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { SuggestionsList } from '@/components/SuggestionsList'

interface SuggestionsPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function SuggestionsPage(props: SuggestionsPageProps) {
    const params = await props.params
    const { id } = params
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { data: post, error } = await supabase
        .from('posts')
        .select('id, title, author_id')
        .eq('id', id)
        .single()

    if (error || !post) {
        notFound()
    }

    // Only author can view suggestions page
    if (!user || user.id !== post.author_id) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-bg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-text-light dark:text-dark-text-muted mb-4">
                        Only the author can view suggestions for this post.
                    </p>
                    <Link href={`/post/${id}`} className="text-primary hover:underline">
                        Return to Post
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <div className="border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
                <div className="container-custom max-w-5xl py-4">
                    <Link
                        href={`/post/${id}`}
                        className="inline-flex items-center gap-2 text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Post
                    </Link>
                </div>
            </div>

            <main className="container-custom max-w-3xl py-8 md:py-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-2">
                        Suggestions
                    </h1>
                    <p className="text-text-light dark:text-dark-text-muted">
                        Review suggested edits for <span className="font-semibold">{post.title}</span>
                    </p>
                </div>

                <SuggestionsList postId={id} />
            </main>
        </div>
    )
}
