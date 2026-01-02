import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

async function handlePost(request: Request, { params }: { params: Promise<{ id: string }> }) {
    // SECURITY: Validate origin for CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }
    
    const { id } = await params
    const { value } = await request.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (![1, -1].includes(value)) {
        return NextResponse.json({ error: 'Invalid vote value' }, { status: 400 })
    }

    // Upsert vote
    const { error } = await supabase
        .from('post_votes')
        .upsert({
            post_id: id,
            voter_id: user.id,
            value: value
        }, {
            onConflict: 'post_id,voter_id'
        })

    if (error) {
        console.error('Vote error:', error)
        return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
    }

    // Get updated count
    const { data: post } = await supabase
        .from('posts')
        .select('vote_count')
        .eq('id', id)
        .single()

    return NextResponse.json({ voteCount: post?.vote_count || 0 })
}

// SECURITY: Apply rate limiting to vote endpoint (write rate)
export const POST = withRateLimit('write')(handlePost as any)
