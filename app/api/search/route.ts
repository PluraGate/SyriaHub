import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper to log search analytics (non-blocking)
async function logSearchAnalytics(
    supabase: Awaited<ReturnType<typeof createClient>>,
    params: {
        query: string
        filter_type?: string | null
        filter_tag?: string | null
        filter_date?: string | null
        results_count: number
        search_duration_ms: number
    }
) {
    try {
        const { data: { user } } = await supabase.auth.getUser()

        await supabase.from('search_analytics').insert({
            user_id: user?.id || null,
            query: params.query,
            query_normalized: params.query.toLowerCase().trim(),
            filter_type: params.filter_type,
            filter_tag: params.filter_tag,
            filter_date: params.filter_date,
            results_count: params.results_count,
            search_duration_ms: params.search_duration_ms,
            source: 'web'
        })
    } catch (e) {
        // Silent fail - analytics should not affect search
        console.error('Analytics logging failed:', e)
    }
}

// GET: Fuzzy search for the main search page
export async function GET(request: NextRequest) {
    const startTime = Date.now()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type')
    const tag = searchParams.get('tag')
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!query || query.trim().length < 2) {
        return NextResponse.json({ results: [], total: 0 })
    }

    try {
        const supabase = await createClient()

        // Call the fuzzy search function
        const { data, error } = await supabase.rpc('fuzzy_search_content', {
            p_query: query,
            p_filter_type: type || null,
            p_filter_tag: tag || null,
            p_filter_date: date || null,
            p_limit: limit
        })

        if (error) {
            console.error('Fuzzy search error:', error)

            // Fallback to ILIKE search if RPC fails
            let queryBuilder = supabase
                .from('posts')
                .select('id, title, content, created_at, tags, content_type')
                .eq('status', 'published')
                .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
                .limit(limit)

            if (type === 'post') {
                queryBuilder = queryBuilder.in('content_type', ['article', 'question', 'resource'])
            } else if (type === 'event') {
                queryBuilder = queryBuilder.eq('content_type', 'event')
            }

            const { data: fallbackData, error: fallbackError } = await queryBuilder

            if (fallbackError) {
                return NextResponse.json({ error: 'Search failed' }, { status: 500 })
            }

            const results = (fallbackData || []).map(post => ({
                id: post.id,
                type: post.content_type === 'event' ? 'event' : 'post',
                title: post.title,
                description: post.content?.substring(0, 200) || '',
                url: post.content_type === 'event' ? `/events/${post.id}` : `/post/${post.id}`,
                created_at: post.created_at,
                rank: 0.5
            }))

            // Log analytics (non-blocking)
            const duration = Date.now() - startTime
            logSearchAnalytics(supabase, {
                query,
                filter_type: type,
                filter_tag: tag,
                filter_date: date,
                results_count: results.length,
                search_duration_ms: duration
            })

            return NextResponse.json({ results, total: results.length, fallback: true })
        }

        // Log analytics (non-blocking)
        const duration = Date.now() - startTime
        logSearchAnalytics(supabase, {
            query,
            filter_type: type,
            filter_tag: tag,
            filter_date: date,
            results_count: (data || []).length,
            search_duration_ms: duration
        })

        return NextResponse.json({
            results: data || [],
            total: (data || []).length
        })
    } catch (error) {
        console.error('Search API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
