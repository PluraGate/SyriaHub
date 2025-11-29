import { NextResponse } from 'next/server'
import { createServerClient, verifyAuth } from '@/lib/supabaseClient'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await params
        const user = await verifyAuth()
        const supabase = await createServerClient()

        const { value } = await request.json()

        if (![1, -1].includes(value)) {
            return NextResponse.json(
                { error: 'Invalid vote value. Must be 1 or -1.' },
                { status: 400 }
            )
        }

        // Check if user already voted
        const { data: existingVote } = await supabase
            .from('post_votes')
            .select('*')
            .eq('post_id', postId)
            .eq('voter_id', user.id)
            .single()

        if (existingVote) {
            if (existingVote.value === value) {
                // Toggle off (remove vote)
                await supabase
                    .from('post_votes')
                    .delete()
                    .eq('id', existingVote.id)
            } else {
                // Change vote
                await supabase
                    .from('post_votes')
                    .update({ value })
                    .eq('id', existingVote.id)
            }
        } else {
            // Create new vote
            await supabase
                .from('post_votes')
                .insert({
                    post_id: postId,
                    voter_id: user.id,
                    value
                })
        }

        // Calculate new vote count
        // Note: In a high-scale app, we might want to denormalize this or use a trigger.
        // For now, counting on read is fine or we can return the new count here.
        const { count: upvotes } = await supabase
            .from('post_votes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId)
            .eq('value', 1)

        const { count: downvotes } = await supabase
            .from('post_votes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId)
            .eq('value', -1)

        const voteCount = (upvotes || 0) - (downvotes || 0)

        // Update the post's cached vote count if we have a column for it, 
        // but for now let's just return it so the UI can update.
        // If we added a vote_count column to posts, we would update it here.

        return NextResponse.json({ voteCount })
    } catch (error) {
        console.error('Vote error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
