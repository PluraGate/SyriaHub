import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Generate a random invite code in XXXX-XXXX format
function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Avoiding confusing chars
    let result = ''
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `${result.slice(0, 4)}-${result.slice(4, 8)}`
}
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
        const { note, target_role = 'member' } = body

        // Validate target_role
        if (!['member', 'researcher'].includes(target_role)) {
            return NextResponse.json({ error: 'Invalid target role. Must be member or researcher.' }, { status: 400 })
        }

        // Check user's TOTAL invite count for this role type (max 5 per role, lifetime limit)
        const { count: totalCount, error: countError } = await supabase
            .from('invite_codes')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', user.id)
            .eq('target_role', target_role)

        if (countError) {
            console.error('Error checking invite count:', countError)
            return NextResponse.json({ error: 'Failed to check invite limit' }, { status: 500 })
        }

        if (totalCount !== null && totalCount >= 5) {
            return NextResponse.json({ error: `You have reached your lifetime ${target_role} invite limit (5)` }, { status: 400 })
        }

        // Create invite code with target_role (strict single-use)
        const { data, error } = await supabase
            .from('invite_codes')
            .insert({
                code: generateInviteCode(),
                created_by: user.id,
                note: note || null,
                target_role: target_role,
                max_uses: 1, // Enforce single-use
            })
            .select('id, code, target_role')
            .single()

        if (error) {
            console.error('Create invite error:', error)
            // Handle duplicate code (very rare, but possible)
            if (error.code === '23505') {
                // Retry with a new code - preserve target_role and max_uses
                const retryData = await supabase
                    .from('invite_codes')
                    .insert({
                        code: generateInviteCode(),
                        created_by: user.id,
                        note: note || null,
                        target_role: target_role,
                        max_uses: 1, // Enforce single-use
                    })
                    .select('id, code, target_role')
                    .single()

                if (retryData.error) {
                    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
                }
                return NextResponse.json({
                    success: true,
                    code: retryData.data.code,
                    id: retryData.data.id,
                })
            }
            return NextResponse.json({ error: error.message || 'Failed to create invite' }, { status: 500 })
        }

        if (!data) {
            console.error('Create invite returned no data')
            return NextResponse.json({ error: 'Failed to create invite - no data returned' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            code: data.code,
            id: data.id,
        })
    } catch (error) {
        console.error('Invite API error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
