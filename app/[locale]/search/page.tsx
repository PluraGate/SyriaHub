import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { AdvancedSearchFilters } from '@/components/AdvancedSearchFilters'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { FileText, Users, Globe, Calendar } from 'lucide-react'

type SearchResult = {
    id: string
    type: 'post' | 'group' | 'user' | 'event'
    title: string
    description: string
    url: string
    created_at: string
    rank: number
}

// Helper to strip markdown formatting for clean display
function stripMarkdown(text: string): string {
    if (!text) return ''
    return text
        .replace(/^#{1,6}\s+/gm, '') // Remove headers
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
        .replace(/\*([^*]+)\*/g, '$1') // Remove italic
        .replace(/__([^_]+)__/g, '$1') // Remove bold
        .replace(/_([^_]+)_/g, '$1') // Remove italic
        .replace(/`([^`]+)`/g, '$1') // Remove inline code
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Remove images
        .replace(/^[-*+]\s+/gm, '') // Remove list markers
        .replace(/^\d+\.\s+/gm, '') // Remove numbered list markers
        .replace(/^>\s+/gm, '') // Remove blockquotes
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim()
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string, type?: string, date?: string, tag?: string, sort?: string }>
}) {
    const { q, type, date, tag, sort } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let results: SearchResult[] = []

    if (q) {
        // Try fuzzy search first
        const { data: fuzzyData, error: fuzzyError } = await supabase.rpc('fuzzy_search_content', {
            p_query: q,
            p_filter_type: type || null,
            p_filter_tag: tag || null,
            p_filter_date: date || null,
            p_limit: 50
        })

        if (!fuzzyError && fuzzyData) {
            results = fuzzyData as SearchResult[]
        } else {
            // Fallback to old search function
            const { data, error } = await supabase.rpc('search_content', {
                query: q,
                filter_type: type || null,
                filter_tag: tag || null,
                filter_date: date || null
            })
            if (!error && data) {
                results = data as SearchResult[]
            }
        }

        // Apply client-side sorting if needed
        if (sort === 'recent') {
            results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }

        // Log search analytics (non-blocking, fire and forget)
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        supabase.from('search_analytics').insert({
            user_id: currentUser?.id || null,
            query: q,
            query_normalized: q.toLowerCase().trim(),
            filter_type: type || null,
            filter_tag: tag || null,
            filter_date: date || null,
            results_count: results.length,
            source: 'web'
        }).then(() => { }).catch(() => { }) // Silent fail
    }

    const getIcon = (resultType: string) => {
        switch (resultType) {
            case 'post':
                return <FileText className="w-5 h-5 text-blue-500" />
            case 'group':
                return <Globe className="w-5 h-5 text-green-500" />
            case 'user':
                return <Users className="w-5 h-5 text-purple-500" />
            case 'event':
                return <Calendar className="w-5 h-5 text-orange-500" />
            default:
                return <FileText className="w-5 h-5 text-gray-400" />
        }
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <main className="container-custom max-w-6xl py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <AdvancedSearchFilters />
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="mb-8">
                            <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-2">
                                Search Results
                            </h1>
                            {q && (
                                <p className="text-text-light dark:text-dark-text-muted">
                                    Showing results for <span className="font-semibold">&quot;{q}&quot;</span>
                                    {results.length > 0 && (
                                        <span className="ml-2 text-sm">({results.length} found)</span>
                                    )}
                                </p>
                            )}
                        </div>

                        <div className="space-y-6">
                            {!q ? (
                                <div className="bg-white dark:bg-dark-surface rounded-xl border border-dashed border-gray-300 dark:border-dark-border p-12 text-center">
                                    <p className="text-text-light dark:text-dark-text-muted">
                                        Enter a search term to find posts, users, groups, and events.
                                    </p>
                                </div>
                            ) : results.length === 0 ? (
                                <div className="bg-white dark:bg-dark-surface rounded-xl border border-dashed border-gray-300 dark:border-dark-border">
                                    <EmptyState
                                        variant="no-results"
                                        title="No results found"
                                        description={`We couldn't find anything matching "${q}". Try different keywords or adjust your filters.`}
                                        actionLabel="Clear Search"
                                        actionHref="/search"
                                    />
                                </div>

                            ) : (
                                results.map((result) => (
                                    <Link
                                        key={`${result.type}-${result.id}`}
                                        href={result.url}
                                        className="block p-6 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border hover:border-primary/50 dark:hover:border-primary/50 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">
                                                {getIcon(result.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                        {result.type}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-semibold text-text dark:text-dark-text group-hover:text-primary transition-colors mb-2">
                                                    {result.title}
                                                </h3>
                                                <p className="text-text-light dark:text-dark-text-muted line-clamp-2">
                                                    {stripMarkdown(result.description)}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
