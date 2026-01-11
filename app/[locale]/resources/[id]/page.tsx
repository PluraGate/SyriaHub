import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CommentsSection } from '@/components/CommentsSection'
import { notFound, redirect } from 'next/navigation'
import { FileText, Download, Calendar, User, HardDrive, Link2, Pencil } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { TagChip } from '@/components/TagChip'
import { ViewTracker } from '@/components/ViewTracker'
import { PostHistoryButton } from '@/components/PostHistoryButton'
import { Metadata } from 'next'
import { buildResourceMetadata, buildDatasetSchema, JsonLdScript } from '@/lib/seo'

/**
 * Checks if a string is a valid UUID v4
 */
function isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
}

interface ResourcePageProps {
    params: Promise<{ id: string; locale: string }>
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: ResourcePageProps): Promise<Metadata> {
    const { id } = await params
    const supabase = await createClient()

    // Fetch resource (by slug or UUID)
    let resource
    if (isUUID(id)) {
        const { data } = await supabase
            .from('posts')
            .select('id, slug, title, content, created_at, updated_at, tags, metadata, author:users!author_id(name, email)')
            .eq('id', id)
            .eq('content_type', 'resource')
            .single()
        resource = data
    } else {
        const { data } = await supabase
            .from('posts')
            .select('id, slug, title, content, created_at, updated_at, tags, metadata, author:users!author_id(name, email)')
            .eq('slug', id)
            .eq('content_type', 'resource')
            .single()
        resource = data
    }

    if (!resource) {
        return {
            title: 'Resource Not Found | SyriaHub',
            description: 'The requested resource could not be found.',
        }
    }

    return buildResourceMetadata({
        ...resource,
        author: resource.author as any
    })
}

export default async function ResourceDetailsPage({ params }: ResourcePageProps) {
    const { id, locale } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let resource

    // Determine if id is a UUID or a slug
    if (isUUID(id)) {
        // Lookup by UUID
        const { data } = await supabase
            .from('posts')
            .select(`
        *,
        author:users!author_id(name, email, avatar_url)
      `)
            .eq('id', id)
            .eq('content_type', 'resource')
            .single()

        resource = data

        // If resource has a slug, redirect to the canonical slug URL
        if (resource?.slug) {
            redirect(`/${locale}/resources/${resource.slug}`)
        }

        // If no slug, try to backfill one (lazy backfill)
        if (resource && !resource.slug) {
            const { data: backfilledSlug } = await supabase
                .rpc('get_resource_slug', { p_post_id: id })

            if (backfilledSlug) {
                // Refresh resource data with new slug
                const { data: refreshed } = await supabase
                    .from('posts')
                    .select(`
            *,
            author:users!author_id(name, email, avatar_url)
          `)
                    .eq('id', id)
                    .single()

                if (refreshed?.slug) {
                    redirect(`/${locale}/resources/${refreshed.slug}`)
                }
                resource = refreshed || resource
            }
        }
    } else {
        // Lookup by slug (primary method)
        const { data } = await supabase
            .from('posts')
            .select(`
        *,
        author:users!author_id(name, email, avatar_url)
      `)
            .eq('slug', id)
            .eq('content_type', 'resource')
            .single()

        resource = data
    }

    if (!resource) notFound()

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const displayAuthor = resource.author?.name || resource.author?.email?.split('@')[0] || 'Anonymous'
    const metadata = resource.metadata || {}

    // Build JSON-LD structured data
    const jsonLdData = buildDatasetSchema({
        ...resource,
        author: resource.author as any
    })

    return (
        <>
            <JsonLdScript data={jsonLdData} />
            <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
                <Navbar user={user} />

                <main className="flex-1 container-custom py-12">
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                        <div className="p-4 sm:p-8 border-b border-gray-100 dark:border-dark-border">
                            {/* Mobile Layout */}
                            <div className="flex flex-col gap-4 md:hidden">
                                {/* Top row: Icon and Action Buttons */}
                                <div className="flex items-center justify-between">
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                                        <FileText className="w-7 h-7" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={`/api/download?id=${resource.id}`}
                                            className="btn btn-primary btn-sm flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </a>
                                        {user && user.id === resource.author_id && (
                                            <Link
                                                href={`/resources/upload?edit=${resource.id}`}
                                                className="btn btn-outline btn-sm flex items-center gap-2"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <h1 className="text-2xl font-display font-bold text-primary dark:text-dark-text">
                                    {resource.title}
                                </h1>

                                {/* Metadata - vertical stack on mobile */}
                                <div className="flex flex-col gap-2 text-sm text-text-light dark:text-dark-text-muted">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 flex-shrink-0" />
                                        <span>{displayAuthor}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 flex-shrink-0" />
                                        <span>{formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HardDrive className="w-4 h-4 flex-shrink-0" />
                                        <span>{formatSize(metadata.size || 0)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Download className="w-4 h-4 flex-shrink-0" />
                                        <span>{metadata.downloads || 0} Downloads</span>
                                    </div>
                                    <PostHistoryButton postId={resource.id} />
                                </div>

                                {/* Slug */}
                                {resource.slug && (
                                    <div className="flex items-center gap-2 text-xs text-text-light dark:text-dark-text-muted">
                                        <Link2 className="w-3 h-3 flex-shrink-0" />
                                        <code className="font-mono bg-gray-100 dark:bg-dark-bg px-2 py-0.5 rounded text-xs break-all">
                                            {resource.slug}
                                        </code>
                                    </div>
                                )}
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden md:flex items-start gap-6">
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
                                        <PostHistoryButton postId={resource.id} />
                                    </div>

                                    {/* Show canonical slug if available */}
                                    {resource.slug && (
                                        <div className="mt-3 flex items-center gap-2 text-xs text-text-light dark:text-dark-text-muted">
                                            <Link2 className="w-3 h-3" />
                                            <code className="font-mono bg-gray-100 dark:bg-dark-bg px-2 py-0.5 rounded">
                                                {resource.slug}
                                            </code>
                                        </div>
                                    )}
                                </div>

                                <a
                                    href={`/api/download?id=${resource.id}`}
                                    className="btn btn-primary flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </a>

                                {user && user.id === resource.author_id && (
                                    <Link
                                        href={`/resources/upload?edit=${resource.id}`}
                                        className="btn btn-outline flex items-center gap-2"
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit Resource
                                    </Link>
                                )}
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

                    <CommentsSection postId={resource.id} />
                    <ViewTracker postId={resource.id} />
                </main>

                <Footer />
            </div>
        </>
    )
}

