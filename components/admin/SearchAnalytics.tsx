'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Search,
    TrendingUp,
    AlertCircle,
    MousePointerClick,
    Loader2,
    BarChart3,
    Calendar
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useTranslations } from 'next-intl'

interface TopSearch {
    query_normalized: string
    search_count: number
    avg_results: number
    click_rate: number
}

interface ZeroResultSearch {
    query_normalized: string
    search_count: number
    last_searched: string
}

interface SearchTrend {
    search_date: string
    search_count: number
    unique_queries: number
    avg_results: number
}

export function SearchAnalytics() {
    const t = useTranslations('Admin.searchAnalyticsPage')
    const tCommon = useTranslations('Common')
    const [topSearches, setTopSearches] = useState<TopSearch[]>([])
    const [zeroResultSearches, setZeroResultSearches] = useState<ZeroResultSearch[]>([])
    const [trends, setTrends] = useState<SearchTrend[]>([])
    const [loading, setLoading] = useState(true)
    const [days, setDays] = useState(7)
    const [activeTab, setActiveTab] = useState<'top' | 'gaps' | 'trends'>('top')

    const supabase = createClient()

    const fetchAnalytics = useCallback(async () => {
        setLoading(true)
        try {
            // Fetch top searches
            const { data: topData } = await supabase.rpc('get_top_searches', {
                p_days: days,
                p_limit: 20
            })
            setTopSearches(topData || [])

            // Fetch zero-result searches
            const { data: zeroData } = await supabase.rpc('get_zero_result_searches', {
                p_days: days,
                p_limit: 20
            })
            setZeroResultSearches(zeroData || [])

            // Fetch trends
            const { data: trendsData } = await supabase.rpc('get_search_trends', {
                p_days: days
            })
            setTrends(trendsData || [])
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setLoading(false)
        }
    }, [days, supabase])

    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    // Calculate summary stats
    const totalSearches = trends.reduce((acc, t) => acc + t.search_count, 0)
    const avgClickRate = topSearches.length > 0
        ? topSearches.reduce((acc, t) => acc + (t.click_rate || 0), 0) / topSearches.length
        : 0
    const zeroResultTotal = zeroResultSearches.reduce((acc, z) => acc + z.search_count, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text dark:text-dark-text">{t('title')}</h1>
                    <p className="text-text-light dark:text-dark-text-muted">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select
                        value={days.toString()}
                        onValueChange={(value) => setDays(Number(value))}
                    >
                        <SelectTrigger className="w-[160px] bg-white dark:bg-dark-surface">
                            <SelectValue placeholder={t('last7Days')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">{t('last7Days')}</SelectItem>
                            <SelectItem value="14">{t('last14Days')}</SelectItem>
                            <SelectItem value="30">{t('last30Days')}</SelectItem>
                            <SelectItem value="90">{t('last90Days')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : tCommon('refresh')}
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-light dark:text-dark-text-muted">{t('totalSearches')}</p>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">
                                {totalSearches.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-light dark:text-dark-text-muted">{t('avgClickRate')}</p>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">
                                {avgClickRate.toFixed(1)}%
                            </p>
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <MousePointerClick className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-text-light dark:text-dark-text-muted">{t('zeroResults')}</p>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">
                                {zeroResultTotal.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-dark-border pb-2">
                <Button
                    variant={activeTab === 'top' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('top')}
                    className="gap-2"
                >
                    <TrendingUp className="w-4 h-4" />
                    {t('topSearches')}
                </Button>
                <Button
                    variant={activeTab === 'gaps' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('gaps')}
                    className="gap-2"
                >
                    <AlertCircle className="w-4 h-4" />
                    {t('contentGaps')}
                </Button>
                <Button
                    variant={activeTab === 'trends' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('trends')}
                    className="gap-2"
                >
                    <BarChart3 className="w-4 h-4" />
                    {t('trends')}
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {/* Top Searches */}
                    {activeTab === 'top' && (
                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                            <div className="p-6 border-b border-gray-100 dark:border-dark-border">
                                <h3 className="text-lg font-semibold text-text dark:text-dark-text">{t('topSearchTerms')}</h3>
                                <p className="text-sm text-text-light dark:text-dark-text-muted">{t('topSearchTermsDesc')}</p>
                            </div>
                            <div className="p-6">
                                {topSearches.length === 0 ? (
                                    <p className="text-center text-text-light dark:text-dark-text-muted py-8">
                                        {t('noData')}
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {topSearches.map((search, index) => (
                                            <div
                                                key={search.query_normalized}
                                                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark-border"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-text dark:text-dark-text">
                                                            {search.query_normalized}
                                                        </p>
                                                        <p className="text-xs text-text-light dark:text-dark-text-muted">
                                                            {search.search_count} {t('searches')} · {search.avg_results} {t('avgResults')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-sm font-medium ${search.click_rate > 20 ? 'text-green-600' :
                                                        search.click_rate > 5 ? 'text-yellow-600' : 'text-red-500'
                                                        }`}>
                                                        {search.click_rate}% {t('ctr')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Content Gaps */}
                    {activeTab === 'gaps' && (
                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                            <div className="p-6 border-b border-gray-100 dark:border-dark-border">
                                <h3 className="text-lg font-semibold text-text dark:text-dark-text">{t('contentGaps')}</h3>
                                <p className="text-sm text-text-light dark:text-dark-text-muted">
                                    {t('contentGapsDesc')}
                                </p>
                            </div>
                            <div className="p-6">
                                {zeroResultSearches.length === 0 ? (
                                    <p className="text-center text-text-light dark:text-dark-text-muted py-8">
                                        {t('noGaps')}
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {zeroResultSearches.map((search) => (
                                            <div
                                                key={search.query_normalized}
                                                className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                                    <div>
                                                        <p className="font-medium text-text dark:text-dark-text">
                                                            &quot;{search.query_normalized}&quot;
                                                        </p>
                                                        <p className="text-xs text-text-light dark:text-dark-text-muted">
                                                            {search.search_count} {t('searches')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-text-light dark:text-dark-text-muted">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(search.last_searched), { addSuffix: true })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Trends */}
                    {activeTab === 'trends' && (
                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                            <div className="p-6 border-b border-gray-100 dark:border-dark-border">
                                <h3 className="text-lg font-semibold text-text dark:text-dark-text">{t('trends')}</h3>
                                <p className="text-sm text-text-light dark:text-dark-text-muted">{t('trendsDesc')}</p>
                            </div>
                            <div className="p-6">
                                {trends.length === 0 ? (
                                    <p className="text-center text-text-light dark:text-dark-text-muted py-8">
                                        {t('noTrends')}
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {/* Simple bar chart representation */}
                                        <div className="flex items-end gap-1 h-40">
                                            {trends.map((trend) => {
                                                const maxCount = Math.max(...trends.map(t => t.search_count))
                                                const height = maxCount > 0 ? (trend.search_count / maxCount) * 100 : 0
                                                return (
                                                    <div
                                                        key={trend.search_date}
                                                        className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t"
                                                        style={{ height: `${Math.max(height, 4)}%` }}
                                                        title={`${trend.search_date}: ${trend.search_count} ${t('searches')}`}
                                                    />
                                                )
                                            })}
                                        </div>
                                        {/* Stats table */}
                                        <div className="mt-6 overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-200 dark:border-dark-border">
                                                        <th className="text-left py-2 px-2 text-text-light dark:text-dark-text-muted">{tCommon('date')}</th>
                                                        <th className="text-right py-2 px-2 text-text-light dark:text-dark-text-muted">{t('searches')}</th>
                                                        <th className="text-right py-2 px-2 text-text-light dark:text-dark-text-muted">{t('unique')}</th>
                                                        <th className="text-right py-2 px-2 text-text-light dark:text-dark-text-muted">{t('avgResults')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {trends.slice(-10).map((trend) => (
                                                        <tr key={trend.search_date} className="border-b border-gray-100 dark:border-dark-border">
                                                            <td className="py-2 px-2 text-text dark:text-dark-text">{trend.search_date}</td>
                                                            <td className="text-right py-2 px-2 text-text dark:text-dark-text">{trend.search_count}</td>
                                                            <td className="text-right py-2 px-2 text-text dark:text-dark-text">{trend.unique_queries}</td>
                                                            <td className="text-right py-2 px-2 text-text dark:text-dark-text">{trend.avg_results}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
