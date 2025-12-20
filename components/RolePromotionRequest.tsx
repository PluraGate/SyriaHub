'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, Clock, CheckCircle, XCircle, Send, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface PromotionRequest {
    id: string
    requested_role: string
    reason: string
    status: 'pending' | 'approved' | 'rejected'
    admin_notes: string | null
    created_at: string
    reviewed_at: string | null
}

interface RolePromotionRequestProps {
    userRole: string
}

export function RolePromotionRequest({ userRole }: RolePromotionRequestProps) {
    const t = useTranslations('Promotion')
    const tCommon = useTranslations('Common')
    const [requests, setRequests] = useState<PromotionRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [reason, setReason] = useState('')
    const [showForm, setShowForm] = useState(false)
    const { showToast } = useToast()
    const supabase = createClient()

    const fetchRequests = async () => {
        const { data, error } = await supabase.rpc('get_my_promotion_requests')
        if (!error && data) {
            setRequests(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reason.trim() || reason.length < 50) {
            showToast('Please provide a detailed reason (at least 50 characters)', 'error')
            return
        }

        setSubmitting(true)
        try {
            const { data, error } = await supabase.rpc('request_role_promotion', {
                p_requested_role: 'researcher',
                p_reason: reason.trim()
            })

            if (error) throw error

            if (data?.success) {
                showToast('Request submitted successfully!', 'success')
                setReason('')
                setShowForm(false)
                fetchRequests()
            } else {
                throw new Error(data?.error || 'Failed to submit request')
            }
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to submit request', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    // Only show for members
    if (userRole !== 'member') {
        return null
    }

    const pendingRequest = requests.find(r => r.status === 'pending')
    const latestRequest = requests[0]

    if (loading) {
        return (
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-dark-border rounded w-48" />
                    <div className="h-20 bg-gray-200 dark:bg-dark-border rounded" />
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-text dark:text-dark-text">{t('becomeResearcher')}</h3>
                </div>
                <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                    Researchers can create articles, ask questions, and access the Research Lab.
                </p>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Show pending request status */}
                {pendingRequest && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-800 dark:text-amber-200">{t('requestPending')}</p>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                Your request is being reviewed by the admin team. You'll be notified when there's an update.
                            </p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                Submitted {new Date(pendingRequest.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                )}

                {/* Show latest approved/rejected status */}
                {!pendingRequest && latestRequest && latestRequest.status !== 'pending' && (
                    <div className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border mb-4",
                        latestRequest.status === 'approved'
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    )}>
                        {latestRequest.status === 'approved' ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                            <p className={cn(
                                "font-medium",
                                latestRequest.status === 'approved'
                                    ? "text-green-800 dark:text-green-200"
                                    : "text-red-800 dark:text-red-200"
                            )}>
                                {latestRequest.status === 'approved' ? 'Request Approved' : 'Request Not Approved'}
                            </p>
                            {latestRequest.admin_notes && (
                                <p className={cn(
                                    "text-sm mt-1",
                                    latestRequest.status === 'approved'
                                        ? "text-green-700 dark:text-green-300"
                                        : "text-red-700 dark:text-red-300"
                                )}>
                                    {latestRequest.admin_notes}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Request Form */}
                {!pendingRequest && (
                    <>
                        {!showForm ? (
                            <Button
                                onClick={() => setShowForm(true)}
                                className="w-full gap-2"
                            >
                                <GraduationCap className="w-4 h-4" />
                                {t('requestAccess')}
                            </Button>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        Why do you want to become a researcher?
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Tell us about your background, expertise, and what you'd like to contribute to the community..."
                                        rows={4}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light dark:placeholder:text-dark-text-muted focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                        required
                                        minLength={50}
                                    />
                                    <p className="text-xs text-text-light dark:text-dark-text-muted mt-1">
                                        Minimum 50 characters ({reason.length}/50)
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1"
                                    >
                                        {tCommon('cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={submitting || reason.length < 50}
                                        className="flex-1 gap-2"
                                    >
                                        {submitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        {t('submitRequest')}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>

            {/* Info Footer */}
            <div className="p-4 bg-gray-50 dark:bg-dark-bg border-t border-gray-100 dark:border-dark-border">
                <div className="flex items-start gap-2 text-xs text-text-light dark:text-dark-text-muted">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>
                        Requests are reviewed by admins. Approval depends on your profile, activity, and stated goals.
                    </p>
                </div>
            </div>
        </div>
    )
}
