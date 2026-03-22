import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit, applyRateLimit } from '@/lib/rateLimit'
import { validateOrigin } from '@/lib/apiUtils'

// GET /api/polls - Get all active polls
export async function GET(request: NextRequest) {
    const rateLimit = await applyRateLimit(request, 'read')
    if (!rateLimit.allowed && rateLimit.response) return rateLimit.response

    const supabase = await createClient()

    const { data: polls, error } = await supabase
        .from('polls')
        .select(`
            *,
            author:users!author_id(name)
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
        const { question, description, options, is_multiple_choice, end_date, data_source_type, data_source_label } = body

        if (!question || !options || !Array.isArray(options) || options.length < 2) {
            return NextResponse.json(
                { error: 'Question and at least 2 options are required' },
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

        // Validate and format options
        const formattedOptions = options.map((opt: { text?: string; label?: string; id?: string }, index: number) => {
            const text: string = (typeof opt === 'string' ? opt : opt.text) || ''
            if (!text.trim()) {
                throw Object.assign(new Error('Option text cannot be empty'), { status: 400 })
            }
            if (text.length > 500) {
                throw Object.assign(new Error(`Option ${index + 1} text exceeds 500 characters`), { status: 400 })
            }
            return { id: opt.id || `opt_${index}`, text: text.trim(), vote_count: 0 }
        })

        const { data: poll, error } = await supabase
            .from('polls')
            .insert({
                question,
                description,
                options: formattedOptions,
                is_multiple_choice: is_multiple_choice || false,
                end_date: end_date || null,
                author_id: user.id,
                data_source_type: data_source_type || null,
                data_source_label: sourceLabel
            })
            .select(`
                *,
                author:users!author_id(name)
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
        const msg = error instanceof Error ? error.message : 'Invalid request'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any)?.status === 400 ? 400 : 400
        return NextResponse.json({ error: msg }, { status })
    }
}

// SECURITY: Apply rate limiting to poll creation
export const POST = withRateLimit('write')(handlePost)
