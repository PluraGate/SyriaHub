import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/coordination - List coordination threads
export async function GET(request: NextRequest) {
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

    // Parse query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const objectType = searchParams.get('objectType') || null
    const objectState = searchParams.get('objectState') || null
    const priority = searchParams.get('priority') || null
    const includeArchived = searchParams.get('includeArchived') === 'true'

    // Call RPC function
    const { data, error } = await supabase.rpc('list_coordination_threads', {
        p_page: page,
        p_page_size: pageSize,
        p_object_type: objectType,
        p_object_state: objectState,
        p_priority: priority,
        p_include_archived: includeArchived
    })

    if (error) {
        console.error('Error listing coordination threads:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (data?.error) {
        return NextResponse.json({ error: data.error }, { status: 403 })
    }

    return NextResponse.json(data)
}

// POST /api/coordination - Create new coordination thread
export async function POST(request: NextRequest) {
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
        const {
            objectType,
            objectId,
            title,
            description,
            priority = 'normal',
            initialMessage,
            initialMessageType = 'NOTE'
        } = body

        if (!objectType || !objectId || !title) {
            return NextResponse.json(
                { error: 'objectType, objectId, and title are required' },
                { status: 400 }
            )
        }

        // Call RPC function
        const { data, error } = await supabase.rpc('create_coordination_thread', {
            p_object_type: objectType,
            p_object_id: objectId,
            p_title: title,
            p_description: description || null,
            p_priority: priority,
            p_trigger_event: 'manual',
            p_initial_message: initialMessage || null,
            p_initial_message_type: initialMessageType
        })

        if (error) {
            console.error('Error creating coordination thread:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (!data?.success) {
            return NextResponse.json(
                { error: data?.error || 'Failed to create thread' },
                { status: 400 }
            )
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Error parsing request:', error)
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
}
