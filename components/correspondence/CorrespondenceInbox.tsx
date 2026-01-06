'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Inbox, Send as SendIcon, Mail, MailOpen, Archive, FileText, ChevronRight, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import type { Correspondence, CorrespondenceInboxResponse, CorrespondenceStatus } from '@/types'
import { cn } from '@/lib/utils'

interface CorrespondenceInboxProps {
    locale: string
}

type TabType = 'received' | 'sent'

export function CorrespondenceInbox({ locale }: CorrespondenceInboxProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const t = useTranslations('Correspondence')

    const [activeTab, setActiveTab] = useState<TabType>('received')
    const [statusFilter, setStatusFilter] = useState<CorrespondenceStatus | null>(null)
    const [items, setItems] = useState<Correspondence[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const endpoint = activeTab === 'received'
                ? `/api/correspondence/inbox${statusFilter ? `?status=${statusFilter}` : ''}`
                : '/api/correspondence/sent'

            const response = await fetch(`${endpoint}${endpoint.includes('?') ? '&' : '?'}page=${page}`)
            const data: CorrespondenceInboxResponse = await response.json()

            if (data.success) {
                setItems(data.items || [])
                setTotalPages(data.total_pages || 1)
            } else {
                showToast(data.error || 'Failed to load correspondence', 'error')
            }
        } catch (error) {
            console.error('Error fetching correspondence:', error)
            showToast('Failed to load correspondence', 'error')
        } finally {
            setLoading(false)
        }
    }, [activeTab, statusFilter, page, showToast])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleArchive = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            const response = await fetch(`/api/correspondence/${id}/archive`, { method: 'POST' })
            const result = await response.json()

            if (result.success) {
                showToast(t('archived'), 'success')
                fetchData()
            } else {
                showToast(result.error || 'Failed to archive', 'error')
            }
        } catch (error) {
            showToast('Failed to archive', 'error')
        }
    }

    const getStatusIcon = (status: CorrespondenceStatus) => {
        switch (status) {
            case 'delivered':
                return <Mail className="w-4 h-4 text-primary" />
            case 'read':
                return <MailOpen className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
            case 'archived':
                return <Archive className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
            default:
                return <Mail className="w-4 h-4 text-amber-500" />
        }
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-border">
                <div className="flex gap-1">
                    <button
                        onClick={() => { setActiveTab('received'); setPage(1); }}
                        className={cn(
                            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                            activeTab === 'received'
                                ? 'border-primary text-primary dark:text-white'
                                : 'border-transparent text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                        )}
                    >
                        <Inbox className="w-4 h-4" />
                        {t('tabs.received')}
                    </button>
                    <button
                        onClick={() => { setActiveTab('sent'); setPage(1); }}
                        className={cn(
                            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                            activeTab === 'sent'
                                ? 'border-primary text-primary dark:text-white'
                                : 'border-transparent text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                        )}
                    >
                        <SendIcon className="w-4 h-4" />
                        {t('tabs.sent')}
                    </button>
                </div>

                <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading}>
                    <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                </Button>
            </div>

            {/* Filters (only for received) */}
            {activeTab === 'received' && (
                <div className="flex gap-2">
                    {[
                        { value: null, label: t('filters.all') },
                        { value: 'delivered' as const, label: t('filters.unread') },
                        { value: 'read' as const, label: t('filters.read') },
                        { value: 'archived' as const, label: t('filters.archived') }
                    ].map(filter => (
                        <button
                            key={filter.value || 'all'}
                            onClick={() => { setStatusFilter(filter.value); setPage(1); }}
                            className={cn(
                                'px-3 py-1.5 text-sm rounded-full border transition-colors',
                                statusFilter === filter.value
                                    ? 'bg-primary text-white border-primary'
                                    : 'border-gray-200 dark:border-dark-border text-text-light dark:text-dark-text-muted hover:border-primary/50'
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-dark-surface flex items-center justify-center">
                        <Mail className="w-8 h-8 text-text-light dark:text-dark-text-muted" />
                    </div>
                    <h3 className="text-lg font-medium text-text dark:text-dark-text mb-1">
                        {t('empty.noMessages')}
                    </h3>
                    <p className="text-text-light dark:text-dark-text-muted">
                        {t('empty.description')}
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100 dark:divide-dark-border border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
                    {items.map(item => {
                        const person = activeTab === 'received' ? item.sender : item.recipient
                        const isUnread = activeTab === 'received' && item.status === 'delivered'

                        return (
                            <div
                                key={item.id}
                                onClick={() => router.push(`/${locale}/correspondence/${item.id}`)}
                                className={cn(
                                    'flex items-start gap-4 p-4 cursor-pointer transition-colors',
                                    'hover:bg-gray-50 dark:hover:bg-dark-surface',
                                    isUnread && 'bg-primary/5 dark:bg-primary/10'
                                )}
                            >
                                {/* Avatar */}
                                <Avatar className="w-10 h-10 flex-shrink-0">
                                    <AvatarImage src={person?.avatar_url} alt={person?.name} />
                                    <AvatarFallback className="bg-primary text-white">
                                        {person?.name?.[0]?.toUpperCase() || '?'}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getStatusIcon(item.status)}
                                        <span className={cn(
                                            'font-medium truncate',
                                            isUnread ? 'text-text dark:text-dark-text' : 'text-text-light dark:text-dark-text-muted'
                                        )}>
                                            {person?.name}
                                        </span>
                                        <span className="text-xs text-text-light dark:text-dark-text-muted">
                                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                        </span>
                                    </div>

                                    <h4 className={cn(
                                        'text-sm truncate mb-1',
                                        isUnread ? 'font-semibold text-text dark:text-dark-text' : 'text-text dark:text-dark-text'
                                    )}>
                                        {item.subject}
                                    </h4>

                                    {/* Context */}
                                    {item.post_detail && (
                                        <div className="flex items-center gap-1.5 text-xs text-text-light dark:text-dark-text-muted">
                                            <FileText className="w-3 h-3" />
                                            <span className="truncate">{item.post_detail.title}</span>
                                        </div>
                                    )}

                                    {/* Reply indicator */}
                                    {item.has_reply && (
                                        <span className="inline-block mt-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                            {t('reply')}
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {activeTab === 'received' && item.status !== 'archived' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => handleArchive(item.id, e)}
                                            className="opacity-0 group-hover:opacity-100"
                                        >
                                            <Archive className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <ChevronRight className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm text-text-light dark:text-dark-text-muted">
                        {page} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}
