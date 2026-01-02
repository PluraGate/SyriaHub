import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rateLimit'

async function handlePost(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()

    // Call the RPC function to increment view count
    const { error } = await supabase.rpc('increment_view_count', {
        post_id: id
    })

    if (error) {
        console.error('Error incrementing view count:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

export const POST = withRateLimit('read')(handlePost)
