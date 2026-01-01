import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ============================================
// GET: Fetch reviews for a post or reviewer
// ============================================
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const { searchParams } = new URL(request.url)
        const postId = searchParams.get('post_id')
        const requestId = searchParams.get('request_id')
        const status = searchParams.get('status')

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Base query
        let query = supabase
            .from('peer_reviews')
            .select(`
        *,
        post:posts(id, title, author_id),
        reviewer:users!peer_reviews_reviewer_id_fkey(id, name, email)
      `)

        // Filter by post
        if (postId) {
            query = query.eq('post_id', postId)
        }

        // Filter by request
        if (requestId) {
            query = query.eq('request_id', requestId)
        }

        // Filter by status
        if (status) {
            query = query.eq('status', status)
        }

        // Non-admins can only see their own reviews
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!['admin', 'moderator'].includes(userData?.role || '')) {
            query = query.eq('reviewer_id', user.id)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching reviews:', error)
            return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
        }

        return NextResponse.json({ reviews: data })
    } catch (error) {
        console.error('Reviews API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


// ============================================
// POST: Request a peer review for a post
// ============================================
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            post_id,
            min_reviewers = 2,
            max_reviewers = 5,
            review_type = 'open',
            request_notes
        } = body

        if (!post_id) {
            return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
        }

        // Check if post exists and user is author
        const { data: post } = await supabase
            .from('posts')
            .select('id, author_id, review_status, title')
            .eq('id', post_id)
            .single()

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        if (post.author_id !== user.id) {
            return NextResponse.json({ error: 'Only authors can request reviews' }, { status: 403 })
        }

        if (post.review_status !== 'not_requested') {
            return NextResponse.json({ error: 'Review already requested for this post' }, { status: 400 })
        }

        // Create review request
        const { data: reviewRequest, error: requestError } = await supabase
            .from('review_requests')
            .insert({
                post_id,
                requested_by: user.id,
                min_reviewers,
                max_reviewers,
                review_type,
                request_notes
            })
            .select()
            .single()

        if (requestError) {
            console.error('Error creating review request:', requestError)
            return NextResponse.json({ error: 'Failed to create review request' }, { status: 500 })
        }

        // Update post status
        await supabase
            .from('posts')
            .update({ review_status: 'pending_reviewers' })
            .eq('id', post_id)

        // Find matching reviewers
        const { data: matchingReviewers } = await supabase.rpc('find_matching_reviewers', {
            p_post_id: post_id,
            p_limit: max_reviewers * 2 // Get more than needed in case some decline
        })

        // Invite top matching reviewers
        const reviewersToInvite = (matchingReviewers || []).slice(0, max_reviewers)

        if (reviewersToInvite.length > 0) {
            const invitations = reviewersToInvite.map((reviewer: { user_id: string }) => ({
                request_id: reviewRequest.id,
                post_id,
                reviewer_id: reviewer.user_id,
                status: 'pending'
            }))

            await supabase.from('peer_reviews').insert(invitations)

            // Notify potential reviewers
            const notifications = reviewersToInvite.map((reviewer: { user_id: string }) => ({
                user_id: reviewer.user_id,
                type: 'review_invitation',
                title: 'Peer Review Invitation',
                message: `You've been invited to review "${post.title}". Your expertise is valued!`,
                link: `/reviews`,
                read: false
            }))

            await supabase.from('notifications').insert(notifications)
        }

        return NextResponse.json({
            request: reviewRequest,
            invited_reviewers: reviewersToInvite.length,
            message: reviewersToInvite.length > 0
                ? `Review request created and ${reviewersToInvite.length} potential reviewers invited`
                : 'Review request created. No matching reviewers found yet.'
        }, { status: 201 })
    } catch (error) {
        console.error('Review request error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


// ============================================
// PATCH: Submit or update a review
// ============================================
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            review_id,
            action, // 'accept', 'decline', 'submit'
            accuracy_score,
            methodology_score,
            clarity_score,
            relevance_score,
            citations_score,
            recommendation,
            public_comments,
            private_comments,
            reviewer_confidence,
            decline_reason
        } = body

        if (!review_id || !action) {
            return NextResponse.json({ error: 'Review ID and action required' }, { status: 400 })
        }

        // Verify ownership
        const { data: review } = await supabase
            .from('peer_reviews')
            .select('id, reviewer_id, status, post_id')
            .eq('id', review_id)
            .single()

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 })
        }

        if (review.reviewer_id !== user.id) {
            return NextResponse.json({ error: 'Not your review' }, { status: 403 })
        }

        let updateData: Record<string, unknown> = {}

        switch (action) {
            case 'accept':
                if (review.status !== 'pending') {
                    return NextResponse.json({ error: 'Can only accept pending reviews' }, { status: 400 })
                }
                updateData = {
                    status: 'in_progress',
                    accepted_at: new Date().toISOString()
                }
                break

            case 'decline':
                if (review.status !== 'pending') {
                    return NextResponse.json({ error: 'Can only decline pending reviews' }, { status: 400 })
                }
                updateData = {
                    status: 'declined'
                }
                break

            case 'submit':
                if (review.status !== 'in_progress' && review.status !== 'accepted') {
                    return NextResponse.json({ error: 'Cannot submit at this stage' }, { status: 400 })
                }

                // Validate all scores provided
                if (!accuracy_score || !methodology_score || !clarity_score ||
                    !relevance_score || !citations_score || !recommendation) {
                    return NextResponse.json({ error: 'All scores and recommendation required' }, { status: 400 })
                }

                updateData = {
                    status: 'completed',
                    accuracy_score,
                    methodology_score,
                    clarity_score,
                    relevance_score,
                    citations_score,
                    recommendation,
                    public_comments: public_comments || null,
                    private_comments: private_comments || null,
                    reviewer_confidence: reviewer_confidence || 'medium',
                    completed_at: new Date().toISOString()
                }
                break

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        const { data: updatedReview, error: updateError } = await supabase
            .from('peer_reviews')
            .update(updateData)
            .eq('id', review_id)
            .select()
            .single()

        if (updateError) {
            console.error('Error updating review:', updateError)
            return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
        }

        // If declined, update post status
        if (action === 'decline') {
            // Check if all reviews are declined
            const { data: pendingReviews } = await supabase
                .from('peer_reviews')
                .select('id')
                .eq('post_id', review.post_id)
                .in('status', ['pending', 'accepted', 'in_progress'])

            if (!pendingReviews || pendingReviews.length === 0) {
                await supabase
                    .from('posts')
                    .update({ review_status: 'pending_reviewers' })
                    .eq('id', review.post_id)
            }
        }

        return NextResponse.json({
            review: updatedReview,
            message: action === 'submit' ? 'Review submitted successfully' : `Review ${action}ed`
        })
    } catch (error) {
        console.error('Review update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
