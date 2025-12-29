'use client'

import { WifiOff, RefreshCw, BookOpen } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getAllCachedArticles } from '@/lib/offlineStorage'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

interface CachedArticle {
    id: string
    title: string
    author: { name: string }
    cachedAt: number
}

export default function OfflinePage() {
    const t = useTranslations('PWA')
    const [cachedArticles, setCachedArticles] = useState<CachedArticle[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAllCachedArticles()
            .then((articles) => setCachedArticles(articles))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleRetry = () => {
        window.location.reload()
    }

    return (
        <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full text-center space-y-10 relative z-10">
                {/* Icon Container with Glow */}
                <div className="relative mx-auto w-28 h-28">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-full h-full rounded-full bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border flex items-center justify-center shadow-soft-xl">
                        <WifiOff className="w-12 h-12 text-primary dark:text-accent animate-bounce-subtle" />
                    </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-display font-bold text-text dark:text-dark-text tracking-tight">
                        {t('offlineTitle')}
                    </h1>
                    <p className="text-text-muted dark:text-dark-text-muted text-lg leading-relaxed max-w-sm mx-auto">
                        {t('offlineDescription')}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                        onClick={handleRetry}
                        size="lg"
                        className="btn-primary w-full sm:w-auto px-8 py-6 rounded-2xl shadow-soft-lg hover:shadow-glow-coral transition-all duration-300"
                    >
                        <RefreshCw className="mr-2 w-5 h-5" />
                        {t('tryAgain')}
                    </Button>
                    <Link href="/" className="w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full border-gray-200 dark:border-dark-border px-8 py-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors"
                        >
                            {t('backToHome')}
                        </Button>
                    </Link>
                </div>

                {/* Cached Articles Section */}
                {!loading && cachedArticles.length > 0 && (
                    <div className="mt-12 pt-10 border-t border-gray-100 dark:border-dark-border text-left animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-primary/5 dark:bg-primary/10">
                                <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-display font-semibold text-text dark:text-dark-text">
                                {t('availableOffline', { count: cachedArticles.length })}
                            </h2>
                        </div>
                        <ul className="space-y-4">
                            {cachedArticles.slice(0, 4).map((article) => (
                                <li key={article.id}>
                                    <Link
                                        href={`/post/${article.id}`}
                                        className="block p-5 rounded-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border hover:border-primary/30 dark:hover:border-primary/50 hover:shadow-soft-lg transition-all duration-300 group"
                                    >
                                        <h3 className="text-base font-semibold text-text dark:text-dark-text group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                            {article.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-3 text-sm text-text-muted dark:text-dark-text-muted">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                            {t('byAuthor', { author: article.author?.name || 'Unknown' })}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Platform Label */}
                <div className="pt-8 text-xs font-medium tracking-widest uppercase text-text-muted/60 dark:text-dark-text-muted/40">
                    {t('platformName')}
                </div>
            </div>
        </div>
    )
}

