import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ============================================
// POST: Create jury deliberation for an appeal (Admin only)
// ============================================
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check admin role
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const body = await request.json()
        const { appeal_id, required_votes = 3, deadline_hours = 72 } = body

        if (!appeal_id) {
            return NextResponse.json({ error: 'Appeal ID required' }, { status: 400 })
        }

        // Check if appeal exists and is pending
        const { data: appeal } = await supabase
            .from('moderation_appeals')
            .select('id, status, post_id, user_id')
            .eq('id', appeal_id)
            .single()

        if (!appeal) {
            return NextResponse.json({ error: 'Appeal not found' }, { status: 404 })
        }

        if (appeal.status !== 'pending') {
            return NextResponse.json({ error: 'Appeal is not pending' }, { status: 400 })
        }

        // Check if deliberation already exists
        const { data: existingDelib } = await supabase
            .from('jury_deliberations')
            .select('id')
            .eq('appeal_id', appeal_id)
            .single()

        if (existingDelib) {
            return NextResponse.json({ error: 'Deliberation already exists for this appeal' }, { status: 409 })
        }

        // Get post author to exclude from jury
        const { data: post } = await supabase
            .from('posts')
            .select('author_id, approved_by')
            .eq('id', appeal.post_id)
            .single()

        // Get eligible jurors
        const { data: eligibleJurors } = await supabase.rpc('get_eligible_jurors', {
            p_appeal_id: appeal_id,
            p_exclude_user_id: post?.author_id
        })

        if (!eligibleJurors || eligibleJurors.length < required_votes) {
            // Fall back to admin-only if not enough jurors
            return NextResponse.json({
                error: 'Not enough eligible jurors',
                eligible_count: eligibleJurors?.length || 0,
                required: required_votes,
                suggestion: 'Consider resolving directly as admin'
            }, { status: 400 })
        }

        // Create deliberation
        const deadline = new Date()
        deadline.setHours(deadline.getHours() + deadline_hours)

        const { data: deliberation, error: delibError } = await supabase
            .from('jury_deliberations')
            .insert({
                appeal_id,
                required_votes,
                deadline: deadline.toISOString()
            })
            .select()
            .single()

        if (delibError) {
            console.error('Error creating deliberation:', delibError)
            return NextResponse.json({ error: 'Failed to create deliberation' }, { status: 500 })
        }

        // Select random jurors
        const shuffled = eligibleJurors.sort(() => 0.5 - Math.random())
        const selectedJurors = shuffled.slice(0, required_votes)

        // Create assignments
        const assignments = selectedJurors.map((juror: { user_id: string }) => ({
            deliberation_id: deliberation.id,
            juror_id: juror.user_id
        }))

        const { error: assignError } = await supabase
            .from('jury_assignments')
            .insert(assignments)

        if (assignError) {
            console.error('Error creating assignments:', assignError)
            // Rollback deliberation
            await supabase.from('jury_deliberations').delete().eq('id', deliberation.id)
            return NextResponse.json({ error: 'Failed to assign jurors' }, { status: 500 })
        }

        // Update appeal status
        await supabase
            .from('moderation_appeals')
            .update({ status: 'under_jury_review' })
            .eq('id', appeal_id)

        // Create notifications for assigned jurors
        const notifications = selectedJurors.map((juror: { user_id: string }) => ({
            user_id: juror.user_id,
            type: 'jury_assignment',
            title: 'Jury Duty Assignment',
            message: 'You have been assigned to review an appeal. Please cast your vote within 72 hours.',
            link: `/jury`,
            read: false
        }))

        await supabase.from('notifications').insert(notifications)

        return NextResponse.json({
            deliberation,
            assigned_jurors: selectedJurors.length,
            deadline: deadline.toISOString(),
            message: 'Jury deliberation created and jurors assigned'
        }, { status: 201 })
    } catch (error) {
        console.error('Create deliberation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
