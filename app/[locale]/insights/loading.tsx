import { Loader2 } from 'lucide-react'
import { Navbar } from '@/components/Navbar'

/**
 * Loading skeleton for the Insights page
 */
export default function InsightsLoading() {
    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar />

            <main className="flex-1 container-custom py-8">
                {/* Header skeleton */}
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                        <div className="h-4 w-64 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-32 bg-gray-200 dark:bg-dark-border rounded-lg animate-pulse" />
                </div>

                {/* Filter tabs skeleton */}
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-9 w-24 bg-gray-200 dark:bg-dark-border rounded-lg animate-pulse" />
                    ))}
                </div>

                {/* Posts skeleton */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-dark-border rounded-full animate-pulse" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 w-24 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                                        <div className="h-3 w-16 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-5 w-full bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                                    <div className="h-5 w-3/4 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                                </div>
                                <div className="h-4 w-full bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                                <div className="h-4 w-2/3 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Loading toast */}
            <div className="fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border animate-in slide-in-from-right-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm font-medium text-text dark:text-dark-text">
                    Loading insights...
                </span>
            </div>
        </div>
    )
}
