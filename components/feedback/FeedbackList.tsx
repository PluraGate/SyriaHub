'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Bug,
    Lightbulb,
    AlertTriangle,
    Shuffle,
    HelpCircle,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Filter,
    ChevronDown,
    ExternalLink,
    MessageSquare,
    AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'

interface Ticket {
    id: string
    user_id: string
    user_name: string | null
    user_email: string | null
    category: 'bug' | 'ux' | 'section' | 'alternative' | 'other'
    title: string
    description: string
    page_url: string | null
    status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'deferred'
    priority: 'low' | 'medium' | 'high' | 'critical'
    admin_notes: string | null
    resolved_by: string | null
    resolved_by_name: string | null
    resolved_at: string | null
    created_at: string
    updated_at: string
}

interface Stats {
    total: number
    open: number
    in_progress: number
    resolved: number
    closed: number
    deferred: number
    by_category: Record<string, number>
    by_priority: Record<string, number>
}

interface FeedbackListProps {
    isAdmin?: boolean
}

const categoryIcons = {
    bug: Bug,
    ux: Lightbulb,
    section: AlertTriangle,
    alternative: Shuffle,
    other: HelpCircle,
}

const categoryColors = {
    bug: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    ux: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
    section: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
    alternative: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    other: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20',
}

const statusIcons = {
    open: Clock,
    in_progress: Loader2,
    resolved: CheckCircle2,
    closed: XCircle,
    deferred: AlertCircle,
}

const statusColors = {
    open: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    in_progress: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    resolved: 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    closed: 'text-gray-500 bg-gray-50 dark:bg-gray-700/20 border-gray-200 dark:border-gray-700',
    deferred: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
}

const priorityColors = {
    low: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
    medium: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    high: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
    critical: 'text-red-500 bg-red-100 dark:bg-red-900/30',
}

export function FeedbackList({ isAdmin = false }: FeedbackListProps) {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>('')
    const [filterCategory, setFilterCategory] = useState<string>('')
    const [showFilters, setShowFilters] = useState(false)

    // Admin update states
    const [newStatus, setNewStatus] = useState<string>('')
    const [newPriority, setNewPriority] = useState<string>('')
    const [adminNotes, setAdminNotes] = useState<string>('')
    const [isUpdating, setIsUpdating] = useState(false)

    const { showToast } = useToast()
    const t = useTranslations('Feedback')
    const supabase = useMemo(() => createClient(), [])

    const fetchTickets = useCallback(async () => {
        try {
            const { data, error } = await supabase.rpc('list_feedback_tickets', {
                p_page: 1,
                p_page_size: 100,
                p_category: filterCategory || null,
                p_status: filterStatus || null,
                p_my_tickets_only: !isAdmin
            })

            if (error) throw error
            if (data?.success) {
                setTickets(data.tickets || [])
            }
        } catch (error) {
            console.error('Failed to fetch tickets:', error)
            showToast(t('fetchError'), 'error')
        } finally {
            setLoading(false)
        }
    }, [supabase, filterCategory, filterStatus, isAdmin, showToast, t])

    const fetchStats = useCallback(async () => {
        if (!isAdmin) return

        try {
            const { data, error } = await supabase.rpc('get_feedback_ticket_stats')
            if (error) throw error
            if (data?.success) {
                setStats(data.stats)
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
    }, [supabase, isAdmin])

    useEffect(() => {
        fetchTickets()
        fetchStats()
    }, [fetchTickets, fetchStats])

    const handleUpdateTicket = async () => {
        if (!selectedTicket) return

        setIsUpdating(true)
        try {
            const { data, error } = await supabase.rpc('update_feedback_ticket_status', {
                p_ticket_id: selectedTicket.id,
                p_status: newStatus || selectedTicket.status,
                p_admin_notes: adminNotes || null,
                p_priority: newPriority || null
            })

            if (error) throw error
            if (!data?.success) throw new Error(data?.error || 'Update failed')

            showToast(t('updateSuccess'), 'success')
            setSelectedTicket(null)
            fetchTickets()
            fetchStats()
        } catch (error) {
            console.error('Failed to update ticket:', error)
            showToast(t('updateError'), 'error')
        } finally {
            setIsUpdating(false)
        }
    }

    const openTicketDetail = (ticket: Ticket) => {
        setSelectedTicket(ticket)
        setNewStatus(ticket.status)
        setNewPriority(ticket.priority)
        setAdminNotes(ticket.admin_notes || '')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats (Admin only) */}
            {isAdmin && stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {(['open', 'in_progress', 'resolved', 'closed', 'deferred'] as const).map(status => {
                        const StatusIcon = statusIcons[status]
                        return (
                            <div
                                key={status}
                                className={`p-4 rounded-xl border ${statusColors[status]}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <StatusIcon className="w-4 h-4" />
                                    <span className="text-sm font-medium capitalize">
                                        {t(`status.${status}`)}
                                    </span>
                                </div>
                                <p className="text-2xl font-bold">{stats[status]}</p>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                >
                    <Filter className="w-4 h-4" />
                    {t('filters')}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>

                {(filterStatus || filterCategory) && (
                    <button
                        onClick={() => {
                            setFilterStatus('')
                            setFilterCategory('')
                        }}
                        className="text-sm text-primary hover:underline"
                    >
                        {t('clearFilters')}
                    </button>
                )}
            </div>

            {showFilters && (
                <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-dark-surface rounded-xl">
                    <div>
                        <label className="block text-sm font-medium text-text-light dark:text-dark-text-muted mb-1">
                            {t('filterStatus')}
                        </label>
                        <Select
                            value={filterStatus}
                            onValueChange={(value) => setFilterStatus(value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('allStatuses')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value=" ">{t('allStatuses')}</SelectItem>
                                <SelectItem value="open">{t('status.open')}</SelectItem>
                                <SelectItem value="in_progress">{t('status.in_progress')}</SelectItem>
                                <SelectItem value="resolved">{t('status.resolved')}</SelectItem>
                                <SelectItem value="closed">{t('status.closed')}</SelectItem>
                                <SelectItem value="deferred">{t('status.deferred')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-light dark:text-dark-text-muted mb-1">
                            {t('filterCategory')}
                        </label>
                        <Select
                            value={filterCategory}
                            onValueChange={(value) => setFilterCategory(value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder={t('allCategories')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value=" ">{t('allCategories')}</SelectItem>
                                <SelectItem value="bug">{t('categories.bug')}</SelectItem>
                                <SelectItem value="ux">{t('categories.ux')}</SelectItem>
                                <SelectItem value="section">{t('categories.section')}</SelectItem>
                                <SelectItem value="alternative">{t('categories.alternative')}</SelectItem>
                                <SelectItem value="other">{t('categories.other')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {/* Tickets List */}
            {tickets.length === 0 ? (
                <div className="text-center py-12 text-text-light dark:text-dark-text-muted">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('noTickets')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map(ticket => {
                        const CategoryIcon = categoryIcons[ticket.category]
                        const StatusIcon = statusIcons[ticket.status]

                        return (
                            <div
                                key={ticket.id}
                                onClick={() => openTicketDetail(ticket)}
                                className="p-4 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[ticket.category]}`}>
                                                <CategoryIcon className="w-3 h-3" />
                                                {t(`categories.${ticket.category}`)}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                                                {t(`priority.${ticket.priority}`)}
                                            </span>
                                        </div>
                                        <h3 className="font-medium text-text dark:text-dark-text truncate">
                                            {ticket.title}
                                        </h3>
                                        <p className="text-sm text-text-light dark:text-dark-text-muted line-clamp-2 mt-1">
                                            {ticket.description}
                                        </p>
                                        {isAdmin && (
                                            <p className="text-xs text-text-light dark:text-dark-text-muted mt-2">
                                                {t('submittedBy')}: {ticket.user_name || ticket.user_email || t('unknown')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[ticket.status]}`}>
                                            <StatusIcon className={`w-3 h-3 ${ticket.status === 'in_progress' ? 'animate-spin' : ''}`} />
                                            {t(`status.${ticket.status}`)}
                                        </span>
                                        <span className="text-xs text-text-light dark:text-dark-text-muted">
                                            {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedTicket(null)}
                    />
                    <div className="relative bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 dark:border-dark-border">
                            <div className="flex items-center gap-2 mb-2">
                                {(() => {
                                    const CategoryIcon = categoryIcons[selectedTicket.category]
                                    return (
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[selectedTicket.category]}`}>
                                            <CategoryIcon className="w-3 h-3" />
                                            {t(`categories.${selectedTicket.category}`)}
                                        </span>
                                    )
                                })()}
                            </div>
                            <h2 className="text-xl font-display font-semibold text-text dark:text-dark-text">
                                {selectedTicket.title}
                            </h2>
                            <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                                {t('submittedBy')}: {selectedTicket.user_name || selectedTicket.user_email}
                                {' • '}
                                {formatDistanceToNow(new Date(selectedTicket.created_at), { addSuffix: true })}
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Description */}
                            <div>
                                <h3 className="text-sm font-medium text-text-light dark:text-dark-text-muted mb-2">
                                    {t('descriptionLabel')}
                                </h3>
                                <p className="text-text dark:text-dark-text whitespace-pre-wrap">
                                    {selectedTicket.description}
                                </p>
                            </div>

                            {/* Page URL */}
                            {selectedTicket.page_url && (
                                <div>
                                    <h3 className="text-sm font-medium text-text-light dark:text-dark-text-muted mb-2">
                                        {t('pageUrl')}
                                    </h3>
                                    <a
                                        href={selectedTicket.page_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-primary hover:underline"
                                    >
                                        {selectedTicket.page_url}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}

                            {/* Admin Controls */}
                            {isAdmin && (
                                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-dark-border">
                                    <h3 className="font-medium text-text dark:text-dark-text">
                                        {t('adminControls')}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-light dark:text-dark-text-muted mb-1">
                                                {t('status.label')}
                                            </label>
                                            <Select
                                                value={newStatus}
                                                onValueChange={(value) => setNewStatus(value)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={t(`status.${selectedTicket.status}`)} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="open">{t('status.open')}</SelectItem>
                                                    <SelectItem value="in_progress">{t('status.in_progress')}</SelectItem>
                                                    <SelectItem value="resolved">{t('status.resolved')}</SelectItem>
                                                    <SelectItem value="closed">{t('status.closed')}</SelectItem>
                                                    <SelectItem value="deferred">{t('status.deferred')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-light dark:text-dark-text-muted mb-1">
                                                {t('priority.label')}
                                            </label>
                                            <Select
                                                value={newPriority}
                                                onValueChange={(value) => setNewPriority(value)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={t(`priority.${selectedTicket.priority}`)} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">{t('priority.low')}</SelectItem>
                                                    <SelectItem value="medium">{t('priority.medium')}</SelectItem>
                                                    <SelectItem value="high">{t('priority.high')}</SelectItem>
                                                    <SelectItem value="critical">{t('priority.critical')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-light dark:text-dark-text-muted mb-1">
                                            {t('adminNotes')}
                                        </label>
                                        <textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text resize-none"
                                            placeholder={t('adminNotesPlaceholder')}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-dark-border flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setSelectedTicket(null)}
                            >
                                {t('close')}
                            </Button>
                            {isAdmin && (
                                <Button
                                    onClick={handleUpdateTicket}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            {t('updating')}
                                        </>
                                    ) : (
                                        t('update')
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
