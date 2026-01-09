import { Loader2 } from 'lucide-react'
import { Navbar } from '@/components/Navbar'

/**
 * Loading skeleton shown while a post is being fetched.
 * This provides better UX than a blank screen during navigation.
 */
export default function PostLoading() {
    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar />

            {/* Hero skeleton */}
            <header className="relative overflow-hidden min-h-[250px] sm:min-h-[350px] md:min-h-[400px] bg-gradient-to-br from-primary/20 to-secondary/10 dark:from-primary/10 dark:to-secondary/5">
                <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/60" />
                <div className="relative z-10 container-custom max-w-5xl py-6">
                    {/* Back link skeleton */}
                    <div className="h-4 w-32 bg-white/20 rounded animate-pulse mb-8" />

                    {/* Title skeleton */}
                    <div className="space-y-4 mb-6">
                        <div className="h-10 w-3/4 bg-white/20 rounded animate-pulse" />
                        <div className="h-10 w-1/2 bg-white/20 rounded animate-pulse" />
                    </div>

                    {/* Tags skeleton */}
                    <div className="flex gap-2 mb-6">
                        <div className="h-8 w-20 bg-white/20 rounded-full animate-pulse" />
                        <div className="h-8 w-24 bg-white/20 rounded-full animate-pulse" />
                        <div className="h-8 w-16 bg-white/20 rounded-full animate-pulse" />
                    </div>

                    {/* Meta row skeleton */}
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white/20 rounded-full animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
                            <div className="h-3 w-32 bg-white/20 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content skeleton */}
            <main className="flex-1 container-custom max-w-5xl py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-4 w-full bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                        <div className="h-4 w-11/12 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                        <div className="h-4 w-full bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                        <div className="h-4 w-full bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                        <div className="h-4 w-5/6 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                        <div className="h-4 w-full bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gray-200 dark:bg-dark-border rounded-2xl animate-pulse" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-24 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                                    <div className="h-3 w-32 bg-gray-200 dark:bg-dark-border rounded animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Loading indicator overlay */}
            <div className="fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border animate-in slide-in-from-right-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm font-medium text-text dark:text-dark-text">
                    Loading post...
                </span>
            </div>
        </div>
    )
}
