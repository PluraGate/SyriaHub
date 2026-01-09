import { Loader2 } from 'lucide-react'

/**
 * Global loading state shown during page navigation.
 * This is shown when navigating between pages while Next.js 
 * is fetching data on the server.
 */
export default function Loading() {
    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    {/* Outer ring */}
                    <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-dark-border" />
                    {/* Spinning ring */}
                    <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                </div>
                <p className="text-sm text-text-light dark:text-dark-text-muted animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    )
}
