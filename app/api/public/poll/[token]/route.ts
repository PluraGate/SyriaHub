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

    const data = `${ip}|${userAgent}`
    return crypto.createHash('sha256').update(data).digest('hex').slice(0, 32)
}

// GET /api/public/poll/[token] - Fetch poll by public token
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { token } = await params
    const supabase = await createClient()
    const fingerprint = getFingerprint(request)

    // Fetch poll by public token
    const { data: poll, error: pollError } = await supabase
        .from('polls')
        .select('id, question, description, options, is_multiple_choice, show_results_before_vote, end_date, total_votes')
        .eq('public_token', token)
        .eq('allow_public_responses', true)
        .eq('is_active', true)
        .single()

    if (pollError || !poll) {
        return NextResponse.json(
            { error: 'Poll not found or not available' },
            { status: 404 }
        )
    }

    // Check if poll has ended
    if (poll.end_date && new Date(poll.end_date) < new Date()) {
        return NextResponse.json(
            { error: 'This poll has ended' },
            { status: 400 }
        )
    }

    // Check if this fingerprint has already voted
    const { data: existingVote } = await supabase
        .from('poll_public_votes')
        .select('id, option_ids')
        .eq('poll_id', poll.id)
        .eq('fingerprint_hash', fingerprint)
        .single()

    return NextResponse.json({
        poll,
        hasVoted: !!existingVote,
        userVote: existingVote?.option_ids || null
    })
}

// POST /api/public/poll/[token] - Submit anonymous vote
export async function POST(request: NextRequest, { params }: RouteParams) {
    const { token } = await params
    const supabase = await createClient()
    const fingerprint = getFingerprint(request)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Fetch poll
    const { data: poll, error: pollError } = await supabase
        .from('polls')
        .select('id, options, is_multiple_choice, end_date')
        .eq('public_token', token)
        .eq('allow_public_responses', true)
        .eq('is_active', true)
        .single()

    if (pollError || !poll) {
        return NextResponse.json(
            { error: 'Poll not found or not available' },
            { status: 404 }
        )
    }

    // Check if poll has ended
    if (poll.end_date && new Date(poll.end_date) < new Date()) {
        return NextResponse.json(
            { error: 'This poll has ended' },
            { status: 400 }
        )
    }

    // Check for duplicate vote
    const { data: existingVote } = await supabase
        .from('poll_public_votes')
        .select('id')
        .eq('poll_id', poll.id)
        .eq('fingerprint_hash', fingerprint)
        .single()

    if (existingVote) {
        return NextResponse.json(
            { error: 'You have already voted on this poll' },
            { status: 400 }
        )
    }

    try {
        const body = await request.json()
        const { option_ids } = body

        if (!option_ids || !Array.isArray(option_ids) || option_ids.length === 0) {
            return NextResponse.json(
                { error: 'At least one option must be selected' },
                { status: 400 }
            )
        }

        // Validate option_ids
        const validOptionIds = (poll.options as Array<{ id: string }>).map(opt => opt.id)
        const invalidOptions = option_ids.filter(id => !validOptionIds.includes(id))
        if (invalidOptions.length > 0) {
            return NextResponse.json(
                { error: 'Invalid option selected' },
                { status: 400 }
            )
        }

        // Check multiple choice constraint
        if (!poll.is_multiple_choice && option_ids.length > 1) {
            return NextResponse.json(
                { error: 'Only one option can be selected' },
                { status: 400 }
            )
        }

        // Insert vote
        const { error: voteError } = await supabase
            .from('poll_public_votes')
            .insert({
                poll_id: poll.id,
                option_ids,
                fingerprint_hash: fingerprint,
                ip_hash: crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16),
                user_agent: userAgent.slice(0, 200)
            })

        if (voteError) {
            console.error('Failed to record vote:', voteError)
            return NextResponse.json(
                { error: 'Failed to record vote' },
                { status: 500 }
            )
        }

        // Update vote counts in poll options
        const updatedOptions = (poll.options as Array<{ id: string; text: string; vote_count: number }>).map(opt => ({
            ...opt,
            vote_count: option_ids.includes(opt.id) ? (opt.vote_count || 0) + 1 : (opt.vote_count || 0)
        }))

        await supabase
            .from('polls')
            .update({
                options: updatedOptions,
                total_votes: ((poll as Record<string, unknown>).total_votes as number || 0) + 1
            })
            .eq('id', poll.id)

        return NextResponse.json({
            success: true,
            options: updatedOptions
        })

    } catch (error) {
        console.error('Poll vote error:', error)
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        )
    }
}
