import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Fetch user's bookmarks
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: bookmarks, error } = await supabase
            .from('bookmarks')
            .select(`
                id,
                created_at,
                post:posts(
                    id,
                    title,
                    content,
                    tags,
                    status,
                    created_at,
                    author:users!posts_author_id_fkey(id, name, email)
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching bookmarks:', error)
            return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
        }

        return NextResponse.json({ bookmarks })

    } catch (error) {
        console.error('Error in bookmarks GET:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST: Add a bookmark
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { post_id } = body

        if (!post_id) {
            return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
        }

        // Check if already bookmarked
        const { data: existing } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('post_id', post_id)
            .single()

        if (existing) {
            return NextResponse.json({ error: 'Already bookmarked' }, { status: 409 })
        }

        const { data: bookmark, error } = await supabase
            .from('bookmarks')
            .insert({
                user_id: user.id,
                post_id
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating bookmark:', error)
            return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 })
        }

        return NextResponse.json({ bookmark })

    } catch (error) {
        console.error('Error in bookmarks POST:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE: Remove a bookmark
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const post_id = searchParams.get('post_id')

        if (!id && !post_id) {
            return NextResponse.json({ error: 'Bookmark ID or Post ID is required' }, { status: 400 })
        }

        let query = supabase.from('bookmarks').delete().eq('user_id', user.id)

        if (id) {
            query = query.eq('id', id)
        } else if (post_id) {
            query = query.eq('post_id', post_id)
        }

        const { error } = await query

        if (error) {
            console.error('Error deleting bookmark:', error)
            return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error in bookmarks DELETE:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
