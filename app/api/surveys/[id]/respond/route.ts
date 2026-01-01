import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
    params: Promise<{ id: string }>
}

// POST /api/surveys/[id]/respond - Submit survey response
export async function POST(request: NextRequest, { params }: RouteParams) {
    const { id } = await params
    const supabase = await createClient()

    // Get current user (optional for anonymous surveys)
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch survey to check if it's active and anonymous settings
    const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .select('id, status, is_anonymous, allow_multiple_responses')
        .eq('id', id)
        .single()

    if (surveyError || !survey) {
        return NextResponse.json(
            { error: 'Survey not found' },
            { status: 404 }
        )
    }

    if (survey.status !== 'active') {
        return NextResponse.json(
            { error: 'Survey is not active' },
            { status: 400 }
        )
    }

    // Check if user has already responded (if not allowing multiple responses)
    if (user && !survey.allow_multiple_responses) {
        const { data: existingResponse } = await supabase
            .from('survey_responses')
            .select('id')
            .eq('survey_id', id)
            .eq('respondent_id', user.id)
            .single()

        if (existingResponse) {
            return NextResponse.json(
                { error: 'You have already responded to this survey' },
                { status: 400 }
            )
        }
    }

    try {
        const body = await request.json()
        const { answers } = body

        if (!answers || typeof answers !== 'object') {
            return NextResponse.json(
                { error: 'Answers are required' },
                { status: 400 }
            )
        }

        // Create response
        const responseData: Record<string, unknown> = {
            survey_id: id,
            answers,
            is_complete: true,
            completed_at: new Date().toISOString()
        }

        // Only set respondent_id if user is logged in and survey is not anonymous
        if (user && !survey.is_anonymous) {
            responseData.respondent_id = user.id
        }

        const { data: surveyResponse, error: insertError } = await supabase
            .from('survey_responses')
            .insert(responseData)
            .select()
            .single()

        if (insertError) {
            console.error('Error submitting response:', insertError)
            return NextResponse.json(
                { error: 'Failed to submit response' },
                { status: 500 }
            )
        }

        return NextResponse.json(surveyResponse, { status: 201 })

    } catch (error) {
        console.error('Response submission error:', error)
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        )
    }
}
