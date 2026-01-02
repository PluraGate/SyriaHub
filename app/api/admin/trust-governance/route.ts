import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

// GET /api/admin/trust-governance - Dashboard metrics
export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin/moderator access
    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['admin', 'moderator'].includes(profile.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const metric = searchParams.get('metric')

    try {
        if (metric === 'invite-tree') {
            const { data, error } = await supabase
                .from('invite_tree')
                .select(`
          id, user_id, invited_by, generation, invited_role, join_method,
          seeding_conversation_held, created_at,
          user:users!invite_tree_user_id_fkey(id, name, email, role)
        `)
                .order('generation', { ascending: true })

            if (error) throw error
            return NextResponse.json({ data })
        }

        if (metric === 'promotions') {
            const { data, error } = await supabase
                .from('promotion_requests')
                .select(`
          *,
          user:users!promotion_requests_user_id_fkey(id, name, email, role),
          endorsements:promotion_endorsements(
            id, endorser_id, endorser_role, justification, created_at,
            endorser:users!promotion_endorsements_endorser_id_fkey(id, name)
          )
        `)
                .eq('status', 'pending')
                .order('created_at', { ascending: true })

            if (error) throw error
            return NextResponse.json({ data })
        }

        if (metric === 'diversity-warnings') {
            const { data, error } = await supabase
                .from('invite_diversity_metrics')
                .select(`
          *,
          inviter:users!invite_diversity_metrics_inviter_id_fkey(id, name, email)
        `)
                .or('warning_count.gt.0,invite_blocked.eq.true')
                .order('warning_count', { ascending: false })

            if (error) throw error
            return NextResponse.json({ data })
        }

        if (metric === 'queue-status') {
            const { count, error } = await supabase
                .from('trust_recalc_queue')
                .select('*', { count: 'exact', head: true })

            if (error) throw error
            return NextResponse.json({ pending_recalcs: count })
        }

        // Default: summary stats
        const [
            { count: treeCount },
            { count: pendingPromotions },
            { count: blockedUsers },
            { count: queueSize }
        ] = await Promise.all([
            supabase.from('invite_tree').select('*', { count: 'exact', head: true }),
            supabase.from('promotion_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('invite_diversity_metrics').select('*', { count: 'exact', head: true }).eq('invite_blocked', true),
            supabase.from('trust_recalc_queue').select('*', { count: 'exact', head: true })
        ])

        return NextResponse.json({
            total_users_in_tree: treeCount,
            pending_promotions: pendingPromotions,
            invite_blocked_users: blockedUsers,
            trust_recalc_queue_size: queueSize
        })

    } catch (error) {
        console.error('Trust governance error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

// POST /api/admin/trust-governance - Admin actions
async function handlePost(request: NextRequest) {
    // CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    const supabase = await createClient()
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
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const { action } = body

        if (action === 'endorse') {
            const { request_id, justification } = body

            if (!justification || justification.length < 20) {
                return NextResponse.json({ error: 'Justification must be at least 20 characters' }, { status: 400 })
            }

            const { data, error } = await supabase
                .from('promotion_endorsements')
                .insert({
                    request_id,
                    endorser_id: user.id,
                    endorser_role: profile.role,
                    justification
                })
                .select()
                .single()

            if (error) {
                if (error.message.includes('Cannot endorse your own')) {
                    return NextResponse.json({ error: 'Cannot endorse your own promotion' }, { status: 400 })
                }
                throw error
            }

            // Check cluster
            const { data: clusterCheck } = await supabase
                .rpc('detect_endorsement_cluster', { p_request_id: request_id })

            return NextResponse.json({ endorsement: data, cluster_check: clusterCheck })
        }

        if (action === 'resolve-promotion') {
            if (profile.role !== 'admin') {
                return NextResponse.json({ error: 'Only admins can resolve promotions' }, { status: 403 })
            }

            const { request_id, decision } = body

            // Check eligibility
            const { data: req } = await supabase
                .from('promotion_requests')
                .select(`
          *,
          endorsements:promotion_endorsements(endorser_role)
        `)
                .eq('id', request_id)
                .single()

            if (!req) {
                return NextResponse.json({ error: 'Request not found' }, { status: 404 })
            }

            const modCount = req.endorsements.filter((e: { endorser_role: string }) => e.endorser_role === 'moderator').length
            const adminCount = req.endorsements.filter((e: { endorser_role: string }) => e.endorser_role === 'admin').length

            if (decision === 'approved' && (modCount < req.required_moderator_endorsements || adminCount < req.required_admin_endorsements)) {
                return NextResponse.json({
                    error: 'Insufficient endorsements',
                    required: { moderators: req.required_moderator_endorsements, admins: req.required_admin_endorsements },
                    current: { moderators: modCount, admins: adminCount }
                }, { status: 400 })
            }

            // Update request
            const { error: updateError } = await supabase
                .from('promotion_requests')
                .update({
                    status: decision,
                    resolved_at: new Date().toISOString(),
                    resolved_by: user.id
                })
                .eq('id', request_id)

            if (updateError) throw updateError

            // Update user role if approved
            if (decision === 'approved') {
                await supabase
                    .from('users')
                    .update({ role: req.target_role })
                    .eq('id', req.user_id)
            }

            return NextResponse.json({ success: true, decision })
        }

        if (action === 'process-trust-queue') {
            if (profile.role !== 'admin') {
                return NextResponse.json({ error: 'Only admins can trigger queue processing' }, { status: 403 })
            }

            const { data, error } = await supabase.rpc('process_trust_recalc_queue', { p_limit: 100 })
            if (error) throw error

            return NextResponse.json({ processed: data })
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

    } catch (error) {
        console.error('Trust governance action error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

export const POST = withRateLimit('write')(handlePost)
