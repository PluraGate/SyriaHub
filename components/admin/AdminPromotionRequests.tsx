'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, Clock, CheckCircle, XCircle, User, Calendar, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface PromotionRequest {
    id: string
    user_id: string
    current_role: string
    requested_role: string
    reason: string
    status: 'pending' | 'approved' | 'rejected'
    admin_notes: string | null
    created_at: string
    reviewed_at: string | null
    user?: {
        id: string
        name: string
        email: string
        avatar_url: string | null
    }
}

export function AdminPromotionRequests() {
    const [requests, setRequests] = useState<PromotionRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})
    const { showToast } = useToast()
    const supabase = createClient()

    const fetchRequests = async () => {
        const { data, error } = await supabase
            .from('role_promotion_requests')
            .select(`
                *,
                user:users!user_id(id, name, email, avatar_url)
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (!error && data) {
            setRequests(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleDecision = async (requestId: string, decision: 'approved' | 'rejected') => {
        setProcessingId(requestId)
        try {
            const { data, error } = await supabase.rpc('review_promotion_request', {
                p_request_id: requestId,
                p_decision: decision,
                p_admin_notes: adminNotes[requestId] || null
            })

            if (error) throw error

            if (data?.success) {
                showToast(`Request ${decision}!`, 'success')
                fetchRequests()
            } else {
                throw new Error(data?.error || 'Failed to process request')
            }
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to process request', 'error')
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) {
        return (
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-dark-border rounded w-48" />
                    <div className="h-32 bg-gray-200 dark:bg-dark-border rounded" />
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-text dark:text-dark-text">Role Promotion Requests</h3>
                </div>
                {requests.length > 0 && (
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                        {requests.length} pending
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="divide-y divide-gray-100 dark:divide-dark-border">
                {requests.length === 0 ? (
                    <div className="p-8 text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-text-light dark:text-dark-text-muted">No pending requests</p>
                    </div>
                ) : (
                    requests.map((request) => (
                        <div key={request.id} className="p-4">
                            {/* Request Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-border flex items-center justify-center overflow-hidden">
                                        {request.user?.avatar_url ? (
                                            <img
                                                src={request.user.avatar_url}
                                                alt={request.user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-5 h-5 text-text-light" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-text dark:text-dark-text">
                                            {request.user?.name || 'Unknown User'}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-text-light dark:text-dark-text-muted">
                                            <span className="capitalize">{request.current_role}</span>
                                            <span>→</span>
                                            <span className="text-primary font-medium capitalize">{request.requested_role}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-text-light dark:text-dark-text-muted">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(request.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Expand/Collapse Toggle */}
                            <button
                                onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                                className="mt-3 flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                                {expandedId === request.id ? (
                                    <>
                                        <ChevronUp className="w-4 h-4" />
                                        Hide details
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" />
                                        Show reason
                                    </>
                                )}
                            </button>

                            {/* Expanded Content */}
                            {expandedId === request.id && (
                                <div className="mt-4 space-y-4">
                                    {/* Reason */}
                                    <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                                        <p className="text-sm text-text dark:text-dark-text whitespace-pre-wrap">
                                            {request.reason}
                                        </p>
                                    </div>

                                    {/* Admin Notes Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-text dark:text-dark-text mb-1">
                                            Admin Notes (optional)
                                        </label>
                                        <textarea
                                            value={adminNotes[request.id] || ''}
                                            onChange={(e) => setAdminNotes({ ...adminNotes, [request.id]: e.target.value })}
                                            placeholder="Add notes that will be shared with the user..."
                                            rows={2}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light dark:placeholder:text-dark-text-muted focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleDecision(request.id, 'rejected')}
                                            disabled={processingId === request.id}
                                            className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                                        >
                                            {processingId === request.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <XCircle className="w-4 h-4" />
                                            )}
                                            Reject
                                        </Button>
                                        <Button
                                            onClick={() => handleDecision(request.id, 'approved')}
                                            disabled={processingId === request.id}
                                            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                                        >
                                            {processingId === request.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
