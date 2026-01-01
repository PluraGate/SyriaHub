import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { AdminSidebar } from '@/components/admin'
import { redirect } from 'next/navigation'
import { CheckCircle, XCircle, Trash2, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { getTranslations } from 'next-intl/server'

export default async function AdminReportsPage() {
    const t = await getTranslations('Admin.reportsPage')
    const tCommon = await getTranslations('Common')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user is admin or moderator
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!userData || !['admin', 'moderator'].includes(userData.role)) {
        redirect('/')
    }

    // Fetch reports
    const { data: reports, error } = await supabase
        .from('reports')
        .select(`
      *,
      reporter:users!reports_reporter_id_fkey(name, email),
      post:posts(id, title, content),
      comment:comments(id, content)
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching reports:', error)
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <div className="flex">
                <AdminSidebar className="sticky top-0 h-[calc(100vh-64px)]" />

                <main className="flex-1 p-6 md:p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                            <h1 className="text-3xl font-display font-bold text-primary dark:text-dark-text">
                                {t('title')}
                            </h1>
                        </div>

                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-start text-sm">
                                    <thead className="bg-gray-50 dark:bg-dark-border/50 border-b border-gray-200 dark:border-dark-border">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-text dark:text-dark-text text-start">{t('tableStatus')}</th>
                                            <th className="px-6 py-4 font-semibold text-text dark:text-dark-text text-start">{t('tableType')}</th>
                                            <th className="px-6 py-4 font-semibold text-text dark:text-dark-text text-start">{t('tableReason')}</th>
                                            <th className="px-6 py-4 font-semibold text-text dark:text-dark-text text-start">{t('tableContent')}</th>
                                            <th className="px-6 py-4 font-semibold text-text dark:text-dark-text text-start">{t('tableReporter')}</th>
                                            <th className="px-6 py-4 font-semibold text-text dark:text-dark-text text-start">{t('tableDate')}</th>
                                            <th className="px-6 py-4 font-semibold text-text dark:text-dark-text text-end">{t('tableActions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                                        {reports && reports.length > 0 ? (
                                            reports.map((report) => (
                                                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-dark-border/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' : ''}
                          ${report.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : ''}
                          ${report.status === 'dismissed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' : ''}
                        `}>
                                                            {report.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-text-light dark:text-dark-text-muted">
                                                        {report.post_id ? tCommon('post') : tCommon('comment')}
                                                    </td>
                                                    <td className="px-6 py-4 text-text dark:text-dark-text font-medium">
                                                        {report.reason}
                                                    </td>
                                                    <td className="px-6 py-4 max-w-xs truncate text-text-light dark:text-dark-text-muted">
                                                        {report.post?.title || report.comment?.content || tCommon('contentDeleted')}
                                                    </td>
                                                    <td className="px-6 py-4 text-text-light dark:text-dark-text-muted">
                                                        {report.reporter?.name || tCommon('unknown')}
                                                    </td>
                                                    <td className="px-6 py-4 text-text-light dark:text-dark-text-muted">
                                                        {format(new Date(report.created_at), 'MMM d, yyyy')}
                                                    </td>
                                                    <td className="px-6 py-4 text-end">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {report.status === 'pending' && (
                                                                <>
                                                                    <form action={`/api/reports/${report.id}/dismiss`} method="POST">
                                                                        <button title={tCommon('dismiss')} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                                                            <XCircle className="w-5 h-5" />
                                                                        </button>
                                                                    </form>
                                                                    <form action={`/api/reports/${report.id}/resolve`} method="POST">
                                                                        <button title={tCommon('resolve')} className="p-1 text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                                                            <CheckCircle className="w-5 h-5" />
                                                                        </button>
                                                                    </form>
                                                                </>
                                                            )}
                                                            <form action={`/api/reports/${report.id}/delete`} method="POST">
                                                                <button title={tCommon('deleteContent')} className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                                                    <Trash2 className="w-5 h-5" />
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-text-light dark:text-dark-text-muted">
                                                    {t('noReports')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
