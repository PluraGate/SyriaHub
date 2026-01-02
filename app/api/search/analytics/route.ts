import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/rateLimit'

// POST: Log a search query for analytics
async function handlePost(request: NextRequest) {
    try {
        const {
            query,
            filter_type,
            filter_tag,
            filter_date,
            results_count,
            search_duration_ms,
            source = 'web',
            session_id
        } = await request.json()

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        const supabase = await createClient()

        // Get current user if authenticated
        const { data: { user } } = await supabase.auth.getUser()

        // Normalize query for aggregation
        const query_normalized = query.toLowerCase().trim()

        // Log the search
        const { error } = await supabase
            .from('search_analytics')
            .insert({
                user_id: user?.id || null,
                query,
                query_normalized,
                filter_type,
                filter_tag,
                filter_date,
                results_count: results_count || 0,
                search_duration_ms,
                source,
                session_id
            })

        if (error) {
            console.error('Failed to log search analytics:', error)
            // Don't return error to client - analytics failures shouldn't affect UX
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Search analytics error:', error)
        return NextResponse.json({ success: false })
    }
}

export const POST = withRateLimit('read')(handlePost)

// GET: Get search analytics (admin only)
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Check if user is admin/moderator
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!userData || !['admin', 'moderator'].includes(userData.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '7')
        const type = searchParams.get('type') || 'top'

        let data, error

        switch (type) {
            case 'top':
                ({ data, error } = await supabase.rpc('get_top_searches', {
                    p_days: days,
                    p_limit: 20
                }))
                break
            case 'zero':
                ({ data, error } = await supabase.rpc('get_zero_result_searches', {
                    p_days: days,
                    p_limit: 20
                }))
                break
            case 'trends':
                ({ data, error } = await supabase.rpc('get_search_trends', {
                    p_days: days
                }))
                break
            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

        if (error) {
            console.error('Analytics query error:', error)
            return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
        }

        return NextResponse.json({ data, type, days })
    } catch (error) {
        console.error('Search analytics GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
