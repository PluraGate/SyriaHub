'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    History,
    Shield,
    Search,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    ArrowUp,
    ArrowDown,
    Loader2,
    User,
    Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { useTranslations } from 'next-intl'

interface AuditLogEntry {
    id: string
    user_id: string
    user_name: string | null
    user_email: string | null
    changed_by_id: string
    changed_by_name: string | null
    old_role: string
    new_role: string
    reason: string | null
    created_at: string
}

interface AuditLogsResponse {
    logs: AuditLogEntry[]
    total: number
    page: number
    page_size: number
}

export function AuditLogs() {
    const t = useTranslations('Admin.auditLogPage')
    const tCommon = useTranslations('Common')
    const tUser = useTranslations('UserManagement')

    const [logs, setLogs] = useState<AuditLogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [totalLogs, setTotalLogs] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize] = useState(50)

    const supabase = useMemo(() => createClient(), [])

    const loadLogs = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.rpc('get_audit_logs', {
                page_number: page,
                page_size: pageSize
            })

            if (error) {
                console.error('Error loading audit logs:', error)
                return
            }

            if (data.error) {
                console.error('Access denied:', data.error)
                return
            }

            const result = data as AuditLogsResponse
            setLogs(result.logs || [])
            setTotalLogs(result.total)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }, [page, pageSize, supabase])

    useEffect(() => {
        loadLogs()
    }, [page, loadLogs])


    const getRoleChangeVisual = (oldRole: string, newRole: string) => {
        const roleOrder = { researcher: 0, moderator: 1, admin: 2 }
        const isPromotion = roleOrder[newRole as keyof typeof roleOrder] > roleOrder[oldRole as keyof typeof roleOrder]

        const roleColors = {
            researcher: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
            moderator: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
            admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
        }

        // Helper to get role translation with fallback
        const getRoleLabel = (role: string) => {
            const roleKey = `roles.${role}` as any
            return tUser(roleKey) || role
        }

        return (
            <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[oldRole as keyof typeof roleColors] || roleColors.researcher}`}>
                    {getRoleLabel(oldRole)}
                </span>
                <div className={`${isPromotion ? 'text-green-500' : 'text-red-500'}`}>
                    {isPromotion ? (
                        <ArrowUp className="w-4 h-4" />
                    ) : (
                        <ArrowDown className="w-4 h-4" />
                    )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[newRole as keyof typeof roleColors] || roleColors.researcher}`}>
                    {getRoleLabel(newRole)}
                </span>
            </div>
        )
    }

    const exportLogs = () => {
        // Helper to get role translation with fallback
        const getRoleLabel = (role: string) => {
            const roleKey = `roles.${role}` as any
            return tUser(roleKey) || role
        }

        const csvContent = [
            [
                t('timestamp'),
                t('user'),
                tCommon('email'),
                t('changedBy'),
                t('oldRole'),
                t('newRole'),
                t('reason')
            ].join(','),
            ...logs.map(log => [
                format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
                log.user_name || tCommon('unknown'),
                log.user_email || tCommon('unknown'),
                log.changed_by_name || tCommon('unknown'),
                getRoleLabel(log.old_role),
                getRoleLabel(log.new_role),
                `"${(log.reason || '').replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const totalPages = Math.ceil(totalLogs / pageSize)

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg sm:text-xl font-display font-semibold text-text dark:text-dark-text flex items-center gap-2">
                        <History className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        {t('title')}
                    </h2>
                    <p className="text-xs sm:text-sm text-text-light dark:text-dark-text-muted mt-1">
                        {t('subtitle')}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={exportLogs} disabled={logs.length === 0} className="self-start sm:self-auto text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    {t('exportCsv')}
                </Button>
            </div>

            {/* Stats */}
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
                <p className="text-sm text-text-light dark:text-dark-text-muted">
                    {t('totalChanges')}: <span className="font-semibold text-text dark:text-dark-text">{totalLogs}</span>
                </p>
            </div>

            {/* Logs List */}
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-text-light dark:text-dark-text-muted">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>{t('noLogs')}</p>
                        <p className="text-sm mt-1">{t('noLogsDesc')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-dark-border">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* User affected */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-border flex items-center justify-center">
                                                <User className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-text dark:text-dark-text">
                                                    {log.user_name || tCommon('unknown')}
                                                </p>
                                                <p className="text-xs text-text-light dark:text-dark-text-muted">
                                                    {log.user_email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Role Change */}
                                        <div className="ml-0 sm:ml-10 mt-3 sm:mt-0 space-y-2">
                                            {getRoleChangeVisual(log.old_role, log.new_role)}

                                            {log.reason && (
                                                <div className="mt-2 p-2 bg-gray-50 dark:bg-dark-border/50 rounded-lg">
                                                    <p className="text-xs text-text-light dark:text-dark-text-muted mb-0.5">{t('reason')}:</p>
                                                    <p className="text-sm text-text dark:text-dark-text">{log.reason}</p>
                                                </div>
                                            )}

                                            <p className="text-xs text-text-light dark:text-dark-text-muted">
                                                {t('changedBy')}: <span className="font-medium">{log.changed_by_name || tCommon('unknown')}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Timestamp */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm text-text-light dark:text-dark-text-muted flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {format(new Date(log.created_at), 'MMM d, yyyy')}
                                        </p>
                                        <p className="text-xs text-text-light/70 dark:text-dark-text-muted/70">
                                            {format(new Date(log.created_at), 'HH:mm:ss')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-text-light dark:text-dark-text-muted">
                        {tCommon('pagination', { current: page, total: totalPages })}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            {tCommon('previous')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                        >
                            {tCommon('next')}
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
