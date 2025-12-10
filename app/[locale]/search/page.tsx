import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { SearchFilters } from '@/components/SearchFilters'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { FileText, Users, Globe } from 'lucide-react'

type SearchResult = {
    id: string
    type: 'post' | 'group' | 'user'
    title: string
    description: string
    url: string
    created_at: string
    rank: number
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q: string, type?: string, date?: string }>
}) {
    const { q, type, date } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let results: SearchResult[] = []

    if (q) {
        const { data, error } = await supabase.rpc('search_content', {
            query: q,
            filter_type: type || null,
            filter_tag: null, // Tag filtering not implemented in UI yet
            filter_date: date || null
        })
        if (!error && data) {
            results = data as SearchResult[]
        }
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <main className="container-custom max-w-6xl py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <SearchFilters />
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="mb-8">
                            <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text mb-2">
                                Search Results
                            </h1>
                            <p className="text-text-light dark:text-dark-text-muted">
                                Showing results for <span className="font-semibold">&quot;{q}&quot;</span>
                            </p>
                        </div>

                        <div className="space-y-6">
                            {results.length === 0 ? (
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
                                                {result.type === 'post' && <FileText className="w-5 h-5 text-blue-500" />}
                                                {result.type === 'group' && <Globe className="w-5 h-5 text-green-500" />}
                                                {result.type === 'user' && <Users className="w-5 h-5 text-purple-500" />}
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
                                                    {result.description}
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
