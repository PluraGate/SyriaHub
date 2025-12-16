import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import {
    ClipboardList,
    BarChart3,
    Vote,
    Sparkles,
    Database,
    ArrowRight,
    TrendingUp,
    Users,
    Search
} from 'lucide-react'

const features = [
    {
        id: 'search',
        title: 'Search Engine',
        description: 'AI-powered semantic search across internal posts and external sources. Get explainable, evidence-ranked results.',
        icon: Search,
        href: '/research-lab/search',
        color: 'bg-teal-500',
        stats: { label: 'Sources', value: 'Multi' }
    },
    {
        id: 'surveys',
        title: 'Survey Builder',
        description: 'Create comprehensive surveys with multiple question types, conditional logic, and advanced analytics.',
        icon: ClipboardList,
        href: '/research-lab/surveys',
        color: 'bg-blue-500',
        stats: { label: 'Question Types', value: '10+' }
    },
    {
        id: 'polls',
        title: 'Quick Polls',
        description: 'Create instant polls for quick feedback. Embed in posts or share standalone with real-time results.',
        icon: Vote,
        href: '/research-lab/polls',
        color: 'bg-emerald-500',
        stats: { label: 'Real-time', value: 'Updates' }
    },
    {
        id: 'statistics',
        title: 'Statistics Tools',
        description: 'Visualize data with interactive charts, calculate statistics, and import datasets from various formats.',
        icon: BarChart3,
        href: '/research-lab/statistics',
        color: 'bg-purple-500',
        stats: { label: 'Chart Types', value: '6+' }
    },
    {
        id: 'question-advisor',
        title: 'Question Advisor',
        description: 'AI-powered assistant to refine your research questions. Get clarity scores, bias detection, and alternatives.',
        icon: Sparkles,
        href: '/research-lab/question-advisor',
        color: 'bg-amber-500',
        stats: { label: 'AI-Powered', value: 'GPT-4' }
    }
]

export default async function ResearchLabPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get some stats
    const [surveysResult, pollsResult] = await Promise.all([
        supabase.from('surveys').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('polls').select('id', { count: 'exact', head: true }).eq('is_active', true)
    ])

    const activeSurveys = surveysResult.count || 0
    const activePolls = pollsResult.count || 0

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-purple-50 dark:from-primary/10 dark:via-dark-bg dark:to-purple-900/10 py-16 md:py-24">
                    <div className="container-custom relative z-10">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                                <Sparkles className="w-4 h-4" />
                                Research Tools
                            </div>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-text dark:text-dark-text mb-6">
                                Research Lab
                            </h1>
                            <p className="text-xl text-text-light dark:text-dark-text-muted mb-8 leading-relaxed">
                                Powerful tools for researchers: create surveys, run polls, analyze data,
                                and refine your research questions with AI assistance.
                            </p>

                            {/* Quick Stats */}
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    <div>
                                        <div className="text-lg font-bold text-text dark:text-dark-text">{activeSurveys}</div>
                                        <div className="text-xs text-text-light dark:text-dark-text-muted">Active Surveys</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
                                    <Users className="w-5 h-5 text-emerald-500" />
                                    <div>
                                        <div className="text-lg font-bold text-text dark:text-dark-text">{activePolls}</div>
                                        <div className="text-xs text-text-light dark:text-dark-text-muted">Active Polls</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 dark:opacity-5">
                        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary rounded-full blur-3xl" />
                        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-purple-500 rounded-full blur-3xl" />
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-16 container-custom">
                    <div className="grid md:grid-cols-2 gap-6">
                        {features.map((feature) => {
                            const Icon = feature.icon
                            return (
                                <Link
                                    key={feature.id}
                                    href={feature.href}
                                    className="group relative bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6 hover:border-primary/50 dark:hover:border-primary/50 transition-all hover:shadow-lg"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`${feature.color} p-3 rounded-xl text-white shrink-0`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-display font-semibold text-text dark:text-dark-text mb-2 group-hover:text-primary transition-colors">
                                                {feature.title}
                                            </h3>
                                            <p className="text-text-light dark:text-dark-text-muted mb-4">
                                                {feature.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-dark-bg rounded-full text-text-light dark:text-dark-text-muted">
                                                    {feature.stats.label}: {feature.stats.value}
                                                </span>
                                                <ArrowRight className="w-5 h-5 text-gray-300 dark:text-dark-border group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </section>

                {/* Dataset Integration Section */}
                <section className="py-12 bg-gray-50 dark:bg-dark-surface/50">
                    <div className="container-custom">
                        <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border">
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                                    <Database className="w-8 h-8 text-primary" />
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-display font-semibold text-text dark:text-dark-text mb-2">
                                    Integrate Your Datasets
                                </h3>
                                <p className="text-text-light dark:text-dark-text-muted">
                                    Link your datasets from the Resources section to create visualizations,
                                    run statistical analyses, and enrich your surveys with real data.
                                </p>
                            </div>
                            <Link
                                href="/resources"
                                className="btn btn-outline whitespace-nowrap"
                            >
                                Browse Resources
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
