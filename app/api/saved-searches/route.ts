import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

// GET: Fetch user's saved searches
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: searches, error } = await supabase
            .from('saved_searches')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching saved searches:', error)
            return NextResponse.json({ error: 'Failed to fetch saved searches' }, { status: 500 })
        }

        return NextResponse.json({ searches })

    } catch (error) {
        console.error('Error in saved searches GET:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST: Save a new search
async function handlePost(request: NextRequest) {
    // SECURITY: Validate origin for CSRF protection
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
        const { query, filters, source_type, result_count, cached_results, title, notes } = body

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        const { data: search, error } = await supabase
            .from('saved_searches')
            .insert({
                user_id: user.id,
                query,
                filters: filters || {},
                source_type: source_type || 'all',
                result_count: result_count || 0,
                cached_results: cached_results || {},
                title: title || null,
                notes: notes || null
            })
            .select()
            .single()

        if (error) {
            console.error('Error saving search:', error)
            return NextResponse.json({ error: 'Failed to save search' }, { status: 500 })
        }

        return NextResponse.json({ search })

    } catch (error) {
        console.error('Error in saved searches POST:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE: Remove a saved search
async function handleDelete(request: NextRequest) {
    // SECURITY: Validate origin for CSRF protection
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

        if (!id) {
            return NextResponse.json({ error: 'Search ID is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('saved_searches')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error deleting saved search:', error)
            return NextResponse.json({ error: 'Failed to delete search' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error in saved searches DELETE:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH: Update a saved search (pin, add notes, etc.)
async function handlePatch(request: NextRequest) {
    // SECURITY: Validate origin for CSRF protection
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
        const { id, title, notes, is_pinned } = body

        if (!id) {
            return NextResponse.json({ error: 'Search ID is required' }, { status: 400 })
        }

        const updates: Record<string, any> = {}
        if (title !== undefined) updates.title = title
        if (notes !== undefined) updates.notes = notes
        if (is_pinned !== undefined) updates.is_pinned = is_pinned

        const { data: search, error } = await supabase
            .from('saved_searches')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating saved search:', error)
            return NextResponse.json({ error: 'Failed to update search' }, { status: 500 })
        }

        return NextResponse.json({ search })

    } catch (error) {
        console.error('Error in saved searches PATCH:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// SECURITY: Apply rate limiting to all mutation endpoints
export const POST = withRateLimit('write')(handlePost)
export const DELETE = withRateLimit('write')(handleDelete)
export const PATCH = withRateLimit('write')(handlePatch)
