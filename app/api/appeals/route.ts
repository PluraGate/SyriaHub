import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is moderator or admin
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        const isModOrAdmin = userData?.role === 'moderator' || userData?.role === 'admin'

        // Fetch appeals based on user role
        let query = supabase
            .from('moderation_appeals')
            .select(`
        *,
        post:posts(id, title, author_id, approval_status),
        user:users!moderation_appeals_user_id_fkey(id, name, email),
        resolver:users!moderation_appeals_resolved_by_fkey(id, name)
      `)
            .order('created_at', { ascending: false })

        if (!isModOrAdmin) {
            // Regular users can only see their own appeals
            query = query.eq('user_id', user.id)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching appeals:', error)
            return NextResponse.json({ error: 'Failed to fetch appeals' }, { status: 500 })
        }

        return NextResponse.json({ appeals: data })
    } catch (error) {
        console.error('Appeals API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

async function handlePost(request: NextRequest) {
    // CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { post_id, dispute_reason } = body

        if (!post_id || !dispute_reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (dispute_reason.length < 20) {
            return NextResponse.json({ error: 'Dispute reason must be at least 20 characters' }, { status: 400 })
        }

        // Verify the post belongs to the user and is flagged
        const { data: post, error: postError } = await supabase
            .from('posts')
            .select('id, author_id, approval_status')
            .eq('id', post_id)
            .single()

        if (postError || !post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        if (post.author_id !== user.id) {
            return NextResponse.json({ error: 'You can only appeal your own posts' }, { status: 403 })
        }

        if (post.approval_status !== 'flagged') {
            return NextResponse.json({ error: 'This post is not flagged' }, { status: 400 })
        }

        // Check for existing pending appeal
        const { data: existingAppeal } = await supabase
            .from('moderation_appeals')
            .select('id, status')
            .eq('post_id', post_id)
            .eq('user_id', user.id)
            .single()

        if (existingAppeal) {
            if (existingAppeal.status === 'pending') {
                return NextResponse.json({ error: 'You already have a pending appeal for this post' }, { status: 400 })
            }
            if (existingAppeal.status === 'rejected') {
                return NextResponse.json({ error: 'Your appeal for this post was already rejected' }, { status: 400 })
            }
        }

        // Create the appeal
        const { data: appeal, error: insertError } = await supabase
            .from('moderation_appeals')
            .insert({
                post_id,
                user_id: user.id,
                dispute_reason
            })
            .select()
            .single()

        if (insertError) {
            console.error('Error creating appeal:', insertError)
            return NextResponse.json({ error: 'Failed to create appeal' }, { status: 500 })
        }

        return NextResponse.json({ appeal }, { status: 201 })
    } catch (error) {
        console.error('Appeals API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

async function handlePatch(request: NextRequest) {
    // CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'admin') {
            return NextResponse.json({ error: 'Only admins can resolve appeals' }, { status: 403 })
        }

        const body = await request.json()
        const { appeal_id, status, admin_response } = body

        if (!appeal_id || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        // Update the appeal
        const { data: appeal, error: updateError } = await supabase
            .from('moderation_appeals')
            .update({
                status,
                admin_response,
                resolved_by: user.id,
                resolved_at: new Date().toISOString()
            })
            .eq('id', appeal_id)
            .eq('status', 'pending') // Only update pending appeals
            .select()
            .single()

        if (updateError) {
            console.error('Error updating appeal:', updateError)
            return NextResponse.json({ error: 'Failed to update appeal' }, { status: 500 })
        }

        if (!appeal) {
            return NextResponse.json({ error: 'Appeal not found or already resolved' }, { status: 404 })
        }

        // If approved, also update the post status back to pending or approved
        if (status === 'approved') {
            await supabase
                .from('posts')
                .update({ approval_status: 'pending' })
                .eq('id', appeal.post_id)
        }

        return NextResponse.json({ appeal })
    } catch (error) {
        console.error('Appeals API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export const POST = withRateLimit('write')(handlePost)
export const PATCH = withRateLimit('write')(handlePatch)
