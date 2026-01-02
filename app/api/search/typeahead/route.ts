import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/rateLimit'

// GET: Get typeahead completion for inline autocomplete
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const prefix = searchParams.get('q')

    if (!prefix || prefix.length < 2) {
        return NextResponse.json({ completion: null })
    }

    try {
        const supabase = await createClient()

        // Call the typeahead completion function
        const { data, error } = await supabase.rpc('get_typeahead_completion', {
            p_prefix: prefix
        })

        if (error) {
            console.error('Typeahead error:', error)
            return NextResponse.json({ completion: null })
        }

        if (data && data.length > 0) {
            return NextResponse.json({
                completion: data[0].completion,
                fullTerm: data[0].full_term,
                source: data[0].source
            })
        }

        return NextResponse.json({ completion: null })
    } catch (error) {
        console.error('Typeahead API error:', error)
        return NextResponse.json({ completion: null })
    }
}

// POST: Track a search term when user performs a search
async function handlePost(request: NextRequest) {
    try {
        const { term } = await request.json()

        if (!term || term.length < 3) {
            return NextResponse.json({ success: false })
        }

        const supabase = await createClient()

        // Track the search term
        const { error } = await supabase.rpc('track_search_term', {
            p_term: term
        })

        if (error) {
            console.error('Track search error:', error)
            return NextResponse.json({ success: false })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Track search API error:', error)
        return NextResponse.json({ success: false })
    }
}

export const POST = withRateLimit('read')(handlePost)
