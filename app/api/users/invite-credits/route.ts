import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/users/invite-credits - View credit balance
export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data: credits, error } = await supabase
            .from('invite_credits')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (error) throw error

        const { data: recentEvents } = await supabase
            .from('invite_credit_events')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        // Check if invites are blocked
        const { data: blockCheck } = await supabase
            .rpc('check_invite_allowed', { p_user_id: user.id })

        return NextResponse.json({
            credits,
            recent_events: recentEvents || [],
            invite_allowed: blockCheck
        })

    } catch (error) {
        console.error('Credit fetch error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

// POST /api/users/invite-credits - Create invite using credit
export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { action } = body

        if (action === 'create-invite') {
            const { target_role, note } = body

            // Check if allowed
            const { data: allowed } = await supabase
                .rpc('check_invite_allowed', { p_user_id: user.id })

            if (!allowed?.allowed) {
                return NextResponse.json({
                    error: 'Invites blocked',
                    reason: allowed?.reason,
                    appeal_path: allowed?.appeal_path
                }, { status: 403 })
            }

            // Use a credit
            const { data: creditUsed, error: useError } = await supabase
                .rpc('use_invite_credit', { p_user_id: user.id })

            if (useError) throw useError

            if (!creditUsed) {
                return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
            }

            // Create the invite code
            const { data: invite, error: inviteError } = await supabase
                .rpc('create_invite_code', {
                    p_user_id: user.id,
                    p_note: note || null,
                    p_target_role: target_role || 'member'
                })

            if (inviteError) throw inviteError

            return NextResponse.json({
                success: true,
                invite: invite?.[0]
            })
        }

        if (action === 'request-promotion') {
            const { target_role } = body

            // Get current role
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (!profile) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 })
            }

            // Validate role progression
            const validProgressions: Record<string, string[]> = {
                'member': ['researcher'],
                'researcher': ['moderator'],
                'moderator': ['admin']
            }

            if (!validProgressions[profile.role]?.includes(target_role)) {
                return NextResponse.json({
                    error: 'Invalid role progression',
                    current: profile.role,
                    allowed_targets: validProgressions[profile.role] || []
                }, { status: 400 })
            }

            // Check for existing pending request
            const { data: existing } = await supabase
                .from('promotion_requests')
                .select('id')
                .eq('user_id', user.id)
                .eq('status', 'pending')
                .single()

            if (existing) {
                return NextResponse.json({ error: 'Pending request already exists' }, { status: 400 })
            }

            // Create request
            const { data: req, error: reqError } = await supabase
                .from('promotion_requests')
                .insert({
                    user_id: user.id,
                    from_role: profile.role,
                    target_role
                })
                .select()
                .single()

            if (reqError) throw reqError

            return NextResponse.json({ success: true, request: req })
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

    } catch (error) {
        console.error('Credit action error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
