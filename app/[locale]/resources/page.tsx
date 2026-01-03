import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
// Refreshed layout consistency for ResourceCard tags
import { Footer } from '@/components/Footer'
import { ResourceCard } from '@/components/ResourceCard'
import { ResourceFilters } from '@/components/ResourceFilters'
import { inferResourceType } from '@/lib/utils'
import Link from 'next/link'
import { UploadCloud, FolderOpen } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

interface SearchParams {
    type?: string
    discipline?: string
    license?: string
    q?: string
    sort?: string
}

export default async function ResourcesPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const t = await getTranslations('Resources')

    // Build the query based on filters
    let query = supabase
        .from('posts')
        .select(`
            *,
            author:users!author_id(id, name, email, avatar_url)
        `)
        .eq('content_type', 'resource')
        .eq('status', 'published')

    // Apply filters
    if (params.type) {
        query = query.eq('metadata->>resource_type', params.type)
    }
    if (params.license) {
        query = query.eq('metadata->>license', params.license)
    }
    if (params.q) {
        query = query.or(`title.ilike.%${params.q}%,content.ilike.%${params.q}%`)
    }

    // Apply sorting
    if (params.sort === 'downloads') {
        query = query.order('metadata->downloads', { ascending: false, nullsFirst: false })
    } else if (params.sort === 'title') {
        query = query.order('title', { ascending: true })
    } else {
        query = query.order('created_at', { ascending: false })
    }

    const { data: resources } = await query

    // Filter by discipline client-side (requires tag lookup)
    let filteredResources = resources || []
    if (params.discipline && resources) {
        const { data: tags } = await supabase
            .from('tags')
            .select('label')
            .eq('discipline', params.discipline)

        const disciplineTags = tags?.map(t => t.label) || []
        filteredResources = resources.filter((r: any) =>
            r.tags?.some((tag: string) => disciplineTags.includes(tag))
        )
    }

    // Add linked_posts_count = 0 and infer type for each resource on the server
    const resourcesWithLinks = filteredResources.map((resource: any) => {
        const metadata = resource.metadata || {}
        // Explicitly calculate the resource type on the server to avoid client-side hydration issues
        const inferredType = (metadata.resource_type?.toLowerCase()) ||
            inferResourceType(metadata.mime_type, metadata.original_name, resource.title) ||
            'document'

        return {
            ...resource,
            linked_posts_count: 0,
            inferredType
        }
    })

    const hasFilters = params.type || params.discipline || params.license || params.q

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <main className="flex-1 container-custom py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-2">
                            {t('title')}
                        </h1>
                        <p className="text-text-light dark:text-dark-text-muted">
                            {t('subtitle')}
                        </p>
                    </div>

                    <Link
                        href="/resources/upload"
                        className="btn btn-primary flex items-center justify-center gap-2"
                    >
                        <UploadCloud className="w-5 h-5" />
                        {t('uploadResource')}
                    </Link>
                </div>

                <div className="grid md:grid-cols-[280px_1fr] gap-8">
                    {/* Filters Sidebar */}
                    <aside className="md:sticky md:top-24 h-fit">
                        <ResourceFilters />
                    </aside>

                    {/* Resources Grid */}
                    <div className="space-y-6">
                        {/* Results Count */}
                        {hasFilters && (
                            <div className="text-sm text-text-light dark:text-dark-text-muted">
                                {t('showingResults', { count: resourcesWithLinks.length })}
                                {params.q && <span> for &quot;{params.q}&quot;</span>}
                            </div>
                        )}

                        {resourcesWithLinks.length > 0 ? (
                            resourcesWithLinks.map((resource: any) => (
                                <ResourceCard
                                    key={resource.id}
                                    resource={resource}
                                    preCalculatedType={resource.inferredType}
                                />
                            ))
                        ) : (
                            <div className="text-center py-16 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                                <FolderOpen className="w-16 h-16 mx-auto text-gray-300 dark:text-dark-text-muted mb-4" />
                                <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">
                                    {hasFilters ? t('noResults') : t('noResources')}
                                </h3>
                                <p className="text-text-light dark:text-dark-text-muted mb-6 max-w-md mx-auto">
                                    {hasFilters ? t('noResultsDesc') : t('noResourcesDesc')}
                                </p>
                                {!hasFilters && (
                                    <Link
                                        href="/resources/upload"
                                        className="btn btn-outline"
                                    >
                                        {t('uploadResource')}
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

