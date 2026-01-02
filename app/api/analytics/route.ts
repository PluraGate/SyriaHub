import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/rateLimit'

// Track post view
async function handlePost(request: NextRequest) {
    try {
        const body = await request.json()
        const { postId, sessionId, duration, scrollDepth, referrer } = body

        if (!postId) {
            return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Insert view record
        const { error } = await supabase.from('post_views').insert({
            post_id: postId,
            user_id: user?.id || null,
            session_id: sessionId || crypto.randomUUID(),
            duration_seconds: duration || 0,
            scroll_depth: scrollDepth || 0,
            referrer: referrer || null,
            user_agent: request.headers.get('user-agent') || null,
        })

        if (error) {
            console.error('Failed to track view:', error)
            return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

export const POST = withRateLimit('read')(handlePost)

// Get post analytics (for post authors)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const postId = searchParams.get('postId')

        if (!postId) {
            return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify user owns the post
        const { data: post } = await supabase
            .from('posts')
            .select('author_id')
            .eq('id', postId)
            .single()

        if (!post || post.author_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Get analytics summary
        const { data: analytics, error } = await supabase.rpc('get_post_analytics', {
            p_post_id: postId,
        })

        if (error) {
            console.error('Failed to fetch analytics:', error)
            return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
        }

        // Get views over time for chart
        const { data: viewsOverTime } = await supabase.rpc('get_views_over_time', {
            p_post_id: postId,
            p_days: 30,
        })

        return NextResponse.json({
            ...analytics,
            viewsOverTime: viewsOverTime || [],
        })
    } catch (error) {
        console.error('Analytics error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
