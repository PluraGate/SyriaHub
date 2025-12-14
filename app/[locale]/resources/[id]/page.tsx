import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CommentsSection } from '@/components/CommentsSection'
import { notFound } from 'next/navigation'
import { FileText, Download, Calendar, User, HardDrive } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { TagChip } from '@/components/TagChip'
import { ViewTracker } from '@/components/ViewTracker'
import { PostHistoryButton } from '@/components/PostHistoryButton'

export default async function ResourceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: resource } = await supabase
        .from('posts')
        .select(`
      *,
      author:users!author_id(name, email)
    `)
        .eq('id', id)
        .single()

    if (!resource || resource.content_type !== 'resource') notFound()

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const displayAuthor = resource.author?.name || resource.author?.email?.split('@')[0] || 'Anonymous'
    const metadata = resource.metadata || {}

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <main className="flex-1 container-custom py-12">
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                    <div className="p-8 border-b border-gray-100 dark:border-dark-border">
                        <div className="flex items-start gap-6">
                            <div className="w-20 h-20 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                                <FileText className="w-10 h-10" />
                            </div>

                            <div className="flex-1">
                                <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-4">
                                    {resource.title}
                                </h1>

                                <div className="flex flex-wrap gap-6 text-sm text-text-light dark:text-dark-text-muted">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span>{displayAuthor}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HardDrive className="w-4 h-4" />
                                        <span>{formatSize(metadata.size || 0)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Download className="w-4 h-4" />
                                        <span>{metadata.downloads || 0} Downloads</span>
                                    </div>
                                    <PostHistoryButton postId={id} />
                                </div>
                            </div>

                            <a
                                href={metadata.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary flex items-center gap-2"
                                download
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </a>
                        </div>
                    </div>

                    <div className="p-8">
                        <h2 className="text-xl font-bold text-text dark:text-dark-text mb-4">Description</h2>
                        <div className="prose dark:prose-invert max-w-none text-text dark:text-dark-text mb-8">
                            {resource.content}
                        </div>

                        {resource.tags && resource.tags.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-text-light dark:text-dark-text-muted uppercase tracking-wider mb-3">
                                    Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {resource.tags.map((tag: string) => (
                                        <TagChip key={tag} tag={tag} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <CommentsSection postId={id} />
                <ViewTracker postId={id} />
            </main>

            <Footer />
        </div>
    )
}
