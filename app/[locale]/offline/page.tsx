'use client'

import { WifiOff, RefreshCw, BookOpen } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getAllCachedArticles } from '@/lib/offlineStorage'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

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
            <div className="max-w-md w-full text-center space-y-6">
                {/* Icon */}
                <div className="w-20 h-20 mx-auto rounded-full bg-dark-surface flex items-center justify-center">
                    <WifiOff className="w-10 h-10 text-gray-400" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-gray-100">
                        {t('offlineTitle')}
                    </h1>
                    <p className="text-gray-400">
                        {t('offlineDescription')}
                    </p>
                </div>

                {/* Retry Button */}
                <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    {t('tryAgain')}
                </button>

                {/* Cached Articles */}
                {!loading && cachedArticles.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-dark-border text-left">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="w-5 h-5 text-gray-400" />
                            <h2 className="text-sm font-medium text-gray-300">
                                {t('availableOffline', { count: cachedArticles.length })}
                            </h2>
                        </div>
                        <ul className="space-y-3">
                            {cachedArticles.slice(0, 5).map((article) => (
                                <li key={article.id}>
                                    <Link
                                        href={`/post/${article.id}`}
                                        className="block p-3 rounded-lg bg-dark-surface hover:bg-dark-surface/80 transition-colors"
                                    >
                                        <p className="text-sm font-medium text-gray-200 line-clamp-1">
                                            {article.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t('byAuthor', { author: article.author?.name || 'Unknown' })}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Branding */}
                <div className="pt-6 text-sm text-gray-500">
                    {t('platformName')}
                </div>
            </div>
        </div>
    )
}

