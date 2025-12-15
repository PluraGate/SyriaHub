import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ResearchLabNav } from '@/components/research-lab/ResearchLabNav'
import { SurveyBuilder } from '@/components/research-lab/SurveyBuilder'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string; locale: string }>
}

export default async function EditSurveyPage({ params }: PageProps) {
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

    // Transform questions to match SurveyBuilder expected format
    const existingSurvey = {
        ...survey,
        questions: questions?.map(q => ({
            id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options || [],
            required: q.required,
            description: q.description
        })) || []
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar user={user} />

            <div className="flex flex-1">
                <div className="hidden lg:block">
                    <ResearchLabNav />
                </div>

                <main className="flex-1 container-custom py-8">
                    <SurveyBuilder userId={user.id} existingSurvey={existingSurvey} />
                </main>
            </div>

            <Footer />
        </div>
    )
}
