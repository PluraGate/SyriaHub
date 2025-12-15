import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

interface RouteParams {
    params: Promise<{ token: string }>
}

// Generate or retrieve fingerprint from request
// Prioritizes client-side fingerprint (more robust) over server-side fallback
function getFingerprint(request: NextRequest): string {
    // Try to get client-side fingerprint first (Canvas, WebGL, etc.)
    const clientFingerprint = request.headers.get('x-browser-fingerprint')
    if (clientFingerprint && clientFingerprint.length >= 16) {
        return clientFingerprint
    }

    // Fallback to server-side fingerprint (IP + User Agent)
    const ip = request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create a hash of IP + User Agent for fingerprinting
    const data = `${ip}|${userAgent}`
    return crypto.createHash('sha256').update(data).digest('hex').slice(0, 32)
}

// GET /api/public/survey/[token] - Fetch survey by public token
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { token } = await params
    const supabase = await createClient()

    // Fetch survey by public token
    const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .select('id, title, description, is_anonymous, allow_multiple_responses')
        .eq('public_token', token)
        .eq('allow_public_responses', true)
        .eq('status', 'active')
        .single()

    if (surveyError || !survey) {
        return NextResponse.json(
            { error: 'Survey not found or not available' },
            { status: 404 }
        )
    }

    // Check if survey has ended
    const { data: fullSurvey } = await supabase
        .from('surveys')
        .select('end_date')
        .eq('id', survey.id)
        .single()

    if (fullSurvey?.end_date && new Date(fullSurvey.end_date) < new Date()) {
        return NextResponse.json(
            { error: 'This survey has ended' },
            { status: 400 }
        )
    }

    // Fetch questions
    const { data: questions, error: questionsError } = await supabase
        .from('survey_questions')
        .select('id, question_text, question_type, options, required, description, order_index')
        .eq('survey_id', survey.id)
        .order('order_index', { ascending: true })

    if (questionsError) {
        return NextResponse.json(
            { error: 'Failed to fetch questions' },
            { status: 500 }
        )
    }

    // Check if this fingerprint has already responded
    const fingerprint = getFingerprint(request)
    let hasResponded = false

    if (!survey.allow_multiple_responses) {
        const { data: existingResponse } = await supabase
            .from('survey_responses')
            .select('id')
            .eq('survey_id', survey.id)
            .eq('metadata->>fingerprint_hash', fingerprint)
            .single()

        hasResponded = !!existingResponse
    }

    return NextResponse.json({
        survey: {
            ...survey,
            questions: questions || []
        },
        hasResponded
    })
}

// POST /api/public/survey/[token] - Submit anonymous response
export async function POST(request: NextRequest, { params }: RouteParams) {
    const { token } = await params
    const supabase = await createClient()
    const fingerprint = getFingerprint(request)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Fetch survey
    const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .select('id, allow_multiple_responses, end_date')
        .eq('public_token', token)
        .eq('allow_public_responses', true)
        .eq('status', 'active')
        .single()

    if (surveyError || !survey) {
        return NextResponse.json(
            { error: 'Survey not found or not available' },
            { status: 404 }
        )
    }

    // Check if survey has ended
    if (survey.end_date && new Date(survey.end_date) < new Date()) {
        return NextResponse.json(
            { error: 'This survey has ended' },
            { status: 400 }
        )
    }

    // Check for duplicate response
    if (!survey.allow_multiple_responses) {
        const { data: existingResponse } = await supabase
            .from('survey_responses')
            .select('id')
            .eq('survey_id', survey.id)
            .eq('metadata->>fingerprint_hash', fingerprint)
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
                { error: 'Invalid answers format' },
                { status: 400 }
            )
        }

        // Insert response with metadata for fingerprinting
        const { error: insertError } = await supabase
            .from('survey_responses')
            .insert({
                survey_id: survey.id,
                respondent_id: null, // Anonymous
                answers,
                is_complete: true,
                metadata: {
                    fingerprint_hash: fingerprint,
                    ip_hash: crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16),
                    user_agent: userAgent.slice(0, 200),
                    source: 'public_link'
                }
            })

        if (insertError) {
            console.error('Failed to save response:', insertError)
            return NextResponse.json(
                { error: 'Failed to save response' },
                { status: 500 }
            )
        }

        // Increment response count
        await supabase.rpc('increment_survey_responses', { survey_id: survey.id })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Survey response error:', error)
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        )
    }
}
