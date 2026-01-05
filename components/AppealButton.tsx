'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Scale, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'


interface AppealButtonProps {
    postId: string
    postTitle?: string
    onAppealSubmitted?: () => void
}

/**
 * AppealButton allows authors of flagged posts to dispute the moderation decision.
 * Only visible when post is flagged and user is the author.
 */
export function AppealButton({ postId, postTitle, onAppealSubmitted }: AppealButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = useMemo(() => createClient(), [])
    const { showToast } = useToast()


    async function handleSubmit() {
        if (!reason.trim()) {
            setError('Please provide a reason for your appeal.')
            return
        }

        if (reason.trim().length < 20) {
            setError('Please provide a more detailed explanation (at least 20 characters).')
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                throw new Error('You must be logged in to submit an appeal.')
            }

            // Check if appeal already exists
            const { data: existingAppeal } = await supabase
                .from('moderation_appeals')
                .select(`
                    id, 
                    status,
                    deliberation:jury_deliberations(final_decision)
                `)
                .eq('post_id', postId)
                .eq('user_id', user.id)
                .single()

            if (existingAppeal) {
                if (existingAppeal.status === 'pending') {
                    throw new Error('You already have a pending appeal for this post.')
                } else if (existingAppeal.status === 'rejected') {
                    throw new Error('Your previous appeal was rejected. You cannot submit another appeal.')
                }
            }

            // Submit appeal
            const { error: insertError } = await supabase
                .from('moderation_appeals')
                .insert({
                    post_id: postId,
                    user_id: user.id,
                    dispute_reason: reason.trim()
                })

            if (insertError) throw insertError

            setSubmitted(true)
            showToast('Appeal submitted successfully!', 'success')
            onAppealSubmitted?.()

            // Close after a moment
            setTimeout(() => {
                setIsOpen(false)
                setSubmitted(false)
                setReason('')
            }, 2000)

        } catch (err: any) {
            setError(err.message || 'Failed to submit appeal. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="gap-2 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
                <Scale className="w-4 h-4" />
                Appeal Decision
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-orange-500" />
                            Appeal Content Flag
                        </DialogTitle>
                        <DialogDescription>
                            Your post {postTitle && <span className="font-medium">&quot;{postTitle}&quot;</span>} has been flagged for review.
                            If you believe this was a mistake, you can submit an appeal.
                        </DialogDescription>
                    </DialogHeader>

                    {submitted ? (
                        <div className="py-8 text-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <h3 className="font-semibold text-lg mb-2">Appeal Submitted!</h3>
                            <p className="text-sm text-text-light dark:text-dark-text-muted">
                                Our moderation team will review your appeal and respond shortly.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 py-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Why should this decision be reversed?
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => {
                                            setReason(e.target.value)
                                            setError(null)
                                        }}
                                        placeholder="Please explain why you believe your content was incorrectly flagged. Be specific and provide context..."
                                        className="w-full h-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light dark:placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        disabled={submitting}
                                    />
                                    <p className="text-xs text-text-light dark:text-dark-text-muted mt-1">
                                        {reason.length}/500 characters
                                    </p>
                                </div>

                                {error && (
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                    <h4 className="font-medium text-sm text-blue-700 dark:text-blue-400 mb-1">
                                        What happens next?
                                    </h4>
                                    <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                                        <li>• Your appeal will be reviewed by our moderation team</li>
                                        <li>• You&apos;ll receive a notification when a decision is made</li>
                                        <li>• If approved, your content will be restored</li>
                                    </ul>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting || !reason.trim()}
                                    className="gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Submit Appeal
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

/**
 * Inline appeal status badge
 */
export function AppealStatus({ status, decision }: { status: 'pending' | 'approved' | 'rejected', decision?: string | null }) {
    const isSplit = status === 'rejected' && decision === 'split';

    const config = {
        pending: {
            label: 'Appeal Pending',
            className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
        },
        approved: {
            label: 'Appeal Approved',
            className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        },
        rejected: {
            label: isSplit ? 'Appeal Rejected (No Consensus)' : 'Appeal Rejected',
            className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }
    }

    const { label, className } = config[status]

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
            title={isSplit ? 'The jury could not reach a majority consensus, so the original decision stands.' : undefined}
        >
            <Scale className="w-3 h-3" />
            {label}
        </span>
    )
}
