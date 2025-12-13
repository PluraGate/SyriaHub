import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Validate an invite code
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get('code')

        if (!code) {
            return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })
        }

        const supabase = await createClient()

        // Validate the code using our RPC function
        const { data, error } = await supabase.rpc('validate_invite_code', {
            p_code: code.toUpperCase().trim(),
        })

        if (error) {
            console.error('Invite validation error:', error)
            return NextResponse.json({ error: 'Failed to validate invite' }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Invite API error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

// Create a new invite code (for authenticated users)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { note } = body

        // Create invite code
        const { data, error } = await supabase.rpc('create_invite_code', {
            p_user_id: user.id,
            p_note: note || null,
        })

        if (error) {
            if (error.message.includes('Maximum invite limit')) {
                return NextResponse.json({ error: 'You have reached your invite limit (5)' }, { status: 400 })
            }
            console.error('Create invite error:', error)
            return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            code: data[0].code,
            id: data[0].id,
        })
    } catch (error) {
        console.error('Invite API error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
