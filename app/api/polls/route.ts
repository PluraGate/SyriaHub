import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/rateLimit'
import { validateOrigin } from '@/lib/apiUtils'

// GET /api/polls - Get all active polls
export async function GET(request: NextRequest) {
    const supabase = await createClient()

    const { data: polls, error } = await supabase
        .from('polls')
        .select(`
            *,
            author:users!author_id(name, email)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json(
            { error: 'Failed to fetch polls' },
            { status: 500 }
        )
    }

    return NextResponse.json(polls)
}

// POST /api/polls - Create a new poll
async function handlePost(request: NextRequest) {
    // SECURITY: Validate origin for CSRF protection
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
        const { question, description, options, is_multiple_choice, end_date } = body

        if (!question || !options || !Array.isArray(options) || options.length < 2) {
            return NextResponse.json(
                { error: 'Question and at least 2 options are required' },
                { status: 400 }
            )
        }

        // Format options with IDs and vote counts
        const formattedOptions = options.map((opt: any, index: number) => ({
            id: opt.id || `opt_${index}`,
            text: typeof opt === 'string' ? opt : opt.text,
            vote_count: 0
        }))

        const { data: poll, error } = await supabase
            .from('polls')
            .insert({
                question,
                description,
                options: formattedOptions,
                is_multiple_choice: is_multiple_choice || false,
                end_date: end_date || null,
                author_id: user.id
            })
            .select(`
                *,
                author:users!author_id(name, email)
            `)
            .single()

        if (error) {
            console.error('Failed to create poll:', error)
            return NextResponse.json(
                { error: 'Failed to create poll' },
                { status: 500 }
            )
        }

        return NextResponse.json(poll, { status: 201 })

    } catch (error) {
        console.error('Poll creation error:', error)
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        )
    }
}

// SECURITY: Apply rate limiting to poll creation
export const POST = withRateLimit('write')(handlePost)
