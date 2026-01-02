import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/polls/[id] - Fetch individual poll with vote details
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch poll with author info
    const { data: poll, error: pollError } = await supabase
        .from('polls')
        .select(`
            *,
            author:users!author_id(id, name, email, avatar_url)
        `)
        .eq('id', id)
        .single()

    if (pollError || !poll) {
        return NextResponse.json(
            { error: 'Poll not found' },
            { status: 404 }
        )
    }

    // Check if current user has voted
    const { data: { user } } = await supabase.auth.getUser()
    let userVote = null

    if (user) {
        const { data: vote } = await supabase
            .from('poll_votes')
            .select('option_ids')
            .eq('poll_id', id)
            .eq('user_id', user.id)
            .single()

        userVote = vote?.option_ids || null
    }

    return NextResponse.json({
        ...poll,
        userVote,
        isAuthor: user?.id === poll.author_id
    })
}

// PUT /api/polls/[id] - Update poll
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
    const { data: poll } = await supabase
        .from('polls')
        .select('author_id, total_votes')
        .eq('id', id)
        .single()

    if (!poll || poll.author_id !== user.id) {
        return NextResponse.json(
            { error: 'Not authorized to update this poll' },
            { status: 403 }
        )
    }

    // Don't allow editing if poll has votes
    if (poll.total_votes > 0) {
        return NextResponse.json(
            { error: 'Cannot edit a poll that has votes. Close it instead.' },
            { status: 400 }
        )
    }

    try {
        const body = await request.json()
        const {
            question,
            description,
            options,
            is_multiple_choice,
            is_anonymous,
            show_results_before_vote,
            end_date,
            is_active
        } = body

        // Build update object
        const updateData: Record<string, unknown> = {}
        if (question !== undefined) updateData.question = question
        if (description !== undefined) updateData.description = description
        if (is_multiple_choice !== undefined) updateData.is_multiple_choice = is_multiple_choice
        if (is_anonymous !== undefined) updateData.is_anonymous = is_anonymous
        if (show_results_before_vote !== undefined) updateData.show_results_before_vote = show_results_before_vote
        if (end_date !== undefined) updateData.end_date = end_date
        if (is_active !== undefined) updateData.is_active = is_active

        // Format options if provided
        if (options && Array.isArray(options)) {
            updateData.options = options.map((opt: { id?: string; text: string }, index: number) => ({
                id: opt.id || `opt_${index}`,
                text: typeof opt === 'string' ? opt : opt.text,
                vote_count: 0
            }))
        }

        const { data: updatedPoll, error: updateError } = await supabase
            .from('polls')
            .update(updateData)
            .eq('id', id)
            .select(`
                *,
                author:users!author_id(name, email)
            `)
            .single()

        if (updateError) {
            console.error('Error updating poll:', updateError)
            return NextResponse.json(
                { error: 'Failed to update poll' },
                { status: 500 }
            )
        }

        return NextResponse.json(updatedPoll)

    } catch (error) {
        console.error('Poll update error:', error)
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        )
    }
}

// DELETE /api/polls/[id] - Delete poll
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
    const { data: poll } = await supabase
        .from('polls')
        .select('author_id')
        .eq('id', id)
        .single()

    if (!poll || poll.author_id !== user.id) {
        return NextResponse.json(
            { error: 'Not authorized to delete this poll' },
            { status: 403 }
        )
    }

    const { error: deleteError } = await supabase
        .from('polls')
        .delete()
        .eq('id', id)

    if (deleteError) {
        console.error('Error deleting poll:', deleteError)
        return NextResponse.json(
            { error: 'Failed to delete poll' },
            { status: 500 }
        )
    }

    return NextResponse.json({ success: true })
}

export const PUT = withRateLimit('write')(handlePut)
export const DELETE = withRateLimit('write')(handleDelete)
