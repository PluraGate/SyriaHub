import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ResearchLabNav } from '@/components/research-lab/ResearchLabNav'
import { SurveyAuthorActions } from '@/components/research-lab/SurveyAuthorActions'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Edit,
    BarChart2,
    Calendar,
    Users,
    Lock,
    Globe
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { SurveyTakeForm } from '@/components/research-lab/SurveyTakeForm'

interface PageProps {
    params: Promise<{ id: string; locale: string }>
}

const statusColors = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    closed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    archived: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}

export default async function SurveyPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch survey with questions
    const { data: survey, error } = await supabase
        .from('surveys')
        .select(`
            *,
            author:users!author_id(id, name, email, avatar_url)
        `)
        .eq('id', id)
        .single()

    if (error || !survey) {
        notFound()
    }

    // Fetch questions
    const { data: questions } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('survey_id', id)
        .order('order_index', { ascending: true })

    // Check if user has already responded
    let hasResponded = false
    if (user && !survey.allow_multiple_responses) {
        const { data: existingResponse } = await supabase
            .from('survey_responses')
            .select('id')
            .eq('survey_id', id)
            .eq('respondent_id', user.id)
            .single()

        hasResponded = !!existingResponse
    }

    const isAuthor = user?.id === survey.author_id
    const canTakeSurvey = survey.status === 'active' && !isAuthor && !hasResponded

    // If not the author and survey is not active, show appropriate message
    if (!isAuthor && survey.status !== 'active') {
        return (
            <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
                <Navbar user={user} />
                <div className="flex flex-1">
                    <div className="hidden lg:block">
                        <ResearchLabNav />
                    </div>
                    <main className="flex-1 container-custom py-8">
                        <div className="text-center py-16">
                            <Lock className="w-16 h-16 mx-auto text-gray-300 dark:text-dark-text-muted mb-4" />
                            <h1 className="text-2xl font-bold text-text dark:text-dark-text mb-2">
                                Survey Not Available
                            </h1>
                            <p className="text-text-light dark:text-dark-text-muted mb-6">
                                This survey is currently not accepting responses.
                            </p>
                            <Link
                                href="/research-lab/surveys"
                                className="btn btn-primary"
                            >
                                Browse Surveys
                            </Link>
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <div className="flex flex-1">
                <div className="hidden lg:block">
                    <ResearchLabNav />
                </div>

                <main className="flex-1 container-custom py-8">
                    {/* Back button */}
                    <Link
                        href="/research-lab/surveys"
                        className="inline-flex items-center gap-2 text-text-light dark:text-dark-text-muted hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Surveys
                    </Link>

                    {/* Survey Header */}
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-display font-bold text-text dark:text-dark-text">
                                        {survey.title}
                                    </h1>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[survey.status as keyof typeof statusColors]}`}>
                                        {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                                    </span>
                                </div>
                                {survey.description && (
                                    <p className="text-text-light dark:text-dark-text-muted mb-4">
                                        {survey.description}
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-text-light dark:text-dark-text-muted">
                                    <span className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        {survey.response_count || 0} responses
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        Created {formatDistanceToNow(new Date(survey.created_at), { addSuffix: true })}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        {survey.is_anonymous ? (
                                            <>
                                                <Lock className="w-4 h-4" />
                                                Anonymous
                                            </>
                                        ) : (
                                            <>
                                                <Globe className="w-4 h-4" />
                                                Identified
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Author Actions */}
                            {isAuthor && (
                                <SurveyAuthorActions
                                    surveyId={id}
                                    surveyTitle={survey.title}
                                    publicToken={survey.public_token}
                                    allowPublicResponses={survey.allow_public_responses}
                                />
                            )}
                        </div>

                        {/* Author Info */}
                        <div className="pt-4 border-t border-gray-200 dark:border-dark-border">
                            <p className="text-sm text-text-light dark:text-dark-text-muted">
                                Created by{' '}
                                <span className="font-medium text-text dark:text-dark-text">
                                    {survey.author?.name || survey.author?.email?.split('@')[0] || 'Anonymous'}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Survey Content */}
                    {isAuthor ? (
                        // Author Preview
                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                            <h2 className="text-lg font-semibold text-text dark:text-dark-text mb-4">
                                Survey Preview ({questions?.length || 0} questions)
                            </h2>
                            {questions && questions.length > 0 ? (
                                <div className="space-y-4">
                                    {questions.map((question: Record<string, unknown>, index: number) => (
                                        <div
                                            key={question.id as string}
                                            className="p-4 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                                                    {index + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="font-medium text-text dark:text-dark-text">
                                                        {question.question_text as string}
                                                        {question.required && <span className="text-red-500 ml-1">*</span>}
                                                    </p>
                                                    <p className="text-sm text-text-light dark:text-dark-text-muted mt-1">
                                                        Type: {(question.question_type as string).replace('_', ' ')}
                                                    </p>
                                                    {question.options && Array.isArray(question.options) && (
                                                        <div className="mt-2 space-y-1">
                                                            {(question.options as Array<{ id: string; text: string }>).map((opt) => (
                                                                <div key={opt.id} className="text-sm text-text-light dark:text-dark-text-muted flex items-center gap-2">
                                                                    <span className="w-3 h-3 rounded-full border border-gray-300 dark:border-dark-border"></span>
                                                                    {opt.text}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-text-light dark:text-dark-text-muted py-8">
                                    No questions added yet. Click "Edit" to add questions.
                                </p>
                            )}
                        </div>
                    ) : canTakeSurvey ? (
                        // Take Survey Form
                        <SurveyTakeForm
                            surveyId={id}
                            questions={questions || []}
                            isAnonymous={survey.is_anonymous}
                        />
                    ) : hasResponded ? (
                        // Already Responded
                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-8 text-center">
                            <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-2">
                                Thank you for your response!
                            </h2>
                            <p className="text-text-light dark:text-dark-text-muted">
                                You have already submitted a response to this survey.
                            </p>
                        </div>
                    ) : null}
                </main>
            </div>

            <Footer />
        </div>
    )
}
