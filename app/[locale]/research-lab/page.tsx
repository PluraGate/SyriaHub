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
    Search,
    CircleDashed
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { ResearchFootprint } from '@/components/research-lab/ResearchFootprint'
import { UnansweredResearch } from '@/components/research-lab/UnansweredResearch'

export default async function ResearchLabPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const t = await getTranslations('ResearchLab')

    // Get some stats
    const [surveysResult, pollsResult] = await Promise.all([
        supabase.from('surveys').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('polls').select('id', { count: 'exact', head: true }).eq('is_active', true)
    ])

    const activeSurveys = surveysResult.count || 0
    const activePolls = pollsResult.count || 0

    // Fetch user's participation stats (My Research Footprint)
    const participationStats = {
        pollsVoted: 0,
        surveysCompleted: 0,
        lastActivity: undefined as { type: 'poll' | 'survey'; title: string; id: string; date: string } | undefined,
        recentPolls: [] as Array<{ id: string; question: string; total_votes: number; voted_at: string }>,
        recentSurveys: [] as Array<{ id: string; title: string; response_count: number; completed_at: string }>
    }

    if (user) {
        // Fetch poll votes with poll details
        const { data: pollVotes } = await supabase
            .from('poll_votes')
            .select(`
                created_at,
                poll:polls(id, question, total_votes)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)

        // Fetch survey responses with survey details
        const { data: surveyResponses } = await supabase
            .from('survey_responses')
            .select(`
                completed_at,
                survey:surveys(id, title, response_count)
            `)
            .eq('respondent_id', user.id)
            .order('completed_at', { ascending: false })
            .limit(5)

        participationStats.pollsVoted = pollVotes?.length || 0
        participationStats.surveysCompleted = surveyResponses?.length || 0

        // Map to recent polls
        if (pollVotes && pollVotes.length > 0) {
            participationStats.recentPolls = pollVotes
                .filter(v => v.poll)
                .map(v => {
                    const poll = v.poll as unknown as { id: string; question: string; total_votes: number }
                    return {
                        id: poll.id,
                        question: poll.question,
                        total_votes: poll.total_votes,
                        voted_at: v.created_at
                    }
                })
        }

        // Map to recent surveys
        if (surveyResponses && surveyResponses.length > 0) {
            participationStats.recentSurveys = surveyResponses
                .filter(r => r.survey)
                .map(r => {
                    const survey = r.survey as unknown as { id: string; title: string; response_count: number }
                    return {
                        id: survey.id,
                        title: survey.title,
                        response_count: survey.response_count,
                        completed_at: r.completed_at
                    }
                })
        }

        // Determine last activity
        const lastPollVote = pollVotes?.[0]
        const lastSurveyResponse = surveyResponses?.[0]

        if (lastPollVote && lastSurveyResponse) {
            const pollDate = new Date(lastPollVote.created_at)
            const surveyDate = new Date(lastSurveyResponse.completed_at)
            const poll = lastPollVote.poll as unknown as { id: string; question: string } | null
            const survey = lastSurveyResponse.survey as unknown as { id: string; title: string } | null
            if (pollDate > surveyDate && poll) {
                participationStats.lastActivity = {
                    type: 'poll',
                    title: poll.question,
                    id: poll.id,
                    date: lastPollVote.created_at
                }
            } else if (survey) {
                participationStats.lastActivity = {
                    type: 'survey',
                    title: survey.title,
                    id: survey.id,
                    date: lastSurveyResponse.completed_at
                }
            }
        } else if (lastPollVote?.poll) {
            const poll = lastPollVote.poll as unknown as { id: string; question: string }
            participationStats.lastActivity = {
                type: 'poll',
                title: poll.question,
                id: poll.id,
                date: lastPollVote.created_at
            }
        } else if (lastSurveyResponse?.survey) {
            const survey = lastSurveyResponse.survey as unknown as { id: string; title: string }
            participationStats.lastActivity = {
                type: 'survey',
                title: survey.title,
                id: survey.id,
                date: lastSurveyResponse.completed_at
            }
        }
    }

    // Fetch unanswered research (polls/surveys user hasn't participated in)
    // Internally named "Unanswered Research" for future priority weighting
    let unansweredItems: Array<{ id: string; title: string; type: 'poll' | 'survey'; end_date?: string | null; created_at: string }> = []
    let totalUnansweredCount = 0

    if (user) {
        // Get user's voted poll IDs
        const { data: votedPolls } = await supabase
            .from('poll_votes')
            .select('poll_id')
            .eq('user_id', user.id)
        const votedPollIds = votedPolls?.map(v => v.poll_id) || []

        // Get user's completed survey IDs
        const { data: completedSurveys } = await supabase
            .from('survey_responses')
            .select('survey_id')
            .eq('respondent_id', user.id)
        const completedSurveyIds = completedSurveys?.map(s => s.survey_id) || []

        // Fetch active polls user hasn't voted on
        let pollsQuery = supabase
            .from('polls')
            .select('id, question, end_date, created_at')
            .eq('is_active', true)
            .order('end_date', { ascending: true, nullsFirst: false })
            .limit(10)

        if (votedPollIds.length > 0) {
            pollsQuery = pollsQuery.not('id', 'in', `(${votedPollIds.join(',')})`)
        }

        const { data: openPolls } = await pollsQuery

        // Fetch active surveys user hasn't completed
        let surveysQuery = supabase
            .from('surveys')
            .select('id, title, end_date, created_at')
            .eq('status', 'active')
            .order('end_date', { ascending: true, nullsFirst: false })
            .limit(10)

        if (completedSurveyIds.length > 0) {
            surveysQuery = surveysQuery.not('id', 'in', `(${completedSurveyIds.join(',')})`)
        }

        const { data: openSurveys } = await surveysQuery

        // Combine and sort by end_date (soonest first, then by created_at)
        const now = new Date()
        const allItems: Array<{ id: string; title: string; type: 'poll' | 'survey'; end_date?: string | null; created_at: string }> = []

        openPolls?.forEach(poll => {
            // Only include if not expired
            if (!poll.end_date || new Date(poll.end_date) > now) {
                allItems.push({
                    id: poll.id,
                    title: poll.question,
                    type: 'poll',
                    end_date: poll.end_date,
                    created_at: poll.created_at
                })
            }
        })

        openSurveys?.forEach(survey => {
            // Only include if not expired
            if (!survey.end_date || new Date(survey.end_date) > now) {
                allItems.push({
                    id: survey.id,
                    title: survey.title,
                    type: 'survey',
                    end_date: survey.end_date,
                    created_at: survey.created_at
                })
            }
        })

        // Sort: items with end_date first (by soonest), then items without end_date (by created_at desc)
        allItems.sort((a, b) => {
            if (a.end_date && b.end_date) {
                return new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
            }
            if (a.end_date) return -1
            if (b.end_date) return 1
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

        totalUnansweredCount = allItems.length
        unansweredItems = allItems.slice(0, 5) // Hard cap at 5
    }

    const features = [
        {
            id: 'search',
            title: t('features.searchEngine.title'),
            description: t('features.searchEngine.description'),
            icon: Search,
            href: '/research-lab/search',
            color: 'bg-teal-500',
            stats: t('features.searchEngine.stats')
        },
        {
            id: 'research-gaps',
            title: t('features.researchGaps.title'),
            description: t('features.researchGaps.description'),
            icon: CircleDashed,
            href: '/research-gaps',
            color: 'bg-orange-500',
            stats: t('features.researchGaps.stats')
        },
        {
            id: 'surveys',
            title: t('features.surveys.title'),
            description: t('features.surveys.description'),
            icon: ClipboardList,
            href: '/research-lab/surveys',
            color: 'bg-blue-500',
            stats: t('features.surveys.stats')
        },
        {
            id: 'polls',
            title: t('features.polls.title'),
            description: t('features.polls.description'),
            icon: Vote,
            href: '/research-lab/polls',
            color: 'bg-emerald-500',
            stats: t('features.polls.stats')
        },
        {
            id: 'statistics',
            title: t('features.statistics.title'),
            description: t('features.statistics.description'),
            icon: BarChart3,
            href: '/research-lab/statistics',
            color: 'bg-purple-500',
            stats: t('features.statistics.stats')
        },
        {
            id: 'question-advisor',
            title: t('features.questionAdvisor.title'),
            description: t('features.questionAdvisor.description'),
            icon: Sparkles,
            href: '/research-lab/question-advisor',
            color: 'bg-amber-500',
            stats: t('features.questionAdvisor.stats')
        }
    ]

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
                                {t('researchTools')}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-text dark:text-dark-text mb-6">
                                {t('title')}
                            </h1>
                            <p className="text-xl text-text-light dark:text-dark-text-muted mb-8 leading-relaxed">
                                {t('heroSubtitle')}
                            </p>

                            {/* Quick Stats */}
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    <div>
                                        <div className="text-lg font-bold text-text dark:text-dark-text">{activeSurveys}</div>
                                        <div className="text-xs text-text-light dark:text-dark-text-muted">{t('activeSurveys')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-100 dark:border-dark-border">
                                    <Users className="w-5 h-5 text-emerald-500" />
                                    <div>
                                        <div className="text-lg font-bold text-text dark:text-dark-text">{activePolls}</div>
                                        <div className="text-xs text-text-light dark:text-dark-text-muted">{t('activePolls')}</div>
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



                {/* Features Grid with Sidebar */}
                <section className="py-16 container-custom">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main Features Grid */}
                        <div className="flex-1">
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
                                                            {feature.stats}
                                                        </span>
                                                        <ArrowRight className="w-5 h-5 text-gray-300 dark:text-dark-border group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Sidebar - Unanswered Research & Footprint */}
                        {user && (
                            <aside className="lg:w-80 shrink-0 space-y-8">
                                <div className="lg:sticky lg:top-24 space-y-8">
                                    <ResearchFootprint stats={participationStats} variant="sidebar" />

                                    {unansweredItems.length > 0 && (
                                        <UnansweredResearch items={unansweredItems} totalCount={totalUnansweredCount} />
                                    )}
                                </div>
                            </aside>
                        )}
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
                                    {t('datasets.title')}
                                </h3>
                                <p className="text-text-light dark:text-dark-text-muted">
                                    {t('datasets.description')}
                                </p>
                            </div>
                            <Link
                                href="/resources"
                                className="btn btn-outline whitespace-nowrap"
                            >
                                {t('datasets.browseResources')}
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
