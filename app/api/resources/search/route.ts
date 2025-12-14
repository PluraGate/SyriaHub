import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q') || ''
        const limit = parseInt(searchParams.get('limit') || '10', 10)

        // Search resources by title
        let queryBuilder = supabase
            .from('posts')
            .select(`
        id,
        title,
        content,
        created_at,
        metadata,
        tags,
        users!posts_author_id_fkey (
          name,
          email
        )
      `)
            .eq('content_type', 'resource')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(limit)

        // Apply search filter if query is provided
        if (query.trim()) {
            queryBuilder = queryBuilder.ilike('title', `%${query}%`)
        }

        const { data, error } = await queryBuilder

        if (error) {
            console.error('Resource search error:', error)
            return NextResponse.json(
                { error: 'Failed to search resources' },
                { status: 500 }
            )
        }

        // Transform the data to match expected format
        const resources = data?.map(resource => ({
            id: resource.id,
            title: resource.title,
            content: resource.content?.substring(0, 150) + '...',
            created_at: resource.created_at,
            metadata: resource.metadata,
            tags: resource.tags,
            author: resource.users
        })) || []

        return NextResponse.json({ resources })
    } catch (error) {
        console.error('Resource search error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
