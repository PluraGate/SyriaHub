import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

// GET: Fetch user's saved references
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: references, error } = await supabase
            .from('saved_references')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching saved references:', error)
            return NextResponse.json({ error: 'Failed to fetch references' }, { status: 500 })
        }

        return NextResponse.json({ references })

    } catch (error) {
        console.error('Error in saved references GET:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST: Save a new reference
async function handlePost(request: NextRequest) {
    // CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, url, snippet, source, citation, notes, tags } = body

        if (!title || !url) {
            return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 })
        }

        // Check if already saved
        const { data: existing } = await supabase
            .from('saved_references')
            .select('id')
            .eq('user_id', user.id)
            .eq('url', url)
            .single()

        if (existing) {
            return NextResponse.json({ error: 'Already saved', existing: true }, { status: 409 })
        }

        const { data: reference, error } = await supabase
            .from('saved_references')
            .insert({
                user_id: user.id,
                title,
                url,
                snippet: snippet || null,
                source: source || null,
                citation: citation || null,
                notes: notes || null,
                tags: tags || null
            })
            .select()
            .single()

        if (error) {
            console.error('Error saving reference:', error)
            return NextResponse.json({ error: 'Failed to save reference' }, { status: 500 })
        }

        return NextResponse.json({ reference })

    } catch (error) {
        console.error('Error in saved references POST:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE: Remove a saved reference
async function handleDelete(request: NextRequest) {
    // CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const url = searchParams.get('url')

        if (!id && !url) {
            return NextResponse.json({ error: 'ID or URL is required' }, { status: 400 })
        }

        let query = supabase.from('saved_references').delete().eq('user_id', user.id)

        if (id) {
            query = query.eq('id', id)
        } else if (url) {
            query = query.eq('url', url)
        }

        const { error } = await query

        if (error) {
            console.error('Error deleting saved reference:', error)
            return NextResponse.json({ error: 'Failed to delete reference' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error in saved references DELETE:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export const POST = withRateLimit('write')(handlePost)
export const DELETE = withRateLimit('write')(handleDelete)
