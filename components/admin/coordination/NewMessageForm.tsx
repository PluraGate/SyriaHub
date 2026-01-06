'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/toast'
import {
    Send,
    Loader2,
    FileText,
    Flag,
    CheckCircle,
    HelpCircle,
    ArrowUpRight,
    ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface NewMessageFormProps {
    threadId: string
    isAdmin: boolean
    currentState: string
    onSuccess: () => void
}

const messageTypes = [
    { value: 'NOTE', labelKey: 'messageTypes.note', icon: FileText, descriptionKey: 'messageDescriptions.NOTE' },
    { value: 'FLAG', labelKey: 'messageTypes.flag', icon: Flag, descriptionKey: 'messageDescriptions.FLAG' },
    { value: 'DECISION', labelKey: 'messageTypes.decision', icon: CheckCircle, descriptionKey: 'messageDescriptions.DECISION' },
    { value: 'RATIONALE', labelKey: 'messageTypes.rationale', icon: HelpCircle, descriptionKey: 'messageDescriptions.RATIONALE' },
    { value: 'REQUEST_REVIEW', labelKey: 'messageTypes.request_review', icon: ArrowUpRight, descriptionKey: 'messageDescriptions.REQUEST_REVIEW' }
]

const actionTypes = [
    { value: '', labelKey: 'actions.noAction' },
    { value: 'revoke_content', labelKey: 'actions.revoke_content' },
    { value: 'reinstate_content', labelKey: 'actions.reinstate_content' },
    { value: 'suspend_user', labelKey: 'actions.suspend_user', adminOnly: true },
    { value: 'reinstate_user', labelKey: 'actions.reinstate_user', adminOnly: true },
    { value: 'lock_object', labelKey: 'actions.lock_object' },
    { value: 'unlock_object', labelKey: 'actions.unlock_object' },
    { value: 'change_state', labelKey: 'actions.change_state' },
    { value: 'escalate', labelKey: 'actions.escalate' },
    { value: 'close_thread', labelKey: 'actions.close_thread' }
]

const confidenceLevels = [
    { value: '', labelKey: 'confidencesDesc.notSpecified' },
    { value: 'confident', labelKey: 'confidencesDesc.confident' },
    { value: 'provisional', labelKey: 'confidencesDesc.provisional' },
    { value: 'contested', labelKey: 'confidencesDesc.contested' }
]

const stateOptions = [
    { value: '', labelKey: 'states.noChange' },
    { value: 'ACTIVE', labelKey: 'states.ACTIVE' },
    { value: 'UNDER_REVIEW', labelKey: 'states.UNDER_REVIEW' },
    { value: 'CONTESTED', labelKey: 'states.CONTESTED' },
    { value: 'REVOKED', labelKey: 'states.REVOKED' }
]

export function NewMessageForm({ threadId, isAdmin, currentState, onSuccess }: NewMessageFormProps) {
    const t = useTranslations('Coordination')
    const [messageType, setMessageType] = useState('NOTE')
    const [content, setContent] = useState('')
    const [actionType, setActionType] = useState('')
    const [newState, setNewState] = useState('')
    const [decisionConfidence, setDecisionConfidence] = useState('')
    const [reviewPending, setReviewPending] = useState(false)
    const [reviewPendingHours, setReviewPendingHours] = useState<number | undefined>()
    const [submitting, setSubmitting] = useState(false)
    const [expanded, setExpanded] = useState(false)

    const { showToast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!content.trim()) {
            showToast(t('form.contentRequired'), 'error')
            return
        }

        setSubmitting(true)
        try {
            const response = await fetch(`/api/coordination/${threadId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messageType,
                    content: content.trim(),
                    actionType: actionType || undefined,
                    newState: newState || undefined,
                    decisionConfidence: decisionConfidence || undefined,
                    reviewPending,
                    reviewPendingHours
                })
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || t('loadError'))
            }

            // Reset form
            setContent('')
            setActionType('')
            setNewState('')
            setDecisionConfidence('')
            setReviewPending(false)
            setReviewPendingHours(undefined)
            setExpanded(false)

            onSuccess()
            showToast(t('form.messageAddedSuccess'), 'success')
        } catch (error: any) {
            showToast(error.message, 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const selectedType = messageTypes.find(t => t.value === messageType)

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Message Type Selector */}
            <div className="flex flex-wrap gap-2">
                {messageTypes.map((type) => {
                    const Icon = type.icon
                    return (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => setMessageType(type.value)}
                            className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                messageType === type.value
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-text-light dark:bg-dark-border dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border/70'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {t(type.labelKey as any)}
                        </button>
                    )
                })}
            </div>

            {/* Content */}
            <textarea
                placeholder={selectedType ? t(selectedType.descriptionKey as any) : t('form.enterMessage')}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                rows={3}
            />

            {/* Advanced Options Toggle */}
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-sm text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text"
            >
                <ChevronDown className={cn('w-4 h-4 transition-transform', expanded && 'rotate-180')} />
                {expanded ? t('form.hideOptions') : t('form.showOptions')}
            </button>

            {/* Advanced Options */}
            {expanded && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-dark-border/30 rounded-lg">
                    {/* Action Type */}
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                            {t('form.actionOptional')}
                        </label>
                        <select
                            value={actionType}
                            onChange={(e) => setActionType(e.target.value)}
                            className="select-input"
                        >
                            {actionTypes
                                .filter(a => isAdmin || !a.adminOnly)
                                .map(action => (
                                    <option key={action.value} value={action.value}>
                                        {t(action.labelKey as any)}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    {/* State Change */}
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                            {t('form.changeStateOptional')}
                        </label>
                        <select
                            value={newState}
                            onChange={(e) => setNewState(e.target.value)}
                            className="select-input"
                        >
                            {stateOptions.map(state => (
                                <option
                                    key={state.value}
                                    value={state.value}
                                    disabled={state.value === currentState}
                                >
                                    {t(state.labelKey as any)} {state.value === currentState ? t('states.current') : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Decision Confidence (only for DECISION type) */}
                    {messageType === 'DECISION' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                                    {t('form.decisionConfidence')}
                                </label>
                                <select
                                    value={decisionConfidence}
                                    onChange={(e) => setDecisionConfidence(e.target.value)}
                                    className="select-input"
                                >
                                    {confidenceLevels.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {t(level.labelKey as any)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Review Pending */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={reviewPending}
                                        onChange={(e) => setReviewPending(e.target.checked)}
                                        className="rounded border-gray-300 dark:border-dark-border"
                                    />
                                    <span className="text-sm text-text dark:text-dark-text">
                                        {t('form.markAsPending')}
                                    </span>
                                </label>
                                {reviewPending && (
                                    <div className="ml-6">
                                        <label className="block text-sm text-text-light dark:text-dark-text-muted mb-1">
                                            {t('form.reviewWindow')}
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={168}
                                            value={reviewPendingHours || ''}
                                            onChange={(e) => setReviewPendingHours(e.target.value ? parseInt(e.target.value) : undefined)}
                                            placeholder="e.g., 24"
                                            className="w-32 px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text"
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
                <Button type="submit" disabled={submitting || !content.trim()}>
                    {submitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4 mr-2" />
                    )}
                    {t('form.addMessage', { type: selectedType ? t(selectedType.labelKey as any) : t('types.post') })}
                </Button>
            </div>
        </form>
    )
}
