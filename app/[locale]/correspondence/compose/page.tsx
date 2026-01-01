import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CorrespondenceForm } from '@/components/correspondence'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react'
import { Link } from '@/navigation'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'Correspondence' })

    return {
        title: `${t('compose')} | SyriaHub`,
        description: 'Send a clarification request'
    }
}

export default async function CorrespondenceComposePage({
    params,
    searchParams
}: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ post?: string }>
}) {
    const { locale } = await params
    const { post: postId } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const t = await getTranslations({ locale, namespace: 'Correspondence' })

    if (!user) {
        redirect(`/${locale}/login`)
    }

    // Post context is required
    if (!postId) {
        return (
            <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
                <Navbar user={user} />

                <main className="flex-1">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h1 className="text-xl font-bold text-text dark:text-dark-text mb-2">
                                {t('contextRequired')}
                            </h1>
                            <p className="text-text-light dark:text-dark-text-muted mb-6">
                                Correspondence must be linked to a specific post. Please navigate to a post and use the &quot;Request Clarification&quot; button.
                            </p>
                            <Link
                                href="/feed"
                                className="inline-flex items-center gap-2 text-primary hover:underline"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Browse posts
                            </Link>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        )
    }

    // Fetch post and author
    const { data: post, error: postError } = await supabase
        .from('posts')
        .select('id, title, author_id, author:users!posts_author_id_fkey(id, name)')
        .eq('id', postId)
        .single()

    if (postError || !post) {
        notFound()
    }

    // Can't send correspondence to yourself
    if (post.author_id === user.id) {
        return (
            <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
                <Navbar user={user} />

                <main className="flex-1">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-dark-bg flex items-center justify-center">
                                <FileText className="w-8 h-8 text-text-light dark:text-dark-text-muted" />
                            </div>
                            <h1 className="text-xl font-bold text-text dark:text-dark-text mb-2">
                                This is your own post
                            </h1>
                            <p className="text-text-light dark:text-dark-text-muted mb-6">
                                You cannot send correspondence to yourself.
                            </p>
                            <Link
                                href={`/post/${postId}`}
                                className="inline-flex items-center gap-2 text-primary hover:underline"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to post
                            </Link>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        )
    }
    // Author is returned as object from the FK join (using !)
    const author = post.author as unknown as { id: string; name: string } | null

    if (!author) {
        notFound()
    }

    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <main className="flex-1">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Back Link */}
                    <Link
                        href={`/post/${postId}`}
                        className="inline-flex items-center gap-2 text-text-light dark:text-dark-text-muted hover:text-primary mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                        Back to post
                    </Link>

                    {/* Form Card */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6 sm:p-8">
                        <h1 className="text-2xl font-display font-bold text-text dark:text-dark-text mb-2">
                            {t('requestClarification')}
                        </h1>
                        <p className="text-text-light dark:text-dark-text-muted mb-6">
                            Send a formal inquiry to the author regarding their post.
                        </p>

                        <CorrespondenceForm
                            recipientId={author.id}
                            recipientName={author.name}
                            postId={postId}
                            postTitle={post.title}
                            kind="clarification_request"
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
