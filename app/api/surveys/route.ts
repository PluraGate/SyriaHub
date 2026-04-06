import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit, applyRateLimit } from '@/lib/rateLimit'
import { validateOrigin } from '@/lib/apiUtils'

// GET /api/surveys - List surveys
export async function GET(request: NextRequest) {
    const rateLimit = await applyRateLimit(request, 'read')
    if (!rateLimit.allowed && rateLimit.response) return rateLimit.response

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const authorId = searchParams.get('author_id')

    let query = supabase
        .from('surveys')
        .select(`
            *,
            author:users!author_id(name)
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
async function handlePost(request: NextRequest) {
    // CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

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
            status,
            data_source_type,
            data_source_label
        } = body

        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }

        const validSourceTypes = ['community', 'external', 'mixed']
        if (data_source_type && !validSourceTypes.includes(data_source_type)) {
            return NextResponse.json({ error: 'Invalid data_source_type' }, { status: 400 })
        }
        const sourceLabel = (data_source_label as string | undefined)?.trim() || null
        if (sourceLabel && sourceLabel.length > 200) {
            return NextResponse.json({ error: 'data_source_label exceeds 200 characters' }, { status: 400 })
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
                status: status || 'draft',
                data_source_type: data_source_type || null,
                data_source_label: sourceLabel
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
            const questionsToInsert = questions.map((q: { question_text: string; question_type?: string; options?: unknown; required?: boolean; description?: string; validation_rules?: unknown; conditional_logic?: unknown }, index: number) => ({
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

export const POST = withRateLimit('write')(handlePost)
