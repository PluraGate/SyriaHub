'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import {
    ArrowLeft,
    FileText,
    User,
    MessagesSquare,
    AlertTriangle,
    MessageSquareWarning,
    Calendar,
    Clock,
    Archive,
    ChevronDown,
    Send,
    Loader2,
    Shield,
    Flag,
    CheckCircle,
    XCircle,
    HelpCircle,
    ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { NewMessageForm } from './NewMessageForm'
import { useTranslations } from 'next-intl'

interface ThreadMessage {
    id: string
    author_id: string
    author_name: string | null
    author_role: string
    message_type: string
    content: string
    action_type: string | null
    action_data: any
    action_executed: boolean
    action_executed_at: string | null
    action_result: any
    decision_confidence: string | null
    review_pending: boolean
    review_pending_until: string | null
    review_completed_at: string | null
    old_state: string | null
    new_state: string | null
    version: number
    is_current_version: boolean
    created_at: string
}

interface Thread {
    id: string
    object_type: string
    object_id: string
    title: string
    description: string | null
    object_state: string
    priority: string
    trigger_event: string
    created_by: string
    created_by_name: string | null
    archived_at: string | null
    archive_reason: string | null
    created_at: string
    updated_at: string
}

interface ThreadViewProps {
    threadId: string
    isAdmin: boolean
    onBack: () => void
}

const messageTypeConfig: Record<string, { icon: typeof FileText; color: string; labelKey: string }> = {
    NOTE: { icon: FileText, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', labelKey: 'messageTypes.note' },
    FLAG: { icon: Flag, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', labelKey: 'messageTypes.flag' },
    DECISION: { icon: CheckCircle, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', labelKey: 'messageTypes.decision' },
    RATIONALE: { icon: HelpCircle, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', labelKey: 'messageTypes.rationale' },
    REQUEST_REVIEW: { icon: ArrowUpRight, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', labelKey: 'messageTypes.request_review' }
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

const confidenceColors: Record<string, string> = {
    confident: 'text-green-600 dark:text-green-400',
    provisional: 'text-yellow-600 dark:text-yellow-400',
    contested: 'text-red-600 dark:text-red-400'
}

export function ThreadView({ threadId, isAdmin, onBack }: ThreadViewProps) {
    const [thread, setThread] = useState<Thread | null>(null)
    const [messages, setMessages] = useState<ThreadMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [archiving, setArchiving] = useState(false)
    const [showArchiveDialog, setShowArchiveDialog] = useState(false)
    const [archiveReason, setArchiveReason] = useState('')

    const supabase = useMemo(() => createClient(), [])
    const { showToast } = useToast()
    const t = useTranslations('Coordination')

    const loadThread = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/coordination/${threadId}`)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || t('loadError'))
            }

            setThread(data.thread)
            setMessages(data.messages || [])
        } catch (error: any) {
            showToast(error.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadThread()
    }, [threadId])

    const handleArchive = async () => {
        if (!isAdmin) return

        setArchiving(true)
        try {
            const response = await fetch(`/api/coordination/${threadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'archive', reason: archiveReason })
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || t('loadError'))
            }

            showToast(t('archiveSuccess'), 'success')
            onBack()
        } catch (error: any) {
            showToast(error.message, 'error')
        } finally {
            setArchiving(false)
            setShowArchiveDialog(false)
        }
    }

    const handleMessageAdded = () => {
        loadThread()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        )
    }

    if (!thread) {
        return (
            <div className="text-center py-12">
                <p className="text-text-light dark:text-dark-text-muted">{t('threadNotFound')}</p>
                <Button variant="ghost" onClick={onBack} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('backToThreads')}
                </Button>
            </div>
        )
    }

    const ObjectIcon = objectTypeIcons[thread.object_type] || FileText

    const getStateLabel = (state: string) => {
        switch (state) {
            case 'UNDER_REVIEW': return t('underReview')
            case 'CONTESTED': return t('contested')
            case 'REVOKED': return t('revoked')
            case 'ACTIVE': return t('active')
            case 'ARCHIVED': return t('archived')
            default: return state.replace('_', ' ')
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 -ml-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('backToThreads')}
                    </Button>
                    <div className="flex items-center gap-2 mb-2">
                        <ObjectIcon className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', stateColors[thread.object_state])}>
                            {getStateLabel(thread.object_state)}
                        </span>
                        {thread.archived_at && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                <Archive className="w-3 h-3" />
                                {t('archived')}
                            </span>
                        )}
                    </div>
                    <h2 className="text-xl font-display font-semibold text-text dark:text-dark-text">
                        {thread.title}
                    </h2>
                    {thread.description && (
                        <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                            {thread.description}
                        </p>
                    )}
                    <p className="text-xs text-text-light dark:text-dark-text-muted mt-2">
                        {t('createdWithMessages', {
                            name: thread.created_by_name || t('system'),
                            count: messages.length,
                            date: format(new Date(thread.created_at), 'PPP')
                        })}
                    </p>
                </div>
                {isAdmin && !thread.archived_at && (
                    <Button variant="outline" size="sm" onClick={() => setShowArchiveDialog(true)}>
                        <Archive className="w-4 h-4 mr-2" />
                        {t('archiveThread')}
                    </Button>
                )}
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                    <h3 className="font-medium text-text dark:text-dark-text flex items-center gap-2">
                        <MessagesSquare className="w-4 h-4" />
                        {t('timeline')} {t('entries', { count: messages.length })}
                    </h3>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-dark-border">
                    {messages.map((message, index) => {
                        const config = messageTypeConfig[message.message_type] || messageTypeConfig.NOTE
                        const TypeIcon = config.icon

                        return (
                            <div key={message.id} className="p-4">
                                {/* State change indicator */}
                                {message.old_state && message.new_state && message.old_state !== message.new_state && (
                                    <div className="mb-3 flex items-center justify-center">
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 dark:bg-dark-border text-xs">
                                            <span className={cn('px-1.5 py-0.5 rounded', stateColors[message.old_state])}>
                                                {getStateLabel(message.old_state)}
                                            </span>
                                            <span className="text-text-light dark:text-dark-text-muted">→</span>
                                            <span className={cn('px-1.5 py-0.5 rounded', stateColors[message.new_state])}>
                                                {getStateLabel(message.new_state)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', config.color)}>
                                            <TypeIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-text dark:text-dark-text">
                                                {message.author_name || t('unknown')}
                                            </span>
                                            <span className={cn('px-1.5 py-0.5 rounded text-xs', config.color)}>
                                                {t(config.labelKey as any)}
                                            </span>
                                            {message.decision_confidence && (
                                                <span className={cn('text-xs font-medium', confidenceColors[message.decision_confidence])}>
                                                    ({t(`confidences.${message.decision_confidence}` as any)})
                                                </span>
                                            )}
                                            {message.review_pending && (
                                                <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                                                    ⏳ {t('reviewPending')}
                                                </span>
                                            )}
                                            <span className="text-xs text-text-light dark:text-dark-text-muted">
                                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-text dark:text-dark-text whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                        {message.action_type && (
                                            <div className="mt-2 p-2 rounded bg-gray-50 dark:bg-dark-border text-sm">
                                                <span className="font-medium text-text dark:text-dark-text">
                                                    {t('action')}: {message.action_type.replace(/_/g, ' ')}
                                                </span>
                                                {message.action_executed && (
                                                    <span className="ml-2 text-green-600 dark:text-green-400">✓ {t('executed')}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* New Message Form */}
                {!thread.archived_at && (
                    <div className="border-t border-gray-100 dark:border-dark-border">
                        <NewMessageForm
                            threadId={threadId}
                            isAdmin={isAdmin}
                            currentState={thread.object_state}
                            onSuccess={handleMessageAdded}
                        />
                    </div>
                )}
            </div>

            {/* Archive Dialog */}
            {showArchiveDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-dark-surface rounded-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">
                            {t('archiveThread')}
                        </h3>
                        <p className="text-sm text-text-light dark:text-dark-text-muted mb-4">
                            {t('archiveDescription')}
                        </p>
                        <textarea
                            placeholder={t('archiveReasonPlaceholder')}
                            value={archiveReason}
                            onChange={(e) => setArchiveReason(e.target.value)}
                            className="w-full p-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text mb-4 resize-none outline-none focus:ring-2 focus:ring-primary/20"
                            rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" onClick={() => setShowArchiveDialog(false)}>
                                {t('Common.cancel' as any)}
                            </Button>
                            <Button onClick={handleArchive} disabled={archiving}>
                                {archiving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {t('archiveThread')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
