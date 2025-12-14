'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { AdminSidebar } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    Search,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Filter,
    ChevronLeft,
    ChevronRight,
    Trash2
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import Link from 'next/link'
import { format } from 'date-fns'

interface Post {
    id: string
    title: string
    content_type: 'article' | 'question' | 'discussion' | 'resource'
    approval_status: 'pending' | 'approved' | 'rejected'
    created_at: string
    author: {
        id: string
        name: string
        avatar_url: string | null
    }
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'
type ContentTypeFilter = 'all' | 'article' | 'question' | 'discussion' | 'resource'

export default function AdminContentPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [typeFilter, setTypeFilter] = useState<ContentTypeFilter>('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [rejectingPost, setRejectingPost] = useState<Post | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [rejecting, setRejecting] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingPost, setDeletingPost] = useState<Post | null>(null)
    const [deleting, setDeleting] = useState(false)
    const pageSize = 20

    const supabase = useMemo(() => createClient(), [])
    const { showToast } = useToast()

    useEffect(() => {
        fetchPosts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, typeFilter, page])

    // Realtime subscription for auto-refresh
    useEffect(() => {
        const channel = supabase
            .channel('admin-posts-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'posts' },
                () => {
                    // Refresh posts when any change occurs
                    fetchPosts()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase])

    const fetchPosts = async () => {
        setLoading(true)

        let query = supabase
            .from('posts')
            .select(`
                id, title, content_type, approval_status, created_at,
                author:users!posts_author_id_fkey(id, name, avatar_url)
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1)

        if (statusFilter !== 'all') {
            query = query.eq('approval_status', statusFilter)
        }

        if (typeFilter !== 'all') {
            query = query.eq('content_type', typeFilter)
        }

        if (search.trim()) {
            query = query.ilike('title', `%${search.trim()}%`)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('Error fetching posts:', error)
            showToast('Failed to fetch content.', 'error')
        } else {
            setPosts(data as unknown as Post[])
            setTotalPages(Math.ceil((count || 0) / pageSize))
        }
        setLoading(false)
    }

    const handleSearch = () => {
        setPage(1)
        fetchPosts()
    }

    const handleApprove = async (postId: string) => {
        const { error } = await supabase
            .from('posts')
            .update({ approval_status: 'approved' })
            .eq('id', postId)

        if (error) {
            showToast('Failed to approve post.', 'error')
        } else {
            showToast('Post approved.', 'success')
            fetchPosts()
        }
    }

    const handleRejectClick = (post: Post) => {
        setRejectingPost(post)
        setRejectionReason('')
        setRejectDialogOpen(true)
    }

    const confirmReject = async () => {
        if (!rejectingPost || !rejectionReason.trim()) {
            showToast('Please provide a reason for rejection.', 'error')
            return
        }

        setRejecting(true)
        try {
            // Get current user for rejected_by
            const { data: { user } } = await supabase.auth.getUser()

            // Update post with rejection details
            const { error: updateError } = await supabase
                .from('posts')
                .update({
                    approval_status: 'rejected',
                    rejection_reason: rejectionReason.trim(),
                    rejected_by: user?.id,
                    rejected_at: new Date().toISOString()
                })
                .eq('id', rejectingPost.id)

            if (updateError) throw updateError

            // Send notification to author
            if (rejectingPost.author?.id) {
                const { error: notifyError } = await supabase.from('notifications').insert({
                    user_id: rejectingPost.author.id,
                    type: 'moderation',
                    title: 'Post Rejected',
                    message: `Your post "${rejectingPost.title}" has been rejected. Reason: ${rejectionReason.trim()}`,
                    url: `/post/${rejectingPost.id}`,
                    post_id: rejectingPost.id
                })

                if (notifyError) {
                    console.error('Failed to send notification:', notifyError)
                }
            }

            showToast('Post rejected and author notified.', 'success')
            setRejectDialogOpen(false)
            fetchPosts()
        } catch (error) {
            console.error('Error rejecting post:', error)
            showToast('Failed to reject post.', 'error')
        } finally {
            setRejecting(false)
        }
    }

    const handleDeleteClick = (post: Post) => {
        setDeletingPost(post)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!deletingPost) return

        setDeleting(true)
        try {
            // Delete the post (cascades to appeals due to FK)
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', deletingPost.id)

            if (error) throw error

            showToast('Post deleted permanently.', 'success')
            setDeleteDialogOpen(false)
            setDeletingPost(null)
            fetchPosts()
        } catch (error) {
            console.error('Error deleting post:', error)
            showToast('Failed to delete post.', 'error')
        } finally {
            setDeleting(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { icon: typeof CheckCircle; className: string }> = {
            approved: { icon: CheckCircle, className: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
            pending: { icon: Clock, className: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400' },
            rejected: { icon: XCircle, className: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' }
        }
        const badge = badges[status] || badges.pending
        const Icon = badge.icon

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                <Icon className="w-3 h-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        )
    }

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            article: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            question: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            discussion: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            resource: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
        }

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-700'}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
        )
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar />
            <div className="flex">
                <AdminSidebar className="sticky top-0 h-[calc(100vh-64px)]" />

                <main className="flex-1 p-6 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text">
                                Content Management
                            </h1>
                            <p className="text-text-light dark:text-dark-text-muted mt-2">
                                Review and manage all posts on the platform.
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="card p-4 mb-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                                    <Input
                                        placeholder="Search by title..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-9"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-text-light" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1) }}
                                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>

                                {/* Type Filter */}
                                <div>
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => { setTypeFilter(e.target.value as ContentTypeFilter); setPage(1) }}
                                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="article">Articles</option>
                                        <option value="question">Questions</option>
                                        <option value="discussion">Discussions</option>
                                        <option value="resource">Resources</option>
                                    </select>
                                </div>

                                <Button onClick={handleSearch}>
                                    Search
                                </Button>
                            </div>
                        </div>

                        {/* Content Table */}
                        <div className="card overflow-hidden">
                            {loading ? (
                                <div className="p-12 flex justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="p-12 text-center text-text-light dark:text-dark-text-muted">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No content found.</p>
                                </div>
                            ) : (
                                <>
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-border/50">
                                                <th className="text-left p-4 text-sm font-medium text-text-light dark:text-dark-text-muted">Title</th>
                                                <th className="text-left p-4 text-sm font-medium text-text-light dark:text-dark-text-muted">Author</th>
                                                <th className="text-left p-4 text-sm font-medium text-text-light dark:text-dark-text-muted">Type</th>
                                                <th className="text-left p-4 text-sm font-medium text-text-light dark:text-dark-text-muted">Status</th>
                                                <th className="text-left p-4 text-sm font-medium text-text-light dark:text-dark-text-muted">Date</th>
                                                <th className="text-right p-4 text-sm font-medium text-text-light dark:text-dark-text-muted">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                                            {posts.map((post) => (
                                                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors">
                                                    <td className="p-4">
                                                        <Link
                                                            href={`/post/${post.id}`}
                                                            className="font-medium text-text dark:text-dark-text hover:text-primary dark:hover:text-primary-light transition-colors line-clamp-1"
                                                        >
                                                            {post.title}
                                                        </Link>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm text-text-light dark:text-dark-text-muted">
                                                            {post.author?.name || 'Unknown'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        {getTypeBadge(post.content_type)}
                                                    </td>
                                                    <td className="p-4">
                                                        {getStatusBadge(post.approval_status)}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm text-text-light dark:text-dark-text-muted">
                                                            {format(new Date(post.created_at), 'MMM d, yyyy')}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link href={`/post/${post.id}`}>
                                                                <Button variant="ghost" size="sm" title="View">
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </Link>
                                                            {post.approval_status !== 'approved' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleApprove(post.id)}
                                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            {post.approval_status !== 'rejected' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRejectClick(post)}
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(post)}
                                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                                title="Delete permanently"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-dark-border">
                                            <span className="text-sm text-text-light dark:text-dark-text-muted">
                                                Page {page} of {totalPages}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                                    disabled={page === 1}
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={page === totalPages}
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Rejection Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400">Reject Post</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting &quot;{rejectingPost?.title}&quot;.
                            The author will be notified and can appeal this decision.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejection-reason" className="text-text dark:text-dark-text font-medium">
                                Rejection Reason <span className="text-red-500">*</span>
                            </Label>
                            <textarea
                                id="rejection-reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Explain why this content is being rejected..."
                                rows={4}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder:text-text-light dark:placeholder:text-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                            <p className="text-sm text-amber-700 dark:text-amber-300">
                                The author will receive a notification with this reason and can submit an appeal if they disagree with the decision.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={rejecting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmReject}
                            disabled={rejecting || !rejectionReason.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {rejecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                            Reject Post
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Content Permanently</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{deletingPost?.title}&quot;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-2">
                                This will permanently delete:
                            </p>
                            <ul className="text-sm text-red-600 dark:text-red-400 list-disc list-inside space-y-1">
                                <li>The post/event content</li>
                                <li>All associated appeals</li>
                                <li>All comments and reactions</li>
                            </ul>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
