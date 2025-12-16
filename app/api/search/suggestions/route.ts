import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Search suggestions for autocomplete
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
        return NextResponse.json({ suggestions: [] })
    }

    try {
        const supabase = await createClient()

        // Call the fuzzy suggestions function
        const { data, error } = await supabase.rpc('get_search_suggestions', {
            p_query: query,
            p_limit: 8
        })

        if (error) {
            console.error('Suggestions error:', error)
            // Fallback to simple ILIKE query
            const { data: fallbackData } = await supabase
                .from('posts')
                .select('id, title, content')
                .eq('status', 'published')
                .ilike('title', `%${query}%`)
                .limit(5)

            const suggestions = (fallbackData || []).map(post => ({
                id: post.id,
                type: 'post',
                title: post.title,
                description: post.content?.substring(0, 80) || '',
                url: `/post/${post.id}`
            }))

            return NextResponse.json({ suggestions })
        }

        return NextResponse.json({ suggestions: data || [] })
    } catch (error) {
        console.error('Suggestions API error:', error)
        return NextResponse.json({ suggestions: [] })
    }
}
