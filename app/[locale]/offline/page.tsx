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
        window.location.href = '/'
    }

    return (
        <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Icon */}
                <div className="w-24 h-24 mx-auto rounded-full bg-dark-surface border border-dark-border flex items-center justify-center shadow-sm">
                    <WifiOff className="w-10 h-10 text-gray-400" />
                </div>

                {/* Title */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-display font-bold text-gray-100">
                        {t('offlineTitle')}
                    </h1>
                    <p className="text-gray-400 text-lg">
                        {t('offlineDescription')}
                    </p>
                </div>

                {/* Retry Button */}
                <Button
                    onClick={handleRetry}
                    size="lg"
                    className="inline-flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    {t('tryAgain')}
                </Button>

                {/* Cached Articles */}
                {!loading && cachedArticles.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-dark-border text-left">
                        <div className="flex items-center gap-2 mb-6">
                            <BookOpen className="w-5 h-5 text-gray-400" />
                            <h2 className="text-lg font-medium text-gray-200">
                                {t('availableOffline', { count: cachedArticles.length })}
                            </h2>
                        </div>
                        <ul className="space-y-3">
                            {cachedArticles.slice(0, 5).map((article) => (
                                <li key={article.id}>
                                    <Link
                                        href={`/post/${article.id}`}
                                        className="block p-4 rounded-xl bg-dark-surface border border-dark-border hover:bg-dark-surface/80 hover:border-gray-600 transition-all group"
                                    >
                                        <p className="text-base font-medium text-gray-200 group-hover:text-white line-clamp-1">
                                            {article.title}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {t('byAuthor', { author: article.author?.name || 'Unknown' })}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Branding */}
                <div className="pt-8 text-sm text-gray-600">
                    {t('platformName')}
                </div>
            </div>
        </div>
    )
}

