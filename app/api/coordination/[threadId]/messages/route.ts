import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
    params: Promise<{ threadId: string }>
}

// POST /api/coordination/[threadId]/messages - Add message to thread
export async function POST(request: NextRequest, { params }: RouteParams) {
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
        const {
            messageType,
            content,
            actionType,
            actionData,
            newState,
            decisionConfidence,
            reviewPending,
            reviewPendingHours
        } = body

        if (!messageType || !content) {
            return NextResponse.json(
                { error: 'messageType and content are required' },
                { status: 400 }
            )
        }

        const validMessageTypes = ['NOTE', 'FLAG', 'DECISION', 'RATIONALE', 'REQUEST_REVIEW']
        if (!validMessageTypes.includes(messageType)) {
            return NextResponse.json(
                { error: `Invalid messageType. Must be one of: ${validMessageTypes.join(', ')}` },
                { status: 400 }
            )
        }

        // Moderators cannot perform certain actions
        if (userData.role === 'moderator' && actionType) {
            const adminOnlyActions = ['suspend_user', 'reinstate_user']
            if (adminOnlyActions.includes(actionType)) {
                return NextResponse.json(
                    { error: 'Moderators cannot perform user suspension actions' },
                    { status: 403 }
                )
            }
        }

        // Call RPC function
        const { data, error } = await supabase.rpc('add_coordination_message', {
            p_thread_id: threadId,
            p_message_type: messageType,
            p_content: content,
            p_action_type: actionType || null,
            p_action_data: actionData || null,
            p_new_state: newState || null,
            p_decision_confidence: decisionConfidence || null,
            p_review_pending: reviewPending || false,
            p_review_pending_hours: reviewPendingHours || null
        })

        if (error) {
            console.error('Error adding coordination message:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (!data?.success) {
            return NextResponse.json(
                { error: data?.error || 'Failed to add message' },
                { status: 400 }
            )
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Error parsing request:', error)
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
}
