import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/surveys/[id] - Fetch individual survey with questions
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch survey with author info
    const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .select(`
            *,
            author:users!author_id(id, name, email, avatar_url)
        `)
        .eq('id', id)
        .single()

    if (surveyError || !survey) {
        return NextResponse.json(
            { error: 'Survey not found' },
            { status: 404 }
        )
    }

    // Fetch questions for this survey
    const { data: questions, error: questionsError } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('survey_id', id)
        .order('order_index', { ascending: true })

    if (questionsError) {
        console.error('Error fetching questions:', questionsError)
    }

    // Check if current user has already responded
    const { data: { user } } = await supabase.auth.getUser()
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

    return NextResponse.json({
        ...survey,
        questions: questions || [],
        hasResponded,
        isAuthor: user?.id === survey.author_id
    })
}

// PUT /api/surveys/[id] - Update survey
async function handlePut(request: NextRequest, { params }: RouteParams) {
    // CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    // Check if user is the author
    const { data: survey } = await supabase
        .from('surveys')
        .select('author_id')
        .eq('id', id)
        .single()

    if (!survey || survey.author_id !== user.id) {
        return NextResponse.json(
            { error: 'Not authorized to update this survey' },
            { status: 403 }
        )
    }

    try {
        const body = await request.json()
        const {
            title,
            description,
            status,
            is_anonymous,
            allow_multiple_responses,
            start_date,
            end_date,
            settings,
            questions
        } = body

        // Update survey
        const updateData: Record<string, unknown> = {}
        if (title !== undefined) updateData.title = title
        if (description !== undefined) updateData.description = description
        if (status !== undefined) updateData.status = status
        if (is_anonymous !== undefined) updateData.is_anonymous = is_anonymous
        if (allow_multiple_responses !== undefined) updateData.allow_multiple_responses = allow_multiple_responses
        if (start_date !== undefined) updateData.start_date = start_date
        if (end_date !== undefined) updateData.end_date = end_date
        if (settings !== undefined) updateData.settings = settings

        const { data: updatedSurvey, error: updateError } = await supabase
            .from('surveys')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            console.error('Error updating survey:', updateError)
            return NextResponse.json(
                { error: 'Failed to update survey' },
                { status: 500 }
            )
        }

        // Update questions if provided
        if (questions && Array.isArray(questions)) {
            // Delete existing questions
            await supabase
                .from('survey_questions')
                .delete()
                .eq('survey_id', id)

            // Insert new questions
            if (questions.length > 0) {
                const questionsToInsert = questions.map((q: Record<string, unknown>, index: number) => ({
                    survey_id: id,
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
                    console.error('Error updating questions:', questionsError)
                }
            }
        }

        return NextResponse.json(updatedSurvey)

    } catch (error) {
        console.error('Survey update error:', error)
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        )
    }
}

// DELETE /api/surveys/[id] - Delete survey
async function handleDelete(request: NextRequest, { params }: RouteParams) {
    // CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    // Check if user is the author
    const { data: survey } = await supabase
        .from('surveys')
        .select('author_id')
        .eq('id', id)
        .single()

    if (!survey || survey.author_id !== user.id) {
        return NextResponse.json(
            { error: 'Not authorized to delete this survey' },
            { status: 403 }
        )
    }

    const { error: deleteError } = await supabase
        .from('surveys')
        .delete()
        .eq('id', id)

    if (deleteError) {
        console.error('Error deleting survey:', deleteError)
        return NextResponse.json(
            { error: 'Failed to delete survey' },
            { status: 500 }
        )
    }

    return NextResponse.json({ success: true })
}

export const PUT = withRateLimit('write')(handlePut)
export const DELETE = withRateLimit('write')(handleDelete)
