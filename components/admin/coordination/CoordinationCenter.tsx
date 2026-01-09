'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import {
    MessagesSquare,
    Plus,
    Filter,
    Search,
    AlertTriangle,
    FileText,
    User,
    MessageSquareWarning,
    Calendar,
    Flag,
    Shield,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Archive,
    Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format, formatDistanceToNow } from 'date-fns'
import { ThreadView } from './ThreadView'
import { NewThreadDialog } from './NewThreadDialog'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface CoordinationThread {
    id: string
    object_type: string
    object_id: string
    title: string
    object_state: string
    priority: string
    trigger_event: string
    created_by_name: string | null
    message_count: number
    last_message_at: string | null
    archived_at: string | null
    created_at: string
    updated_at: string
}

interface CoordinationCenterProps {
    isAdmin: boolean
}

const objectTypeIcons: Record<string, typeof FileText> = {
    post: FileText,
    user: User,
    comment: MessagesSquare,
    report: AlertTriangle,
    appeal: MessageSquareWarning,
    event: Calendar,
    resource: FileText
}

const stateColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    CONTESTED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    REVOKED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    ARCHIVED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}

const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    normal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
}

const triggerEventLabels: Record<string, string> = {
    manual: 'manual',
    auto_report: 'auto_report',
    auto_appeal: 'auto_appeal',
    auto_flag: 'auto_flag',
    auto_moderation: 'auto_moderation'
}

export function CoordinationCenter({ isAdmin }: CoordinationCenterProps) {
    const [threads, setThreads] = useState<CoordinationThread[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    // Filters
    const [objectTypeFilter, setObjectTypeFilter] = useState<string | null>(null)
    const [stateFilter, setStateFilter] = useState<string | null>(null)
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
    const [includeArchived, setIncludeArchived] = useState(false)

    // Selected thread
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
    const [showNewThreadDialog, setShowNewThreadDialog] = useState(false)

    const supabase = useMemo(() => createClient(), [])
    const { showToast } = useToast()
    const t = useTranslations('Coordination')
    const tCommon = useTranslations('Common')

    const loadThreads = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: '20',
                includeArchived: includeArchived.toString()
            })
            if (objectTypeFilter) params.set('objectType', objectTypeFilter)
            if (stateFilter) params.set('objectState', stateFilter)
            if (priorityFilter) params.set('priority', priorityFilter)

            const response = await fetch(`/api/coordination?${params}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || t('loadError'))
            }

            setThreads(data.threads || [])
            setTotalPages(data.total_pages || 1)
            setTotal(data.total || 0)
        } catch (error: any) {
            showToast(error.message, 'error')
        } finally {
            setLoading(false)
        }
    }, [page, objectTypeFilter, stateFilter, priorityFilter, includeArchived, showToast, t])

    useEffect(() => {
        loadThreads()
    }, [loadThreads])

    const handleThreadCreated = () => {
        setShowNewThreadDialog(false)
        loadThreads()
        showToast(t('threadCreatedSuccess'), 'success')
    }

    if (selectedThreadId) {
        return (
            <ThreadView
                threadId={selectedThreadId}
                isAdmin={isAdmin}
                onBack={() => {
                    setSelectedThreadId(null)
                    loadThreads()
                }}
            />
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-display font-semibold text-text dark:text-dark-text flex items-center gap-2">
                        <MessagesSquare className="w-5 h-5 text-primary" />
                        {t('coordinationCenter')}
                    </h2>
                    <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                        {t('description')}
                    </p>
                </div>
                <Button onClick={() => setShowNewThreadDialog(true)} className="whitespace-nowrap self-start sm:self-auto" size="sm">
                    <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">{t('newThread')}</span>
                    <span className="xs:hidden">{t('new')}</span>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
                    <p className="text-sm text-text-light dark:text-dark-text-muted">{t('totalThreads')}</p>
                    <p className="text-2xl font-bold text-text dark:text-dark-text">{total}</p>
                </div>
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
                    <p className="text-sm text-text-light dark:text-dark-text-muted">{t('underReview')}</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {threads.filter(t => t.object_state === 'UNDER_REVIEW').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
                    <p className="text-sm text-text-light dark:text-dark-text-muted">{t('urgent')}</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {threads.filter(t => t.priority === 'urgent').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
                    <p className="text-sm text-text-light dark:text-dark-text-muted">{t('contested')}</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {threads.filter(t => t.object_state === 'CONTESTED').length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                <Filter className="w-4 h-4 text-text-light dark:text-dark-text-muted" />

                <Select
                    value={objectTypeFilter || 'all'}
                    onValueChange={(value) => setObjectTypeFilter(value === 'all' ? null : value)}
                >
                    <SelectTrigger className="w-[140px] bg-white dark:bg-dark-surface">
                        <SelectValue placeholder={t('allTypes')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('allTypes')}</SelectItem>
                        <SelectItem value="post">{t('types.post')}</SelectItem>
                        <SelectItem value="user">{t('types.user')}</SelectItem>
                        <SelectItem value="comment">{t('types.comment')}</SelectItem>
                        <SelectItem value="report">{t('types.report')}</SelectItem>
                        <SelectItem value="appeal">{t('types.appeal')}</SelectItem>
                        <SelectItem value="event">{t('types.event')}</SelectItem>
                        <SelectItem value="resource">{t('types.resource')}</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={stateFilter || 'all'}
                    onValueChange={(value) => setStateFilter(value === 'all' ? null : value)}
                >
                    <SelectTrigger className="w-[140px] bg-white dark:bg-dark-surface">
                        <SelectValue placeholder={t('allStates')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('allStates')}</SelectItem>
                        <SelectItem value="ACTIVE">{t('active')}</SelectItem>
                        <SelectItem value="UNDER_REVIEW">{t('underReview')}</SelectItem>
                        <SelectItem value="CONTESTED">{t('contested')}</SelectItem>
                        <SelectItem value="REVOKED">{t('revoked')}</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={priorityFilter || 'all'}
                    onValueChange={(value) => setPriorityFilter(value === 'all' ? null : value)}
                >
                    <SelectTrigger className="w-[130px] bg-white dark:bg-dark-surface">
                        <SelectValue placeholder={t('allPriorities')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('allPriorities')}</SelectItem>
                        <SelectItem value="low">{t('low')}</SelectItem>
                        <SelectItem value="normal">{t('normal')}</SelectItem>
                        <SelectItem value="high">{t('high')}</SelectItem>
                        <SelectItem value="urgent">{t('urgent')}</SelectItem>
                    </SelectContent>
                </Select>

                <label className="flex items-center gap-2 text-sm text-text-light dark:text-dark-text-muted cursor-pointer">
                    <input
                        type="checkbox"
                        checked={includeArchived}
                        onChange={(e) => setIncludeArchived(e.target.checked)}
                        className="rounded border-gray-300 dark:border-dark-border"
                    />
                    {t('includeArchived')}
                </label>
            </div>

            {/* Threads List */}
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : threads.length === 0 ? (
                    <div className="text-center py-12 text-text-light dark:text-dark-text-muted">
                        <MessagesSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>{t('noThreads')}</p>
                        <p className="text-sm mt-1">{t('createOrFilter')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-dark-border">
                        {threads.map((thread) => {
                            const Icon = objectTypeIcons[thread.object_type] || FileText
                            return (
                                <button
                                    key={thread.id}
                                    onClick={() => setSelectedThreadId(thread.id)}
                                    className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Icon className="w-4 h-4 text-text-light dark:text-dark-text-muted flex-shrink-0" />
                                                <span className={cn(
                                                    'px-2 py-0.5 rounded-full text-xs font-medium',
                                                    stateColors[thread.object_state]
                                                )}>
                                                    {thread.object_state === 'UNDER_REVIEW' ? t('underReview') :
                                                        thread.object_state === 'CONTESTED' ? t('contested') :
                                                            thread.object_state === 'REVOKED' ? t('revoked') :
                                                                thread.object_state === 'ACTIVE' ? t('active') :
                                                                    thread.object_state}
                                                </span>
                                                <span className={cn(
                                                    'px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                                                    priorityColors[thread.priority]
                                                )}>
                                                    {t(thread.priority as any)}
                                                </span>
                                                {thread.trigger_event !== 'manual' && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                        {t(`triggers.${thread.trigger_event}` as any)}
                                                    </span>
                                                )}
                                                {thread.archived_at && (
                                                    <Archive className="w-3.5 h-3.5 text-gray-400" />
                                                )}
                                            </div>
                                            <h3 className="font-medium text-text dark:text-dark-text truncate">
                                                {thread.title}
                                            </h3>
                                            <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                                                {t('createdWithMessages', {
                                                    name: thread.created_by_name || t('system'),
                                                    count: thread.message_count
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm text-text-light dark:text-dark-text-muted flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {formatDistanceToNow(new Date(thread.updated_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
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


            {/* New Thread Dialog */}
            {showNewThreadDialog && (
                <NewThreadDialog
                    open={showNewThreadDialog}
                    onOpenChange={setShowNewThreadDialog}
                    onSuccess={handleThreadCreated}
                />
            )}
        </div>
    )
}
