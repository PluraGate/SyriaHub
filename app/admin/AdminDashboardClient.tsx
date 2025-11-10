'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/Navbar'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { Shield, Users, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface Report {
  id: string
  content_type: 'post' | 'comment'
  reason: string
  status: string
  created_at: string
  post_id?: string
  comment_id?: string
}

interface AdminDashboardClientProps {
  initialUserId: string
}

type NavbarUser = { id: string; email?: string }

export default function AdminDashboardClient({ initialUserId }: AdminDashboardClientProps) {
  const [navbarUser, setNavbarUser] = useState<NavbarUser | null>(
    initialUserId ? { id: initialUserId } : null
  )
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalReports: 0,
    pendingReports: 0,
  })
  const supabase = createClient()
  const { showToast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    
    try {
      // Load stats
      const [usersResult, postsResult, reportsResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('*'),
      ])

      setStats({
        totalUsers: usersResult.count || 0,
        totalPosts: postsResult.count || 0,
        totalReports: reportsResult.data?.length || 0,
        pendingReports: reportsResult.data?.filter(r => r.status === 'pending').length || 0,
      })

      setReports(reportsResult.data || [])
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

  const handleReportAction = async (reportId: string, action: 'resolved' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: action,
          reviewed_by: navbarUser?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', reportId)

      if (error) {
        showToast('Failed to update report', 'error')
      } else {
        showToast(`Report ${action}`, 'success')
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
        <div className="grid gap-6 md:grid-cols-4 mb-8">
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

          <div className="card p-6 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              <span className="text-3xl font-display font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pendingReports}
              </span>
            </div>
            <p className="text-sm text-text-light dark:text-dark-text-muted">Pending Reports</p>
          </div>
        </div>

        {/* Reports Table */}
        <div className="card p-6">
          <h2 className="text-2xl font-display font-semibold text-primary dark:text-dark-text mb-6">
            Recent Reports
          </h2>

          {reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-dark-border">
                  <tr className="text-left">
                    <th className="pb-3 pr-4 text-sm font-medium text-text-light dark:text-dark-text-muted">Type</th>
                    <th className="pb-3 px-4 text-sm font-medium text-text-light dark:text-dark-text-muted">Reason</th>
                    <th className="pb-3 px-4 text-sm font-medium text-text-light dark:text-dark-text-muted">Status</th>
                    <th className="pb-3 px-4 text-sm font-medium text-text-light dark:text-dark-text-muted">Date</th>
                    <th className="pb-3 pl-4 text-sm font-medium text-text-light dark:text-dark-text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.slice(0, 20).map((report) => (
                    <tr key={report.id} className="border-b border-gray-100 dark:border-dark-border">
                      <td className="py-4 pr-4">
                        <span className="px-2 py-1 bg-primary/10 dark:bg-primary-light/20 text-primary dark:text-primary-light rounded text-xs font-medium">
                          {report.content_type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-text dark:text-dark-text">
                        {report.reason}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          report.status === 'pending' 
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                            : report.status === 'resolved'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-text-light dark:text-dark-text-muted">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 pl-4">
                        {report.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReportAction(report.id, 'resolved')}
                              className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                              title="Resolve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReportAction(report.id, 'dismissed')}
                              className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                              title="Dismiss"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-text-light dark:text-dark-text-muted">
              No reports to review
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
