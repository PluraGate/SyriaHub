'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Users,
    Search,
    Filter,
    ChevronDown,
    Shield,
    ShieldCheck,
    ShieldX,
    MoreHorizontal,
    Mail,
    Calendar,
    FileText,
    MessageSquare,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Ban,
    CheckCircle,
    AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { RolePromotionDialog } from './RolePromotionDialog'
import { format } from 'date-fns'

interface AdminUser {
    id: string
    email: string
    name: string | null
    role: 'researcher' | 'moderator' | 'admin'
    avatar_url: string | null
    created_at: string
    is_verified_author: boolean
    suspended_at: string | null
    suspension_reason: string | null
    post_count: number
    comment_count: number
}

interface UserListResponse {
    users: AdminUser[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export function UserManagement() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [totalUsers, setTotalUsers] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [page, setPage] = useState(1)
    const [pageSize] = useState(20)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<string | null>(null)
    const [sortBy, setSortBy] = useState('created_at')
    const [sortOrder, setSortOrder] = useState('desc')
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
    const [showRoleDialog, setShowRoleDialog] = useState(false)
    const [processingUserId, setProcessingUserId] = useState<string | null>(null)
    const [showActionMenu, setShowActionMenu] = useState<string | null>(null)
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)

    const supabase = useMemo(() => createClient(), [])
    const { showToast } = useToast()

    // Fetch current user's role on mount
    useEffect(() => {
        async function fetchCurrentUserRole() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                if (data) setCurrentUserRole(data.role)
            }
        }
        fetchCurrentUserRole()
    }, [supabase])

    const loadUsers = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.rpc('get_admin_users', {
                page_number: page,
                page_size: pageSize,
                role_filter: roleFilter,
                search_query: searchQuery || null,
                sort_by: sortBy,
                sort_order: sortOrder
            })

            if (error) {
                console.error('Error loading users:', error)
                showToast('Failed to load users', 'error')
                return
            }

            const result = data as UserListResponse
            setUsers(result.users || [])
            setTotalUsers(result.total)
            setTotalPages(result.total_pages)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }, [page, pageSize, roleFilter, searchQuery, sortBy, sortOrder, supabase, showToast])

    useEffect(() => {
        loadUsers()
    }, [loadUsers])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page !== 1) setPage(1)
            else loadUsers()
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleRoleChange = (user: AdminUser) => {
        // Only admins can change roles
        if (currentUserRole !== 'admin') {
            showToast('Only admins can change user roles', 'error')
            return
        }
        setSelectedUser(user)
        setShowRoleDialog(true)
        setShowActionMenu(null)
    }

    const handleSuspend = async (user: AdminUser) => {
        // Moderators cannot suspend admins
        if (currentUserRole === 'moderator' && user.role === 'admin') {
            showToast('Moderators cannot suspend admins', 'error')
            setShowActionMenu(null)
            return
        }
        setProcessingUserId(user.id)
        setShowActionMenu(null)
        try {
            const { data, error } = await supabase.rpc('suspend_user', {
                target_user_id: user.id,
                suspend: !user.suspended_at,
                reason: user.suspended_at ? null : 'Suspended by admin'
            })

            if (error || !data.success) {
                showToast(data?.error || 'Failed to update user', 'error')
                return
            }

            showToast(
                user.suspended_at ? 'User unsuspended' : 'User suspended',
                'success'
            )
            loadUsers()
        } catch (error) {
            showToast('An error occurred', 'error')
        } finally {
            setProcessingUserId(null)
        }
    }

    const getRoleBadge = (role: string, isVerified: boolean, suspended: boolean) => {
        if (suspended) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    <Ban className="w-3 h-3" />
                    Suspended
                </span>
            )
        }

        const styles = {
            admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
            moderator: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
            researcher: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
        }

        const icons = {
            admin: ShieldCheck,
            moderator: Shield,
            researcher: Users
        }

        const Icon = icons[role as keyof typeof icons] || Users

        return (
            <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[role as keyof typeof styles] || styles.researcher}`}>
                    <Icon className="w-3 h-3" />
                    {role}
                </span>
                {isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                    </span>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light dark:text-dark-text-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* Role Filter */}
                    <div className="relative">
                        <select
                            value={roleFilter || ''}
                            onChange={(e) => {
                                setRoleFilter(e.target.value || null)
                                setPage(1)
                            }}
                            className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">All Roles</option>
                            <option value="researcher">Researchers</option>
                            <option value="moderator">Moderators</option>
                            <option value="admin">Admins</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [by, order] = e.target.value.split('-')
                                setSortBy(by)
                                setSortOrder(order)
                                setPage(1)
                            }}
                            className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="created_at-desc">Newest First</option>
                            <option value="created_at-asc">Oldest First</option>
                            <option value="name-asc">Name A-Z</option>
                            <option value="name-desc">Name Z-A</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* User Count */}
            <div className="text-sm text-text-light dark:text-dark-text-muted">
                Showing {users.length} of {totalUsers} users
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-text-light dark:text-dark-text-muted">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-dark-border/50 border-b border-gray-200 dark:border-dark-border">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-light dark:text-dark-text-muted uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-light dark:text-dark-text-muted uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-light dark:text-dark-text-muted uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-light dark:text-dark-text-muted uppercase tracking-wider">
                                        Activity
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-text-light dark:text-dark-text-muted uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-border flex items-center justify-center overflow-hidden">
                                                    {user.avatar_url ? (
                                                        <img
                                                            src={user.avatar_url}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Users className="w-5 h-5 text-text-light dark:text-dark-text-muted" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-text dark:text-dark-text">
                                                        {user.name || 'Unnamed User'}
                                                    </p>
                                                    <p className="text-sm text-text-light dark:text-dark-text-muted flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getRoleBadge(user.role, user.is_verified_author, !!user.suspended_at)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-text-light dark:text-dark-text-muted">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(user.created_at), 'MMM d, yyyy')}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-4 text-sm text-text-light dark:text-dark-text-muted">
                                                <span className="flex items-center gap-1" title="Posts">
                                                    <FileText className="w-3.5 h-3.5" />
                                                    {user.post_count}
                                                </span>
                                                <span className="flex items-center gap-1" title="Comments">
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    {user.comment_count}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setShowActionMenu(showActionMenu === user.id ? null : user.id)}
                                                    disabled={processingUserId === user.id}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors disabled:opacity-50"
                                                >
                                                    {processingUserId === user.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <MoreHorizontal className="w-4 h-4 text-text-light dark:text-dark-text-muted" />
                                                    )}
                                                </button>

                                                {showActionMenu === user.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setShowActionMenu(null)}
                                                        />
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg z-20 py-1">
                                                            {/* Only show Change Role to admins */}
                                                            {currentUserRole === 'admin' && (
                                                                <button
                                                                    onClick={() => handleRoleChange(user)}
                                                                    className="w-full px-4 py-2 text-left text-sm text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border flex items-center gap-2"
                                                                >
                                                                    <Shield className="w-4 h-4" />
                                                                    Change Role
                                                                </button>
                                                            )}
                                                            {/* Moderators cannot suspend admins */}
                                                            {!(currentUserRole === 'moderator' && user.role === 'admin') && (
                                                                <button
                                                                    onClick={() => handleSuspend(user)}
                                                                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${user.suspended_at
                                                                        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                                        : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                                        }`}
                                                                >
                                                                    {user.suspended_at ? (
                                                                        <>
                                                                            <CheckCircle className="w-4 h-4" />
                                                                            Unsuspend
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Ban className="w-4 h-4" />
                                                                            Suspend
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-text-light dark:text-dark-text-muted">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Role Change Dialog */}
            {selectedUser && (
                <RolePromotionDialog
                    open={showRoleDialog}
                    onOpenChange={setShowRoleDialog}
                    user={selectedUser}
                    onSuccess={() => {
                        loadUsers()
                        setSelectedUser(null)
                    }}
                />
            )}
        </div>
    )
}
