import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/surveys - List surveys
export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const authorId = searchParams.get('author_id')

    let query = supabase
        .from('surveys')
        .select(`
            *,
            author:users!author_id(name, email)
        `)
        .order('created_at', { ascending: false })

    if (status) {
        query = query.eq('status', status)
    }
    if (authorId) {
        query = query.eq('author_id', authorId)
    }

    const { data: surveys, error } = await query

    if (error) {
        return NextResponse.json(
            { error: 'Failed to fetch surveys' },
            { status: 500 }
        )
    }

    return NextResponse.json(surveys)
}

// POST /api/surveys - Create a new survey
export async function POST(request: NextRequest) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const body = await request.json()
        const {
            title,
            description,
            questions,
            is_anonymous,
            allow_multiple_responses,
            start_date,
            end_date,
            settings,
            status
        } = body

        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }

        // Create survey
        const { data: survey, error: surveyError } = await supabase
            .from('surveys')
            .insert({
                title,
                description,
                author_id: user.id,
                is_anonymous: is_anonymous || false,
                allow_multiple_responses: allow_multiple_responses || false,
                start_date,
                end_date,
                settings: settings || {},
                status: status || 'draft'
            })
            .select()
            .single()

        if (surveyError) {
            console.error('Failed to create survey:', surveyError)
            return NextResponse.json(
                { error: 'Failed to create survey' },
                { status: 500 }
            )
        }

        // Create questions if provided
        if (questions && Array.isArray(questions) && questions.length > 0) {
            const questionsToInsert = questions.map((q: any, index: number) => ({
                survey_id: survey.id,
                question_text: q.question_text,
                question_type: q.question_type || 'text',
                options: q.options || null,
                required: q.required || false,
                order_index: index,
                description: q.description || null,
                validation_rules: q.validation_rules || null,
                conditional_logic: q.conditional_logic || null
            }))

            const { error: questionsError } = await supabase
                .from('survey_questions')
                .insert(questionsToInsert)

            if (questionsError) {
                console.error('Failed to create questions:', questionsError)
                // Don't fail the whole request, survey was created
            }
        }

        return NextResponse.json(survey, { status: 201 })

    } catch (error) {
        console.error('Survey creation error:', error)
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        )
    }
}
