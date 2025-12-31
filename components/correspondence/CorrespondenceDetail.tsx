'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Calendar, User, Archive, Mail, MailOpen, Reply, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CorrespondenceForm } from './CorrespondenceForm'
import { useToast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import type { Correspondence, CorrespondenceThread } from '@/types'
import { cn } from '@/lib/utils'
import { Link } from '@/navigation'

interface CorrespondenceDetailProps {
    correspondenceId: string
    locale: string
    currentUserId: string
}

export function CorrespondenceDetail({ correspondenceId, locale, currentUserId }: CorrespondenceDetailProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const t = useTranslations('Correspondence')

    const [thread, setThread] = useState<Correspondence[]>([])
    const [loading, setLoading] = useState(true)
    const [showReplyForm, setShowReplyForm] = useState(false)
    const [archiving, setArchiving] = useState(false)

    const fetchThread = async () => {
        try {
            const response = await fetch(`/api/correspondence/${correspondenceId}`)
            const data: CorrespondenceThread = await response.json()

            if (data.success && data.thread) {
                setThread(data.thread)

                // Mark as read if recipient and undelivered
                const rootMessage = data.thread[0]
                if (rootMessage && rootMessage.recipient_id === currentUserId && rootMessage.status === 'delivered') {
                    await fetch(`/api/correspondence/${rootMessage.id}/read`, { method: 'POST' })
                }
            } else {
                showToast(data.error || 'Failed to load correspondence', 'error')
            }
        } catch (error) {
            console.error('Error fetching correspondence:', error)
            showToast('Failed to load correspondence', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchThread()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [correspondenceId])

    const handleArchive = async () => {
        setArchiving(true)
        try {
            const response = await fetch(`/api/correspondence/${correspondenceId}/archive`, { method: 'POST' })
            const result = await response.json()

            if (result.success) {
                showToast(t('archived'), 'success')
                router.push(`/${locale}/correspondence`)
            } else {
                showToast(result.error || 'Failed to archive', 'error')
            }
        } catch (error) {
            showToast('Failed to archive', 'error')
        } finally {
            setArchiving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (thread.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-text-light dark:text-dark-text-muted">Correspondence not found</p>
            </div>
        )
    }

    const root = thread[0]
    const reply = thread.length > 1 ? thread[1] : null
    const canReply = root.can_reply && currentUserId === root.recipient_id && !reply

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link
                    href="/correspondence"
                    className="inline-flex items-center gap-2 text-text-light dark:text-dark-text-muted hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                    Back to Correspondence
                </Link>

                <div className="flex items-center gap-2">
                    {root.recipient_id === currentUserId && root.status !== 'archived' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleArchive}
                            disabled={archiving}
                            className="gap-2"
                        >
                            {archiving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
                            {t('archive')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Context Card */}
            {root.post_detail && (
                <Link
                    href={`/post/${root.post_id}`}
                    className="flex items-center gap-3 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl hover:border-primary/40 transition-colors"
                >
                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                        <p className="text-xs font-medium text-primary uppercase tracking-wide">
                            {t('regardingPost', { title: '' })}
                        </p>
                        <p className="text-sm text-text dark:text-dark-text">
                            {root.post_detail.title}
                        </p>
                    </div>
                </Link>
            )}

            {/* Messages */}
            <div className="space-y-6">
                {thread.map((message, index) => {
                    const isSender = message.sender_id === currentUserId
                    const person = isSender ? message.recipient : message.sender

                    return (
                        <article
                            key={message.id}
                            className={cn(
                                'bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden',
                                index > 0 && 'ml-8'
                            )}
                        >
                            {/* Message Header */}
                            <header className="flex items-start gap-4 p-5 border-b border-gray-100 dark:border-dark-border">
                                <Avatar className="w-12 h-12 flex-shrink-0">
                                    <AvatarImage src={message.sender?.avatar_url} alt={message.sender?.name} />
                                    <AvatarFallback className="bg-primary text-white text-lg">
                                        {message.sender?.name?.[0]?.toUpperCase() || '?'}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-text dark:text-dark-text">
                                            {message.sender?.name}
                                        </span>
                                        {message.sender?.affiliation && (
                                            <span className="text-xs text-text-light dark:text-dark-text-muted">
                                                · {message.sender.affiliation}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-text-light dark:text-dark-text-muted">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(message.created_at), 'PPP')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            To: {message.recipient?.name}
                                        </span>
                                        {message.status === 'read' && (
                                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                <MailOpen className="w-3 h-3" />
                                                Read
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Kind badge */}
                                <span className={cn(
                                    'px-2.5 py-1 text-xs font-medium rounded-full',
                                    message.kind === 'clarification_request' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                                    message.kind === 'moderation_notice' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
                                    message.kind === 'response' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                )}>
                                    {message.kind === 'response' ? 'Reply' : message.kind.replace('_', ' ')}
                                </span>
                            </header>

                            {/* Message Content */}
                            <div className="p-5">
                                <h2 className="text-lg font-semibold text-text dark:text-dark-text mb-4">
                                    {message.subject}
                                </h2>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <p className="whitespace-pre-wrap text-text dark:text-dark-text leading-relaxed">
                                        {message.body}
                                    </p>
                                </div>
                            </div>
                        </article>
                    )
                })}
            </div>

            {/* Reply Section */}
            {canReply && !showReplyForm && (
                <div className="flex justify-center">
                    <Button
                        onClick={() => setShowReplyForm(true)}
                        className="gap-2"
                    >
                        <Reply className="w-4 h-4" />
                        {t('reply')}
                    </Button>
                </div>
            )}

            {showReplyForm && (
                <div className="ml-8 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4">
                        {t('reply')}
                    </h3>
                    <CorrespondenceForm
                        recipientId={root.sender_id}
                        recipientName={root.sender?.name || 'Unknown'}
                        postId={root.post_id}
                        parentId={root.id}
                        kind="response"
                        onSuccess={() => {
                            setShowReplyForm(false)
                            fetchThread()
                        }}
                    />
                </div>
            )}

            {/* Already replied notice */}
            {reply && root.recipient_id === currentUserId && (
                <div className="text-center py-4 text-text-light dark:text-dark-text-muted text-sm">
                    {t('alreadyReplied')}
                </div>
            )}
        </div>
    )
}
