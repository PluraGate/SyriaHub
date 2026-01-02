import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

// ============================================
// GET: Fetch jury cases assigned to current user
// ============================================
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check user role
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!userData || !['admin', 'moderator', 'researcher'].includes(userData.role)) {
            return NextResponse.json({ error: 'Not eligible for jury duty' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') || 'active'

        // Fetch jury assignments for this user
        let query = supabase
            .from('jury_assignments')
            .select(`
        *,
        deliberation:jury_deliberations(
          *,
          appeal:moderation_appeals(
            *,
            post:posts(id, title, content, author_id),
            user:users!moderation_appeals_user_id_fkey(id, name, email)
          )
        )
      `)
            .eq('juror_id', user.id)
            .eq('declined', false)

        // Filter by deliberation status
        if (status !== 'all') {
            query = query.eq('deliberation.status', status)
        }

        const { data, error } = await query.order('assigned_at', { ascending: false })

        if (error) {
            console.error('Error fetching jury assignments:', error)
            return NextResponse.json({ error: 'Failed to fetch jury cases' }, { status: 500 })
        }

        // Transform to JuryCase format
        const cases = data
            ?.filter(a => a.deliberation)
            .map(assignment => ({
                ...assignment.deliberation,
                assignment: {
                    id: assignment.id,
                    responded: assignment.responded,
                    assigned_at: assignment.assigned_at
                }
            }))

        return NextResponse.json({ cases })
    } catch (error) {
        console.error('Jury API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


// ============================================
// POST: Cast vote on a deliberation
// ============================================
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
        const { deliberation_id, vote, reasoning } = body

        // Validate input
        if (!deliberation_id || !vote || !reasoning) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (!['uphold', 'overturn', 'abstain'].includes(vote)) {
            return NextResponse.json({ error: 'Invalid vote value' }, { status: 400 })
        }

        if (reasoning.length < 20) {
            return NextResponse.json({ error: 'Reasoning must be at least 20 characters' }, { status: 400 })
        }

        // Check if user is assigned to this deliberation
        const { data: assignment } = await supabase
            .from('jury_assignments')
            .select('id, responded, declined')
            .eq('deliberation_id', deliberation_id)
            .eq('juror_id', user.id)
            .single()

        if (!assignment) {
            return NextResponse.json({ error: 'You are not assigned to this deliberation' }, { status: 403 })
        }

        if (assignment.declined) {
            return NextResponse.json({ error: 'You have declined this assignment' }, { status: 403 })
        }

        if (assignment.responded) {
            return NextResponse.json({ error: 'You have already voted on this deliberation' }, { status: 409 })
        }

        // Check if deliberation is still active
        const { data: deliberation } = await supabase
            .from('jury_deliberations')
            .select('status, deadline')
            .eq('id', deliberation_id)
            .single()

        if (!deliberation || deliberation.status !== 'active') {
            return NextResponse.json({ error: 'This deliberation is no longer active' }, { status: 400 })
        }

        if (new Date(deliberation.deadline) < new Date()) {
            return NextResponse.json({ error: 'This deliberation has expired' }, { status: 400 })
        }

        // Cast the vote (trigger will update counts and conclude if needed)
        const { data: voteRecord, error: voteError } = await supabase
            .from('jury_votes')
            .insert({
                deliberation_id,
                juror_id: user.id,
                vote,
                reasoning
            })
            .select()
            .single()

        if (voteError) {
            console.error('Error casting vote:', voteError)
            return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 })
        }

        // Fetch updated deliberation status
        const { data: updatedDeliberation } = await supabase
            .from('jury_deliberations')
            .select('status, final_decision, votes_uphold, votes_overturn, votes_abstain, total_votes')
            .eq('id', deliberation_id)
            .single()

        return NextResponse.json({
            vote: voteRecord,
            deliberation: updatedDeliberation,
            message: updatedDeliberation?.status === 'concluded'
                ? `Deliberation concluded with decision: ${updatedDeliberation.final_decision}`
                : 'Vote recorded successfully'
        }, { status: 201 })
    } catch (error) {
        console.error('Jury vote error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export const POST = withRateLimit('write')(handlePost)
