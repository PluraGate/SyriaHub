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

interface NewMessageFormProps {
    threadId: string
    isAdmin: boolean
    currentState: string
    onSuccess: () => void
}

const messageTypes = [
    { value: 'NOTE', label: 'Note', icon: FileText, description: 'Internal commentary' },
    { value: 'FLAG', label: 'Flag', icon: Flag, description: 'Raise a concern' },
    { value: 'DECISION', label: 'Decision', icon: CheckCircle, description: 'Record an action' },
    { value: 'RATIONALE', label: 'Rationale', icon: HelpCircle, description: 'Justify a decision' },
    { value: 'REQUEST_REVIEW', label: 'Request Review', icon: ArrowUpRight, description: 'Escalate or handover' }
]

const actionTypes = [
    { value: '', label: 'No action' },
    { value: 'revoke_content', label: 'Revoke Content' },
    { value: 'reinstate_content', label: 'Reinstate Content' },
    { value: 'suspend_user', label: 'Suspend User', adminOnly: true },
    { value: 'reinstate_user', label: 'Reinstate User', adminOnly: true },
    { value: 'lock_object', label: 'Lock Object' },
    { value: 'unlock_object', label: 'Unlock Object' },
    { value: 'change_state', label: 'Change State' },
    { value: 'escalate', label: 'Escalate' },
    { value: 'close_thread', label: 'Close Thread' }
]

const confidenceLevels = [
    { value: '', label: 'Not specified' },
    { value: 'confident', label: 'Confident - Clear-cut decision' },
    { value: 'provisional', label: 'Provisional - May be revisited' },
    { value: 'contested', label: 'Contested - Disagreement exists' }
]

const stateOptions = [
    { value: '', label: 'No change' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'CONTESTED', label: 'Contested' },
    { value: 'REVOKED', label: 'Revoked' }
]

export function NewMessageForm({ threadId, isAdmin, currentState, onSuccess }: NewMessageFormProps) {
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
            showToast('Content is required', 'error')
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
                throw new Error(data.error || 'Failed to add message')
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
            showToast('Message added successfully', 'success')
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
                            {type.label}
                        </button>
                    )
                })}
            </div>

            {/* Content */}
            <textarea
                placeholder={selectedType?.description || 'Enter your message...'}
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
                {expanded ? 'Hide options' : 'Show options (action, state change, confidence)'}
            </button>

            {/* Advanced Options */}
            {expanded && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-dark-border/30 rounded-lg">
                    {/* Action Type */}
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                            Action (optional)
                        </label>
                        <select
                            value={actionType}
                            onChange={(e) => setActionType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text"
                        >
                            {actionTypes
                                .filter(a => isAdmin || !a.adminOnly)
                                .map(action => (
                                    <option key={action.value} value={action.value}>
                                        {action.label}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    {/* State Change */}
                    <div>
                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                            Change State To (optional)
                        </label>
                        <select
                            value={newState}
                            onChange={(e) => setNewState(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text"
                        >
                            {stateOptions.map(state => (
                                <option
                                    key={state.value}
                                    value={state.value}
                                    disabled={state.value === currentState}
                                >
                                    {state.label} {state.value === currentState ? '(current)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Decision Confidence (only for DECISION type) */}
                    {messageType === 'DECISION' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                                    Decision Confidence
                                </label>
                                <select
                                    value={decisionConfidence}
                                    onChange={(e) => setDecisionConfidence(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text"
                                >
                                    {confidenceLevels.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
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
                                        Mark as pending review (cooling-off period)
                                    </span>
                                </label>
                                {reviewPending && (
                                    <div className="ml-6">
                                        <label className="block text-sm text-text-light dark:text-dark-text-muted mb-1">
                                            Review window (hours)
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
                    Add {selectedType?.label || 'Message'}
                </Button>
            </div>
        </form>
    )
}
