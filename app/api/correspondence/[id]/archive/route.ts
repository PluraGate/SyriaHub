import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

async function handlePost(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const { data, error } = await supabase.rpc('archive_correspondence', {
            p_correspondence_id: id
        })

        if (error) {
            console.error('[correspondence/archive] RPC error:', error)
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('[correspondence/archive] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export const POST = withRateLimit('write')(handlePost)
