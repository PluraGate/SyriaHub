'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { ModerationTriage } from '@/components/ModerationTriage'
import { AdminWaitlistDashboard } from '@/components/AdminWaitlistDashboard'
import { Shield, Users, FileText, AlertTriangle, CheckCircle, XCircle, Scale, Clock, ChevronRight, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface Report {
  id: string
  content_type: 'post' | 'comment'
  reason: string
  status: string
  created_at: string
  post_id?: string
  comment_id?: string
}

interface Appeal {
  id: string
  post_id: string
  dispute_reason: string
  status: 'pending' | 'approved' | 'rejected'
  admin_response?: string
  created_at: string
  post?: { id: string; title: string }
  user?: { name?: string; email?: string }
}

interface AdminDashboardClientProps {
  initialUserId: string
}

type NavbarUser = { id: string; email?: string }
type ActiveTab = 'reports' | 'appeals' | 'overview' | 'waitlist'

export default function AdminDashboardClient({ initialUserId }: AdminDashboardClientProps) {
  const [navbarUser, setNavbarUser] = useState<NavbarUser | null>(
    initialUserId ? { id: initialUserId } : null
  )
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [activeTab, setActiveTab] = useState<ActiveTab>('reports')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalReports: 0,
    pendingReports: 0,
    pendingAppeals: 0,
    pendingWaitlist: 0,
  })
  const supabase = useMemo(() => createClient(), [])
  const { showToast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)

    try {
      // Load stats
      const [usersResult, postsResult, reportsResult, appealsResult, waitlistResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('*'),
        supabase.from('moderation_appeals').select(`
          *,
          post:posts(id, title),
          user:users!moderation_appeals_user_id_fkey(name, email)
        `).order('created_at', { ascending: false }),
        supabase.from('waitlist').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ])

      setStats({
        totalUsers: usersResult.count || 0,
        totalPosts: postsResult.count || 0,
        totalReports: reportsResult.data?.length || 0,
        pendingReports: reportsResult.data?.filter(r => r.status === 'pending').length || 0,
        pendingAppeals: appealsResult.data?.filter(a => a.status === 'pending').length || 0,
        pendingWaitlist: waitlistResult.count || 0,
      })

      setReports(reportsResult.data || [])
      setAppeals(appealsResult.data || [])
    } catch (error) {
      console.error('Error loading admin data:', error)
      showToast('Failed to load admin data', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast, supabase])

  useEffect(() => {
    loadData()

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setNavbarUser({
          id: data.user.id,
          email: data.user.email ?? undefined,
        })
      }
    })
  }, [loadData, supabase])

  const handleAppealAction = async (appealId: string, status: 'approved' | 'rejected', response?: string) => {
    try {
      const { error } = await supabase
        .from('moderation_appeals')
        .update({
          status,
          admin_response: response,
          resolved_by: navbarUser?.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', appealId)

      if (error) {
        showToast('Failed to update appeal', 'error')
      } else {
        showToast(`Appeal ${status}`, 'success')

        // If approved, also update the post status
        const appeal = appeals.find(a => a.id === appealId)
        if (status === 'approved' && appeal?.post_id) {
          await supabase
            .from('posts')
            .update({ approval_status: 'pending' })
            .eq('id', appeal.post_id)
        }

        loadData()
      }
    } catch (error) {
      showToast('An error occurred', 'error')
    }
  }

  if (!navbarUser || loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-dark-bg">
        <Navbar user={navbarUser} />
        <div className="container-custom max-w-7xl py-12">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const pendingAppeals = appeals.filter(a => a.status === 'pending')

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg">
      <Navbar user={navbarUser} />

      <main className="container-custom max-w-7xl py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-accent dark:text-accent-light" />
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary dark:text-dark-text">
            Admin Dashboard
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-5 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-primary dark:text-primary-light" />
              <span className="text-3xl font-display font-bold text-primary dark:text-dark-text">
                {stats.totalUsers}
              </span>
            </div>
            <p className="text-sm text-text-light dark:text-dark-text-muted">Total Users</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-accent dark:text-accent-light" />
              <span className="text-3xl font-display font-bold text-primary dark:text-dark-text">
                {stats.totalPosts}
              </span>
            </div>
            <p className="text-sm text-text-light dark:text-dark-text-muted">Total Posts</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <span className="text-3xl font-display font-bold text-primary dark:text-dark-text">
                {stats.totalReports}
              </span>
            </div>
            <p className="text-sm text-text-light dark:text-dark-text-muted">Total Reports</p>
          </div>

          <div
            className="card p-6 border-yellow-200 dark:border-yellow-800 cursor-pointer hover:bg-yellow-50/50 dark:hover:bg-yellow-900/10 transition-colors"
            onClick={() => setActiveTab('reports')}
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              <span className="text-3xl font-display font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pendingReports}
              </span>
            </div>
            <p className="text-sm text-text-light dark:text-dark-text-muted">Pending Reports</p>
          </div>

          <div
            className="card p-6 border-orange-200 dark:border-orange-800 cursor-pointer hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors"
            onClick={() => setActiveTab('appeals')}
          >
            <div className="flex items-center justify-between mb-2">
              <Scale className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <span className="text-3xl font-display font-bold text-orange-600 dark:text-orange-400">
                {stats.pendingAppeals}
              </span>
            </div>
            <p className="text-sm text-text-light dark:text-dark-text-muted">Pending Appeals</p>
          </div>

          <div
            className="card p-6 border-purple-200 dark:border-purple-800 cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors"
            onClick={() => setActiveTab('waitlist')}
          >
            <div className="flex items-center justify-between mb-2">
              <UserPlus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <span className="text-3xl font-display font-bold text-purple-600 dark:text-purple-400">
                {stats.pendingWaitlist}
              </span>
            </div>
            <p className="text-sm text-text-light dark:text-dark-text-muted">Waitlist Pending</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-dark-border mb-6">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reports'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
              }`}
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Reports
              {stats.pendingReports > 0 && (
                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs">
                  {stats.pendingReports}
                </span>
              )}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('appeals')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'appeals'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
              }`}
          >
            <span className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Appeals
              {stats.pendingAppeals > 0 && (
                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs">
                  {stats.pendingAppeals}
                </span>
              )}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('waitlist')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'waitlist'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
              }`}
          >
            <span className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Waitlist
              {stats.pendingWaitlist > 0 && (
                <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                  {stats.pendingWaitlist}
                </span>
              )}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'reports' && (
          <div className="card p-6">
            <h2 className="text-2xl font-display font-semibold text-primary dark:text-dark-text mb-6">
              Moderation Queue
            </h2>
            <ModerationTriage onReportAction={() => loadData()} />
          </div>
        )}

        {activeTab === 'appeals' && (
          <div className="card p-6">
            <h2 className="text-2xl font-display font-semibold text-primary dark:text-dark-text mb-6">
              Content Appeals
            </h2>

            {pendingAppeals.length === 0 ? (
              <div className="text-center py-12 text-text-light dark:text-dark-text-muted">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending appeals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAppeals.map(appeal => (
                  <div
                    key={appeal.id}
                    className="p-4 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Scale className="w-4 h-4 text-orange-500" />
                          <Link
                            href={`/post/${appeal.post_id}`}
                            className="font-medium text-text dark:text-dark-text hover:text-primary"
                          >
                            {appeal.post?.title || 'Untitled Post'}
                          </Link>
                        </div>
                        <p className="text-sm text-text-light dark:text-dark-text-muted">
                          Appealed by: {appeal.user?.name || appeal.user?.email?.split('@')[0] || 'Unknown'}
                        </p>
                      </div>
                      <span className="text-xs text-text-light dark:text-dark-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(appeal.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-dark-surface rounded-lg border border-orange-100 dark:border-orange-900 mb-4">
                      <span className="text-xs text-text-light dark:text-dark-text-muted block mb-1">
                        Dispute Reason:
                      </span>
                      <p className="text-sm text-text dark:text-dark-text">
                        {appeal.dispute_reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/post/${appeal.post_id}`} target="_blank">
                        <Button size="sm" variant="outline" className="gap-1">
                          View Post
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleAppealAction(appeal.id, 'approved')}
                        className="gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAppealAction(appeal.id, 'rejected')}
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'waitlist' && (
          <div className="card p-6">
            <h2 className="text-2xl font-display font-semibold text-primary dark:text-dark-text mb-6">
              Waitlist Management
            </h2>
            <AdminWaitlistDashboard />
          </div>
        )}
      </main>
    </div>
  )
}
