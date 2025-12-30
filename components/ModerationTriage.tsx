'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
    AlertTriangle,
    Clock,
    CheckCircle2,
    XCircle,
    Filter,
    ArrowUpDown,
    Eye,
    MessageSquare,
    Flag,
    ChevronDown,
    ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { useTranslations } from 'next-intl'

type Severity = 'low' | 'medium' | 'critical'
type SortOption = 'severity' | 'time' | 'type'

interface Report {
    id: string
    post_id: string
    reason: string
    details: string | null
    status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
    severity?: Severity
    confidence_score?: number
    created_at: string
    reporter_id: string
    post?: {
        id: string
        title: string
        author_id: string
    }
    reporter?: {
        name: string
        email: string
    }
}

interface ModerationTriageProps {
    onReportAction?: (reportId: string, action: 'resolve' | 'dismiss') => void
}

/**
 * Calculate severity based on report reason and optional AI confidence score
 */
function calculateSeverity(reason: string, confidenceScore?: number): Severity {
    const criticalReasons = ['hate_speech', 'harassment', 'violence', 'illegal_content', 'spam']
    const mediumReasons = ['misinformation', 'plagiarism', 'inappropriate', 'off_topic']

    // If we have AI confidence score, use thresholds
    if (confidenceScore !== undefined) {
        if (confidenceScore >= 0.7) return 'critical'
        if (confidenceScore >= 0.4) return 'medium'
        return 'low'
    }

    // Fallback to reason-based categorization
    if (criticalReasons.includes(reason)) return 'critical'
    if (mediumReasons.includes(reason)) return 'medium'
    return 'low'
}

export function ModerationTriage({ onReportAction }: ModerationTriageProps) {
    const t = useTranslations('ModerationTriage')
    const tCommon = useTranslations('Common')
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState<SortOption>('severity')
    const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all')
    const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set())
    const [processing, setProcessing] = useState(false)
    const supabase = useMemo(() => createClient(), [])

    const severityConfig = useMemo(() => ({
        critical: {
            label: t('severity.critical'),
            color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
            dotColor: 'bg-red-500',
            sortOrder: 0
        },
        medium: {
            label: t('severity.medium'),
            color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-amber-300 border-yellow-200 dark:border-yellow-800',
            dotColor: 'bg-yellow-500',
            sortOrder: 1
        },
        low: {
            label: t('severity.low'),
            color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-emerald-300 border-green-200 dark:border-green-800',
            dotColor: 'bg-green-500',
            sortOrder: 2
        }
    }), [t])


    const fetchReports = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('reports')
                .select(`
          *,
          post:posts(id, title, author_id),
          reporter:users!reports_reporter_id_fkey(name, email)
        `)
                .in('status', ['pending', 'reviewing'])
                .order('created_at', { ascending: false })

            if (error) throw error

            // Enrich reports with calculated severity
            const enrichedReports = (data || []).map(report => ({
                ...report,
                severity: calculateSeverity(report.reason, report.confidence_score)
            }))

            setReports(enrichedReports)
        } catch (error) {
            console.error('Error fetching reports:', error)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchReports()
    }, [fetchReports])


    // Sort and filter reports
    const processedReports = useMemo(() => {
        let filtered = reports

        // Apply severity filter
        if (filterSeverity !== 'all') {
            filtered = filtered.filter(r => r.severity === filterSeverity)
        }

        // Apply sorting
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'severity':
                    return (severityConfig[a.severity || 'low'].sortOrder) -
                        (severityConfig[b.severity || 'low'].sortOrder)
                case 'time':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                case 'type':
                    return a.reason.localeCompare(b.reason)
                default:
                    return 0
            }
        })
    }, [reports, sortBy, filterSeverity, severityConfig])

    // Severity counts
    const severityCounts = useMemo(() => ({
        critical: reports.filter(r => r.severity === 'critical').length,
        medium: reports.filter(r => r.severity === 'medium').length,
        low: reports.filter(r => r.severity === 'low').length
    }), [reports])

    async function handleAction(reportId: string, action: 'resolve' | 'dismiss') {
        try {
            const newStatus = action === 'resolve' ? 'resolved' : 'dismissed'

            const { error } = await supabase
                .from('reports')
                .update({ status: newStatus })
                .eq('id', reportId)

            if (error) throw error

            setReports(prev => prev.filter(r => r.id !== reportId))
            selectedReports.delete(reportId)
            setSelectedReports(new Set(selectedReports))

            onReportAction?.(reportId, action)
        } catch (error) {
            console.error('Error updating report:', error)
        }
    }

    async function handleBulkAction(action: 'resolve' | 'dismiss') {
        if (selectedReports.size === 0) return
        setProcessing(true)

        try {
            const newStatus = action === 'resolve' ? 'resolved' : 'dismissed'

            const { error } = await supabase
                .from('reports')
                .update({ status: newStatus })
                .in('id', Array.from(selectedReports))

            if (error) throw error

            setReports(prev => prev.filter(r => !selectedReports.has(r.id)))
            setSelectedReports(new Set())
        } catch (error) {
            console.error('Error bulk updating reports:', error)
        } finally {
            setProcessing(false)
        }
    }

    function toggleSelect(reportId: string) {
        const newSelected = new Set(selectedReports)
        if (newSelected.has(reportId)) {
            newSelected.delete(reportId)
        } else {
            newSelected.add(reportId)
        }
        setSelectedReports(newSelected)
    }

    function selectAll() {
        if (selectedReports.size === processedReports.length) {
            setSelectedReports(new Set())
        } else {
            setSelectedReports(new Set(processedReports.map(r => r.id)))
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-dark-surface animate-pulse" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Severity Summary */}
            <div className="grid grid-cols-3 gap-4">
                {(['critical', 'medium', 'low'] as Severity[]).map(severity => (
                    <button
                        key={severity}
                        onClick={() => setFilterSeverity(filterSeverity === severity ? 'all' : severity)}
                        className={`p-4 rounded-xl border transition-all ${filterSeverity === severity
                            ? severityConfig[severity].color + ' ring-2 ring-offset-2 dark:ring-offset-dark-bg ring-current'
                            : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border hover:border-gray-300 text-text dark:text-gray-400'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{severityCounts[severity]}</span>
                            <div className={`w-3 h-3 rounded-full ${severityConfig[severity].dotColor}`} />
                        </div>
                        <span className="text-sm font-medium mt-1 block text-text-light dark:text-gray-300">{severityConfig[severity].label}</span>
                    </button>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-sm text-text dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="severity">{t('sortBy.severity')}</option>
                            <option value="time">{t('sortBy.time')}</option>
                            <option value="type">{t('sortBy.type')}</option>
                        </select>
                        <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
                    </div>

                    {selectedReports.size > 0 && (
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBulkAction('resolve')}
                                disabled={processing}
                                className="gap-1"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                {t('actions.resolve')} ({selectedReports.size})
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBulkAction('dismiss')}
                                disabled={processing}
                                className="gap-1"
                            >
                                <XCircle className="w-4 h-4" />
                                {t('actions.dismiss')} ({selectedReports.size})
                            </Button>
                        </div>
                    )}
                </div>

                <button
                    onClick={selectAll}
                    className="text-sm text-text-light dark:text-gray-400 hover:text-primary dark:hover:text-primary-light hover:underline"
                >
                    {selectedReports.size === processedReports.length ? t('deselectAll') : t('selectAll')}
                </button>
            </div>

            {/* Reports List */}
            {processedReports.length === 0 ? (
                <div className="text-center py-12 text-text-light dark:text-dark-text-muted">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('noReports')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {processedReports.map(report => (
                        <div
                            key={report.id}
                            className={`p-4 rounded-xl border transition-all ${selectedReports.has(report.id)
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={selectedReports.has(report.id)}
                                    onChange={() => toggleSelect(report.id)}
                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />

                                {/* Severity Indicator */}
                                <div className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${severityConfig[report.severity || 'low'].color
                                    }`}>
                                    {severityConfig[report.severity || 'low'].label}
                                    {report.confidence_score !== undefined && (
                                        <span className="ml-1 opacity-75">
                                            ({Math.round(report.confidence_score * 100)}%)
                                        </span>
                                    )}
                                </div>

                                {/* Report Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className="font-medium text-text dark:text-dark-text">
                                                {report.post?.title || tCommon('deletedPost')}
                                            </h4>
                                            <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                                                <span className="font-medium capitalize">{report.reason.replace('_', ' ')}</span>
                                                {report.details && ` — "${report.details}"`}
                                            </p>
                                        </div>
                                        <span className="text-xs text-text-light dark:text-dark-text-muted flex-shrink-0">
                                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                        </span>
                                    </div>

                                    {/* Reporter Info */}
                                    <p className="text-xs text-text-light dark:text-dark-text-muted mt-2">
                                        {t('reportedBy', { name: report.reporter?.name || report.reporter?.email?.split('@')[0] || tCommon('anonymous') })}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-3">
                                        <Link href={`/post/${report.post_id}`} target="_blank">
                                            <Button size="sm" variant="outline" className="gap-1">
                                                <Eye className="w-3.5 h-3.5" />
                                                {t('viewPost')}
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleAction(report.id, 'resolve')}
                                            className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            {t('actions.resolve')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleAction(report.id, 'dismiss')}
                                            className="gap-1 text-gray-600 hover:text-gray-700"
                                        >
                                            <XCircle className="w-3.5 h-3.5" />
                                            {t('actions.dismiss')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
