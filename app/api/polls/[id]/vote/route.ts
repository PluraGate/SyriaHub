import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

// POST /api/polls/[id]/vote - Submit a vote
async function handlePost(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // SECURITY: Validate origin for CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }
    
    const { id: pollId } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const { option_ids } = await request.json()

        if (!option_ids || !Array.isArray(option_ids) || option_ids.length === 0) {
            return NextResponse.json(
                { error: 'At least one option must be selected' },
                { status: 400 }
            )
        }

        // Check if poll exists and is active
        const { data: poll, error: pollError } = await supabase
            .from('polls')
            .select('*')
            .eq('id', pollId)
            .single()

        if (pollError || !poll) {
            return NextResponse.json(
                { error: 'Poll not found' },
                { status: 404 }
            )
        }

        if (!poll.is_active) {
            return NextResponse.json(
                { error: 'Poll is no longer active' },
                { status: 400 }
            )
        }

        // Check if poll has ended
        if (poll.end_date && new Date(poll.end_date) < new Date()) {
            return NextResponse.json(
                { error: 'Poll has ended' },
                { status: 400 }
            )
        }

        // Validate option_ids
        const validOptionIds = poll.options.map((opt: any) => opt.id)
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

        // Upsert vote (user can change their vote)
        const { error: voteError } = await supabase
            .from('poll_votes')
            .upsert({
                poll_id: pollId,
                user_id: user.id,
                option_ids
            })

        if (voteError) {
            console.error('Failed to record vote:', voteError)
            return NextResponse.json(
                { error: 'Failed to record vote' },
                { status: 500 }
            )
        }

        // Fetch updated poll
        const { data: updatedPoll } = await supabase
            .from('polls')
            .select('*')
            .eq('id', pollId)
            .single()

        return NextResponse.json({
            success: true,
            poll: updatedPoll
        })

    } catch (error) {
        console.error('Vote error:', error)
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        )
    }
}

// SECURITY: Apply rate limiting to vote endpoint (write rate)
export const POST = withRateLimit('write')(handlePost as any)
