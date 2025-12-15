import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ResearchLabNav } from '@/components/research-lab/ResearchLabNav'
import Link from 'next/link'
import {
    Plus,
    ClipboardList,
    Users,
    Calendar,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    ExternalLink
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const statusColors = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    closed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    archived: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}

export default async function SurveysPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch user's surveys and active surveys from others
    const { data: mySurveys } = await supabase
        .from('surveys')
        .select(`
            *,
            author:users!author_id(name, email)
        `)
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false })

    const { data: activeSurveys } = await supabase
        .from('surveys')
        .select(`
            *,
            author:users!author_id(name, email)
        `)
        .eq('status', 'active')
        .neq('author_id', user?.id || '')
        .order('created_at', { ascending: false })
        .limit(10)

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <div className="flex flex-1">
                {/* Sidebar - hidden on mobile */}
                <div className="hidden lg:block">
                    <ResearchLabNav />
                </div>

                {/* Main Content */}
                <main className="flex-1 container-custom py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-display font-bold text-text dark:text-dark-text mb-1">
                                Surveys
                            </h1>
                            <p className="text-text-light dark:text-dark-text-muted">
                                Create and manage research surveys with multiple question types
                            </p>
                        </div>
                        <Link
                            href="/research-lab/surveys/create"
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Survey
                        </Link>
                    </div>

                    {/* My Surveys Section */}
                    {user && (
                        <section className="mb-12">
                            <h2 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-primary" />
                                My Surveys
                            </h2>

                            {mySurveys && mySurveys.length > 0 ? (
                                <div className="grid gap-4">
                                    {mySurveys.map((survey: any) => (
                                        <div
                                            key={survey.id}
                                            className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5 hover:border-primary/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Link
                                                            href={`/research-lab/surveys/${survey.id}`}
                                                            className="text-lg font-semibold text-text dark:text-dark-text hover:text-primary transition-colors truncate"
                                                        >
                                                            {survey.title}
                                                        </Link>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[survey.status as keyof typeof statusColors]}`}>
                                                            {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    {survey.description && (
                                                        <p className="text-text-light dark:text-dark-text-muted text-sm line-clamp-2 mb-3">
                                                            {survey.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm text-text-light dark:text-dark-text-muted">
                                                        <span className="flex items-center gap-1.5">
                                                            <Users className="w-4 h-4" />
                                                            {survey.response_count || 0} responses
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-4 h-4" />
                                                            {formatDistanceToNow(new Date(survey.created_at), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/research-lab/surveys/${survey.id}/results`}
                                                        className="p-2 text-text-light dark:text-dark-text-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
                                                        title="View Results"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/research-lab/surveys/${survey.id}/edit`}
                                                        className="p-2 text-text-light dark:text-dark-text-muted hover:text-primary hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors"
                                                        title="Edit Survey"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
                                    <ClipboardList className="w-12 h-12 mx-auto text-gray-300 dark:text-dark-text-muted mb-4" />
                                    <h3 className="font-semibold text-text dark:text-dark-text mb-2">
                                        No surveys yet
                                    </h3>
                                    <p className="text-text-light dark:text-dark-text-muted mb-4">
                                        Create your first survey to start collecting responses
                                    </p>
                                    <Link
                                        href="/research-lab/surveys/create"
                                        className="btn btn-outline"
                                    >
                                        Create Survey
                                    </Link>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Active Surveys from Others */}
                    <section>
                        <h2 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                            <ExternalLink className="w-5 h-5 text-emerald-500" />
                            Active Surveys to Participate
                        </h2>

                        {activeSurveys && activeSurveys.length > 0 ? (
                            <div className="grid gap-4">
                                {activeSurveys.map((survey: any) => (
                                    <Link
                                        key={survey.id}
                                        href={`/research-lab/surveys/${survey.id}`}
                                        className="block bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5 hover:border-primary/50 transition-colors group"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-text dark:text-dark-text group-hover:text-primary transition-colors mb-1">
                                                    {survey.title}
                                                </h3>
                                                {survey.description && (
                                                    <p className="text-text-light dark:text-dark-text-muted text-sm line-clamp-2 mb-3">
                                                        {survey.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 text-sm text-text-light dark:text-dark-text-muted">
                                                    <span>
                                                        By {survey.author?.name || survey.author?.email?.split('@')[0] || 'Anonymous'}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Users className="w-4 h-4" />
                                                        {survey.response_count || 0} responses
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="btn btn-outline btn-sm whitespace-nowrap">
                                                Take Survey
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 dark:bg-dark-surface/50 rounded-xl border border-gray-200 dark:border-dark-border">
                                <p className="text-text-light dark:text-dark-text-muted">
                                    No active surveys available right now
                                </p>
                            </div>
                        )}
                    </section>
                </main>
            </div>

            <Footer />
        </div>
    )
}
