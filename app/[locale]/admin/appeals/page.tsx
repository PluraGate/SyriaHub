'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { AdminSidebar } from '@/components/admin'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    MessageSquare,
    RefreshCw,
    Edit
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Appeal {
    id: string
    post_id: string
    user_id: string
    dispute_reason: string
    status: 'pending' | 'approved' | 'rejected' | 'revision_requested'
    admin_response: string | null
    created_at: string
    post?: {
        id: string
        title: string
        content_type: string
        rejection_reason: string | null
    }
    user?: {
        id: string
        name: string
        email: string
    }
}

export default function AdminAppealsPage() {
    const [appeals, setAppeals] = useState<Appeal[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'revision_requested'>('pending')
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
    const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null)
    const [adminResponse, setAdminResponse] = useState('')
    const [processing, setProcessing] = useState(false)

    const supabase = useMemo(() => createClient(), [])
    const { showToast } = useToast()

    useEffect(() => {
        fetchAppeals()
    }, [statusFilter])

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel('admin-appeals-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'moderation_appeals' },
                () => fetchAppeals()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const fetchAppeals = async () => {
        setLoading(true)

        let query = supabase
            .from('moderation_appeals')
            .select(`
                *,
                post:posts(id, title, content_type, rejection_reason),
                user:users!moderation_appeals_user_id_fkey(id, name, email)
            `)
            .order('created_at', { ascending: false })

        if (statusFilter !== 'all') {
            query = query.eq('status', statusFilter)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching appeals:', error.message, error.code, error.details, error.hint)
            showToast(`Failed to load appeals: ${error.message || 'Unknown error'}`, 'error')
        } else {
            setAppeals(data || [])
        }
        setLoading(false)
    }

    const handleReviewClick = (appeal: Appeal) => {
        setSelectedAppeal(appeal)
        setAdminResponse('')
        setReviewDialogOpen(true)
    }

    const handleDecision = async (decision: 'approved' | 'rejected' | 'revision_requested') => {
        if (!selectedAppeal) return

        console.log('handleDecision called with:', { decision, appealId: selectedAppeal.id, adminResponse })
        setProcessing(true)
        try {
            // Update appeal status
            const { error: appealError } = await supabase
                .from('moderation_appeals')
                .update({
                    status: decision,
                    admin_response: adminResponse.trim() || null
                })
                .eq('id', selectedAppeal.id)

            console.log('Appeal update result:', { appealError })

            if (appealError) {
                console.error('Appeal update error:', appealError.message, appealError.code)
                throw new Error(`Failed to update appeal: ${appealError.message}`)
            }

            // If approved, also update the post's approval_status back to 'approved'
            if (decision === 'approved' && selectedAppeal.post_id) {
                const { error: postError } = await supabase
                    .from('posts')
                    .update({
                        approval_status: 'approved',
                        rejection_reason: null,
                        rejected_by: null,
                        rejected_at: null
                    })
                    .eq('id', selectedAppeal.post_id)

                if (postError) {
                    console.error('Post update error:', postError.message, postError.code)
                    throw new Error(`Failed to update post: ${postError.message}`)
                }
            }

            // Build notification based on decision
            let notificationTitle: string
            let notificationMessage: string

            if (decision === 'approved') {
                notificationTitle = 'Appeal Approved'
                notificationMessage = `Your appeal for "${selectedAppeal.post?.title}" has been approved. The content has been restored.`
            } else if (decision === 'revision_requested') {
                notificationTitle = 'Revision Requested'
                notificationMessage = `A revision has been requested for "${selectedAppeal.post?.title}". ${adminResponse}`
            } else {
                notificationTitle = 'Appeal Denied'
                notificationMessage = `Your appeal for "${selectedAppeal.post?.title}" has been denied.${adminResponse ? ` Reason: ${adminResponse}` : ''}`
            }

            // Send notification to user
            const { error: notifyError } = await supabase.from('notifications').insert({
                user_id: selectedAppeal.user_id,
                type: 'moderation',
                title: notificationTitle,
                message: notificationMessage,
                url: `/post/${selectedAppeal.post_id}`,
                post_id: selectedAppeal.post_id
            })

            if (notifyError) {
                console.error('Notification error:', notifyError.message)
                // Don't throw - notification is non-critical
            }

            const successMessages: Record<string, string> = {
                approved: 'Appeal approved - content restored.',
                rejected: 'Appeal denied.',
                revision_requested: 'Revision requested - author notified.'
            }
            showToast(successMessages[decision], 'success')
            setReviewDialogOpen(false)
            fetchAppeals()
        } catch (error: any) {
            console.error('Error processing appeal:', error.message || error)
            showToast(error.message || 'Failed to process appeal.', 'error')
        } finally {
            setProcessing(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { icon: typeof CheckCircle; className: string; label: string }> = {
            approved: { icon: CheckCircle, className: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400', label: 'Approved' },
            rejected: { icon: XCircle, className: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400', label: 'Rejected' },
            pending: { icon: Clock, className: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pending' },
            revision_requested: { icon: Edit, className: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400', label: 'Revision Requested' }
        }
        const badge = badges[status] || badges.pending
        const Icon = badge.icon
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        )
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar />

            <div className="flex">
                <AdminSidebar />

                <main className="flex-1 p-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-text dark:text-dark-text">Appeals</h1>
                                <p className="text-text-light dark:text-dark-text-muted mt-1">
                                    Review and respond to content appeals from authors
                                </p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {([
                                { value: 'all', label: 'All' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'revision_requested', label: 'Revision' },
                                { value: 'approved', label: 'Approved' },
                                { value: 'rejected', label: 'Rejected' }
                            ] as const).map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setStatusFilter(filter.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === filter.value
                                        ? 'bg-primary text-white'
                                        : 'bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {/* Appeals List */}
                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : appeals.length === 0 ? (
                                <div className="text-center py-16">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-text-light dark:text-dark-text-muted" />
                                    <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">
                                        No {statusFilter !== 'all' ? statusFilter : ''} appeals
                                    </h3>
                                    <p className="text-text-light dark:text-dark-text-muted">
                                        {statusFilter === 'pending'
                                            ? 'No appeals are awaiting review.'
                                            : 'No appeals match the selected filter.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-dark-border">
                                    {appeals.map((appeal) => (
                                        <div key={appeal.id} className="p-6 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        {getStatusBadge(appeal.status)}
                                                        <span className="text-sm text-text-light dark:text-dark-text-muted">
                                                            {formatDistanceToNow(new Date(appeal.created_at), { addSuffix: true })}
                                                        </span>
                                                    </div>

                                                    <h3 className="font-semibold text-text dark:text-dark-text mb-1">
                                                        Appeal for: {appeal.post?.title || 'Unknown Post'}
                                                    </h3>

                                                    <p className="text-sm text-text-light dark:text-dark-text-muted mb-3">
                                                        By {appeal.user?.name || appeal.user?.email || 'Unknown User'}
                                                    </p>

                                                    <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-3 mb-3">
                                                        <p className="text-sm text-text dark:text-dark-text">
                                                            <strong>Appeal reason:</strong> {appeal.dispute_reason}
                                                        </p>
                                                    </div>

                                                    {appeal.post?.rejection_reason && (
                                                        <p className="text-sm text-text-light dark:text-dark-text-muted">
                                                            <strong>Original rejection:</strong> {appeal.post.rejection_reason}
                                                        </p>
                                                    )}

                                                    {appeal.admin_response && (
                                                        <p className="text-sm text-text-light dark:text-dark-text-muted mt-2">
                                                            <strong>Admin response:</strong> {appeal.admin_response}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Link href={`/post/${appeal.post_id}`} target="_blank">
                                                        <Button variant="outline" size="sm" className="gap-1.5">
                                                            <Eye className="w-4 h-4" />
                                                            View Post
                                                        </Button>
                                                    </Link>
                                                    {appeal.status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleReviewClick(appeal)}
                                                        >
                                                            Review
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Review Dialog */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Review Appeal</DialogTitle>
                        <DialogDescription>
                            Review the appeal for &quot;{selectedAppeal?.post?.title}&quot; and make a decision.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-4 space-y-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-text-light dark:text-dark-text-muted mb-1">
                                    Original Rejection Reason
                                </p>
                                <p className="text-sm text-text dark:text-dark-text">
                                    {selectedAppeal?.post?.rejection_reason || 'No reason provided'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-text-light dark:text-dark-text-muted mb-1">
                                    Author&apos;s Appeal
                                </p>
                                <p className="text-sm text-text dark:text-dark-text">
                                    {selectedAppeal?.dispute_reason}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="admin-response" className="text-text dark:text-dark-text font-medium">
                                Response (optional)
                            </Label>
                            <textarea
                                id="admin-response"
                                value={adminResponse}
                                onChange={(e) => setAdminResponse(e.target.value)}
                                placeholder="Add an optional response to the author..."
                                rows={3}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light dark:placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            onClick={() => setReviewDialogOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleDecision('rejected')}
                            disabled={processing}
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1.5" />}
                            Deny
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleDecision('revision_requested')}
                            disabled={processing || !adminResponse.trim()}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
                            title={!adminResponse.trim() ? "Please add a message explaining what revisions are needed" : ""}
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4 mr-1.5" />}
                            Request Revision
                        </Button>
                        <Button
                            onClick={() => handleDecision('approved')}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1.5" />}
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
