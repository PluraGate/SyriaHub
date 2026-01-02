import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const patternId = searchParams.get('pattern')
    const governorate = searchParams.get('governorate')
    const search = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
        .from('precedents')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (patternId) {
        query = query.eq('pattern_id', patternId)
    }

    if (governorate) {
        query = query.eq('governorate', governorate)
    }

    if (search) {
        query = query.textSearch('search_vector', search)
    }

    const { data, error } = await query

    if (error) {
        // Return empty array if table doesn't exist yet
        if (error.code === '42P01') {
            return NextResponse.json([])
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

async function handlePost(request: NextRequest) {
    // CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    const supabase = await createClient()

    // Check admin status
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['admin', 'moderator'].includes(profile.role)) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()

    const { data, error } = await supabase
        .from('precedents')
        .insert({
            title: body.title,
            title_ar: body.title_ar,
            summary: body.summary,
            summary_ar: body.summary_ar,
            pattern_id: body.pattern_id,
            governorate: body.governorate,
            geometry: body.geometry,
            source_url: body.source_url,
            source_name: body.source_name,
            source_date: body.source_date,
            trust_level: body.trust_level || 'medium',
            full_text: body.full_text,
            key_lessons: body.key_lessons,
            created_by: user.id,
            is_published: body.is_published || false
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
