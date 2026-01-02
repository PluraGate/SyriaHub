import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

interface RouteParams {
    params: Promise<{ threadId: string }>
}

// GET /api/coordination/[threadId] - Get thread with messages
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { threadId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!userData || !['admin', 'moderator'].includes(userData.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Call RPC function
    const { data, error } = await supabase.rpc('get_coordination_thread', {
        p_thread_id: threadId
    })

    if (error) {
        console.error('Error fetching coordination thread:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data?.success) {
        return NextResponse.json(
            { error: data?.error || 'Thread not found' },
            { status: 404 }
        )
    }

    return NextResponse.json(data)
}

// PATCH /api/coordination/[threadId] - Update thread (archive, priority, etc.)
async function handlePatch(request: NextRequest, { params }: RouteParams) {
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    const { threadId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role
    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!userData || !['admin', 'moderator'].includes(userData.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const { action, reason, priority } = body

        // Handle archive action
        if (action === 'archive') {
            // Only admins can archive
            if (userData.role !== 'admin') {
                return NextResponse.json(
                    { error: 'Only admins can archive threads' },
                    { status: 403 }
                )
            }

            const { data, error } = await supabase.rpc('archive_coordination_thread', {
                p_thread_id: threadId,
                p_reason: reason || null
            })

            if (error) {
                console.error('Error archiving thread:', error)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }

            if (!data?.success) {
                return NextResponse.json(
                    { error: data?.error || 'Failed to archive thread' },
                    { status: 400 }
                )
            }

            return NextResponse.json({ success: true })
        }

        // Handle priority update
        if (priority) {
            const validPriorities = ['low', 'normal', 'high', 'urgent']
            if (!validPriorities.includes(priority)) {
                return NextResponse.json(
                    { error: 'Invalid priority. Must be: low, normal, high, or urgent' },
                    { status: 400 }
                )
            }

            const { error } = await supabase
                .from('coordination_threads')
                .update({ priority, updated_at: new Date().toISOString() })
                .eq('id', threadId)

            if (error) {
                console.error('Error updating priority:', error)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }

            return NextResponse.json({ success: true })
        }

        return NextResponse.json(
            { error: 'No valid action specified' },
            { status: 400 }
        )
    } catch (error) {
        console.error('Error parsing request:', error)
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
}

export const PATCH = withRateLimit('write')(handlePatch)
