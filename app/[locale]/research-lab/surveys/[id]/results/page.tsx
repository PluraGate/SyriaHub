import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ResearchLabNav } from '@/components/research-lab/ResearchLabNav'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    BarChart2,
    Users,
    Calendar,
    Eye
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { SurveyResultsChart } from '@/components/research-lab/SurveyResultsChart'
import { SurveyResultsActions } from '@/components/research-lab/SurveyResultsActions'
import { SurveyResponsesList } from '@/components/research-lab/SurveyResponsesList'

interface PageProps {
    params: Promise<{ id: string; locale: string }>
}

export default async function SurveyResultsPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Fetch survey
    const { data: survey, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !survey) {
        notFound()
    }

    // Check if user is the author
    if (survey.author_id !== user.id) {
        redirect(`/research-lab/surveys/${id}`)
    }

    // Fetch questions
    const { data: questions } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('survey_id', id)
        .order('order_index', { ascending: true })

    // Fetch responses (limit to 500 for performance, use count for total)
    const { count: totalResponseCount } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })
        .eq('survey_id', id)

    const { data: responses } = await supabase
        .from('survey_responses')
        .select(`
            *,
            respondent:users!respondent_id(name, email)
        `)
        .eq('survey_id', id)
        .order('completed_at', { ascending: false })
        .limit(500)

    // Process responses for visualization
    const processedResults = processResults(questions || [], responses || [])

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <div className="flex flex-1">
                <ResearchLabNav className="hidden md:flex" />

                <main className="flex-1 container-custom py-8">
                    {/* Back button */}
                    <Link
                        href={`/research-lab/surveys/${id}`}
                        className="inline-flex items-center gap-2 text-text-light dark:text-dark-text-muted hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Survey
                    </Link>

                    {/* Header */}
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-display font-bold text-text dark:text-dark-text mb-2">
                                    {survey.title} - Results
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-text-light dark:text-dark-text-muted">
                                    <span className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        {responses?.length || 0} responses
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <BarChart2 className="w-4 h-4" />
                                        {questions?.length || 0} questions
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        Created {formatDistanceToNow(new Date(survey.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/research-lab/surveys/${id}`}
                                    className="btn btn-outline flex items-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    View Survey
                                </Link>
                                <SurveyResultsActions
                                    surveyId={id}
                                    surveyTitle={survey.title}
                                    questions={questions?.map(q => ({
                                        id: q.id,
                                        question_text: q.question_text,
                                        question_type: q.question_type,
                                        options: q.options
                                    })) || []}
                                    responses={responses?.map(r => ({
                                        id: r.id,
                                        answers: r.answers,
                                        completed_at: r.completed_at,
                                        respondent: r.respondent
                                    })) || []}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    {responses && responses.length > 0 ? (
                        <>
                            <div className="space-y-6">
                                {processedResults.map((result, index) => (
                                    <div
                                        key={result.questionId}
                                        className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6"
                                    >
                                        <div className="flex items-start gap-3 mb-4">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-text dark:text-dark-text">
                                                    {result.questionText}
                                                </h3>
                                                <p className="text-sm text-text-light dark:text-dark-text-muted">
                                                    {result.responseCount} responses • {result.questionType.replace('_', ' ')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="ml-9">
                                            <SurveyResultsChart result={result} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Individual Responses with Pagination */}
                            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 mt-6">
                                <SurveyResponsesList
                                    responses={responses?.map(r => ({
                                        id: r.id,
                                        answers: r.answers as Record<string, unknown>,
                                        completed_at: r.completed_at,
                                        respondent: r.respondent
                                    })) || []}
                                    questions={questions?.map(q => ({
                                        id: q.id,
                                        question_text: q.question_text,
                                        question_type: q.question_type,
                                        options: q.options as Array<{ id: string; text: string }>
                                    })) || []}
                                    totalCount={totalResponseCount || 0}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-12 text-center">
                            <BarChart2 className="w-16 h-16 mx-auto text-gray-300 dark:text-dark-text-muted mb-4" />
                            <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-2">
                                No responses yet
                            </h2>
                            <p className="text-text-light dark:text-dark-text-muted mb-6">
                                Share your survey to start collecting responses.
                            </p>
                            {survey.status === 'draft' && (
                                <Link
                                    href={`/research-lab/surveys/${id}/edit`}
                                    className="btn btn-primary"
                                >
                                    Publish Survey
                                </Link>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <Footer />
        </div>
    )
}

interface ProcessedResult {
    questionId: string
    questionText: string
    questionType: string
    responseCount: number
    data: Record<string, unknown>
}

function processResults(
    questions: Array<{ id: string; question_text: string; question_type: string; options?: unknown }>,
    responses: Array<{ answers: Record<string, unknown> }>
): ProcessedResult[] {
    return questions.map(question => {
        const answers = responses
            .map(r => r.answers[question.id])
            .filter(a => a !== undefined && a !== null && a !== '')

        const result: ProcessedResult = {
            questionId: question.id,
            questionText: question.question_text,
            questionType: question.question_type,
            responseCount: answers.length,
            data: {}
        }

        switch (question.question_type) {
            case 'single_choice':
            case 'multiple_choice': {
                const options = (question.options as Array<{ id: string; text: string }>) || []
                const counts: Record<string, number> = {}

                options.forEach(opt => {
                    counts[opt.id] = 0
                })

                answers.forEach(answer => {
                    if (Array.isArray(answer)) {
                        answer.forEach(id => {
                            if (counts[id] !== undefined) counts[id]++
                        })
                    } else if (typeof answer === 'string' && counts[answer] !== undefined) {
                        counts[answer]++
                    }
                })

                result.data = {
                    type: 'bar',
                    options: options.map(opt => ({
                        label: opt.text,
                        value: counts[opt.id] || 0,
                        percentage: answers.length > 0
                            ? Math.round((counts[opt.id] / answers.length) * 100)
                            : 0
                    }))
                }
                break
            }

            case 'scale':
            case 'rating':
            case 'number': {
                const numbers = answers.filter(a => typeof a === 'number') as number[]
                const sum = numbers.reduce((acc, n) => acc + n, 0)
                const avg = numbers.length > 0 ? sum / numbers.length : 0
                const min = numbers.length > 0 ? Math.min(...numbers) : 0
                const max = numbers.length > 0 ? Math.max(...numbers) : 0

                result.data = {
                    type: 'stats',
                    average: Math.round(avg * 10) / 10,
                    min,
                    max,
                    distribution: calculateDistribution(numbers, question.question_type)
                }
                break
            }

            case 'text':
            case 'long_text': {
                result.data = {
                    type: 'text',
                    responses: answers.slice(0, 20) // Show first 20 responses
                }
                break
            }

            case 'date': {
                result.data = {
                    type: 'text',
                    responses: answers.slice(0, 20)
                }
                break
            }

            default:
                result.data = {
                    type: 'text',
                    responses: answers.slice(0, 20)
                }
        }

        return result
    })
}

function calculateDistribution(numbers: number[], type: string): Array<{ value: number; count: number }> {
    if (numbers.length === 0) return []

    const counts: Record<number, number> = {}
    const maxValue = type === 'rating' ? 5 : 10

    for (let i = 1; i <= maxValue; i++) {
        counts[i] = 0
    }

    numbers.forEach(n => {
        if (counts[n] !== undefined) counts[n]++
    })

    return Object.entries(counts).map(([value, count]) => ({
        value: parseInt(value),
        count
    }))
}
