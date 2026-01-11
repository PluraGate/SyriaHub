'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Send, Loader2, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface RejectionBannerProps {
    postId: string
    postTitle: string
    rejectionReason: string | null
    approvalStatus: string
    isAuthor: boolean
    contentType?: 'post' | 'article' | 'question' | 'event'
}

interface Appeal {
    id: string
    status: 'pending' | 'approved' | 'rejected' | 'revision_requested'
    dispute_reason: string
    admin_response: string | null
    created_at: string
}

export function RejectionBanner({
    postId,
    postTitle,
    rejectionReason,
    approvalStatus,
    isAuthor,
    contentType = 'post'
}: RejectionBannerProps) {
    const [appealDialogOpen, setAppealDialogOpen] = useState(false)
    const [appealReason, setAppealReason] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [existingAppeal, setExistingAppeal] = useState<Appeal | null>(null)
    const [appealCount, setAppealCount] = useState(0)
    const [loading, setLoading] = useState(true)

    const MAX_APPEALS = 3
    const supabase = createClient()
    const { showToast } = useToast()

    // Fetch existing appeal and count on mount
    useEffect(() => {
        // Only fetch if this should render
        if (approvalStatus !== 'rejected' || !isAuthor) return

        const fetchAppealData = async () => {
            // Get most recent appeal
            const { data, error } = await supabase
                .from('moderation_appeals')
                .select('id, status, dispute_reason, admin_response, created_at')
                .eq('post_id', postId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()


            setExistingAppeal(data)

            // Get total appeal count for this post
            const { count } = await supabase
                .from('moderation_appeals')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', postId)

            setAppealCount(count || 0)
            setLoading(false)
        }
        fetchAppealData()
    }, [postId, supabase, approvalStatus, isAuthor])

    // Only render for rejected posts and for the author
    if (approvalStatus !== 'rejected' || !isAuthor) {
        return null
    }

    const handleSubmitAppeal = async () => {
        if (appealCount >= MAX_APPEALS) {
            showToast('You have reached the maximum number of appeals for this content.', 'error')
            return
        }

        if (!appealReason.trim()) {
            showToast('Please provide a reason for your appeal.', 'error')
            return
        }

        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase
                .from('moderation_appeals')
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    dispute_reason: appealReason.trim()
                })

            if (error) {
                console.error('Appeal insert error:', error.message, error.code, error.details)
                throw new Error(error.message || 'Failed to insert appeal')
            }

            showToast('Your appeal has been submitted. You will be notified when it\'s reviewed.', 'success')
            setAppealDialogOpen(false)
            setAppealReason('')

            // Refresh appeal status
            const { data } = await supabase
                .from('moderation_appeals')
                .select('id, status, dispute_reason, admin_response, created_at')
                .eq('post_id', postId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
            setExistingAppeal(data)
        } catch (error: any) {
            console.error('Error submitting appeal:', error.message || error)
            showToast(error.message || 'Failed to submit appeal. Please try again.', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const getAppealStatusBadge = (status: string) => {
        const badges = {
            pending: { icon: Clock, className: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', label: 'Under Review' },
            approved: { icon: CheckCircle, className: 'text-green-600 bg-green-100 dark:bg-green-900/30', label: 'Approved' },
            rejected: { icon: AlertTriangle, className: 'text-red-600 bg-red-100 dark:bg-red-900/30', label: 'Denied' },
            revision_requested: { icon: AlertTriangle, className: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', label: 'Changes Required' }
        }
        const badge = badges[status as keyof typeof badges] || badges.pending
        const Icon = badge.icon
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
                <Icon className="w-4 h-4" />
                {badge.label}
            </span>
        )
    }

    return (
        <>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-1">
                            This post has been rejected
                        </h3>
                        {rejectionReason && (
                            <p className="text-red-700 dark:text-red-300 mb-4">
                                <strong>Reason:</strong> {rejectionReason}
                            </p>
                        )}

                        {/* Appeal Status */}
                        {loading ? (
                            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Checking appeal status...
                            </div>
                        ) : existingAppeal && existingAppeal.status !== 'approved' ? (
                            // Show appeal status only if pending or rejected (not approved, as that's from a previous cycle)
                            <div className="bg-white dark:bg-dark-surface border border-red-200 dark:border-dark-border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-text dark:text-dark-text">Appeal Status</span>
                                    {getAppealStatusBadge(existingAppeal.status)}
                                </div>
                                <p className="text-sm text-text-light dark:text-dark-text-muted">
                                    <strong>Your appeal:</strong> {existingAppeal.dispute_reason}
                                </p>
                                {existingAppeal.admin_response && (
                                    <p className="text-sm text-text-light dark:text-dark-text-muted border-t border-gray-100 dark:border-dark-border pt-3">
                                        <strong>Admin response:</strong> {existingAppeal.admin_response}
                                    </p>
                                )}
                                {existingAppeal.status === 'rejected' && (
                                    appealCount >= MAX_APPEALS ? (
                                        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                            You have used all {MAX_APPEALS} appeals for this content.
                                        </p>
                                    ) : (
                                        <div className="flex items-center gap-3 mt-2">
                                            <Button
                                                onClick={() => setAppealDialogOpen(true)}
                                                variant="outline"
                                                size="sm"
                                                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                                            >
                                                <Send className="w-4 h-4 mr-2" />
                                                Submit New Appeal
                                            </Button>
                                            <span className="text-xs text-text-light dark:text-dark-text-muted">
                                                {MAX_APPEALS - appealCount} appeal{MAX_APPEALS - appealCount !== 1 ? 's' : ''} remaining
                                            </span>
                                        </div>
                                    )
                                )}
                                {existingAppeal.status === 'revision_requested' && (
                                    <div className="flex items-center gap-3 mt-2">
                                        <a
                                            href={contentType === 'event' ? `/events/${postId}/edit` : `/editor?edit=${postId}`}
                                            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                        >
                                            Edit {contentType === 'event' ? 'Event' : 'Post'}
                                        </a>
                                        <span className="text-xs text-text-light dark:text-dark-text-muted">
                                            Make the requested changes and resubmit
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // No relevant appeal (new rejection or previous appeal was approved before re-rejection)
                            appealCount >= MAX_APPEALS ? (
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    You have used all {MAX_APPEALS} appeals for this content.
                                </p>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={() => setAppealDialogOpen(true)}
                                        variant="outline"
                                        className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Submit an Appeal
                                    </Button>
                                    <span className="text-xs text-text-light dark:text-dark-text-muted">
                                        {MAX_APPEALS - appealCount} appeal{MAX_APPEALS - appealCount !== 1 ? 's' : ''} remaining
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Appeal Dialog */}
            <Dialog open={appealDialogOpen} onOpenChange={setAppealDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Appeal Rejection</DialogTitle>
                        <DialogDescription>
                            Explain why you believe &quot;{postTitle}&quot; should not have been rejected.
                            Your appeal will be reviewed by our moderation team.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {rejectionReason && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    <strong>Rejection reason:</strong> {rejectionReason}
                                </p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="appeal-reason" className="text-text dark:text-dark-text font-medium">
                                Your Appeal <span className="text-red-500">*</span>
                            </Label>
                            <textarea
                                id="appeal-reason"
                                value={appealReason}
                                onChange={(e) => setAppealReason(e.target.value)}
                                placeholder="Explain why this rejection should be reconsidered..."
                                rows={5}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light dark:placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                            <p className="text-xs text-text-light dark:text-dark-text-muted">
                                Be specific and respectful. Provide any context that supports your case.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setAppealDialogOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitAppeal}
                            disabled={submitting || !appealReason.trim()}
                        >
                            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                            Submit Appeal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
