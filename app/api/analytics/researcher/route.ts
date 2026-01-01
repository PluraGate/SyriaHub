import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subDays, format, eachDayOfInterval } from 'date-fns'

// Get researcher analytics (aggregated across all their posts)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const daysBack = parseInt(searchParams.get('days') || '30')

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get all user's posts (published only, excluding 'answer' type which are responses)
        const { data: posts } = await supabase
            .from('posts')
            .select('id, view_count, vote_count, created_at, content_type, status')
            .eq('author_id', user.id)
            .eq('status', 'published')
            .neq('content_type', 'answer')

        const postIds = (posts || []).map(p => p.id)

        if (postIds.length === 0) {
            // Return empty analytics for users with no posts
            return NextResponse.json({
                totalViews: 0,
                totalVotes: 0,
                totalCitations: 0,
                totalComments: 0,
                totalFollowers: 0,
                viewsTrend: 0,
                votesTrend: 0,
                followersTrend: 0,
                viewsOverTime: [],
                votesOverTime: []
            })
        }

        const startDate = subDays(new Date(), daysBack)
        const compareStartDate = subDays(new Date(), daysBack * 2)
        const compareEndDate = startDate

        // Fetch comprehensive stats using the new RPC if possible, or manual aggregation
        let stats: any = null

        try {
            console.log('[Analytics] Attempting RPC for user:', user.id)
            console.log('[Analytics] Post IDs found:', postIds.length)
            const { data, error } = await supabase.rpc('get_comprehensive_researcher_stats', {
                p_user_id: user.id
            })
            console.log('[Analytics] RPC response - data:', JSON.stringify(data))
            console.log('[Analytics] RPC response - error:', error)
            if (!error && data) {
                stats = data
                console.log('[Analytics] Using RPC stats:', JSON.stringify(stats))
            } else if (error) {
                console.warn('[Analytics] RPC failed with error:', error.message)
            }
        } catch (e) {
            console.error('[Analytics] RPC exception:', e)
            console.warn('RPC get_comprehensive_researcher_stats failed, falling back to manual aggregation')
        }

        // Fallback: Manual aggregation if RPC failed
        if (!stats) {
            console.log('[Analytics] Using manual fallback aggregation')
            const [
                { count: surveysCount },
                { count: pollsCount },
                { count: projectsCount },
                { count: commentsMadeCount },
                { count: surveyResponsesCount },
                { count: pollVotesCount },
                { count: citationsReceivedCount },
                { count: commentsReceivedCount }
            ] = await Promise.all([
                supabase.from('surveys').select('id', { count: 'exact', head: true }).eq('author_id', user.id),
                supabase.from('polls').select('id', { count: 'exact', head: true }).eq('author_id', user.id),
                supabase.from('projects').select('id', { count: 'exact', head: true }).eq('created_by', user.id),
                supabase.from('comments').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
                supabase.from('survey_responses').select('id', { count: 'exact', head: true }).eq('respondent_id', user.id),
                supabase.from('poll_votes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
                supabase.from('citations').select('id', { count: 'exact', head: true }).in('target_post_id', postIds),
                supabase.from('comments').select('id', { count: 'exact', head: true }).in('post_id', postIds)
            ])

            stats = {
                publications: (posts?.length || 0) + (surveysCount || 0) + (pollsCount || 0),
                total_views: (posts || []).reduce((sum, p) => sum + (p.view_count || 0), 0),
                total_votes_received: (posts || []).reduce((sum, p) => sum + (p.vote_count || 0), 0),
                comments_received: commentsReceivedCount || 0,
                comments_made: commentsMadeCount || 0,
                citations_received: citationsReceivedCount || 0,
                projects: projectsCount || 0,
                lab_contributions: (surveyResponsesCount || 0) + (pollVotesCount || 0)
            }
            console.log('[Analytics] Fallback stats:', JSON.stringify(stats))
        }

        const totalViews = stats?.total_views || 0
        const totalVotes = stats?.total_votes_received || 0
        const totalComments = stats?.comments_received || 0
        const totalCitations = stats?.citations_received || 0

        // Fetch Trend data
        const { data: currentViews } = await supabase
            .from('post_views')
            .select('id, created_at')
            .in('post_id', postIds)
            .gte('created_at', startDate.toISOString())

        // Fetch engagement data for trend chart (comments, polls, citations, gap contributions)
        const [
            { data: currentComments },
            { data: currentPollVotes },
            { data: currentCitations },
            { data: currentGapContributions }
        ] = await Promise.all([
            // Comments received on user's posts
            supabase
                .from('comments')
                .select('id, created_at')
                .in('post_id', postIds)
                .gte('created_at', startDate.toISOString()),
            // Poll votes (user's polls received votes)
            supabase
                .from('poll_votes')
                .select('id, created_at, poll_id')
                .gte('created_at', startDate.toISOString()),
            // Citations received on user's posts
            supabase
                .from('citations')
                .select('id, created_at')
                .in('target_post_id', postIds)
                .gte('created_at', startDate.toISOString()),
            // Gap contributions (reading suggestions, collaboration offers, etc.)
            supabase
                .from('gap_contributions')
                .select('id, created_at')
                .eq('user_id', user.id)
                .gte('created_at', startDate.toISOString())
        ])

        const { count: currentFollowers } = await supabase
            .from('follows')
            .select('id', { count: 'exact', head: true })
            .eq('following_id', user.id)

        // Aggregate data by day for charts
        const viewsByDay: Record<string, number> = {}
        const commentsByDay: Record<string, number> = {}
        const pollsByDay: Record<string, number> = {}
        const citationsByDay: Record<string, number> = {}
        const contributionsByDay: Record<string, number> = {}

        const dateRange = eachDayOfInterval({
            start: startDate,
            end: new Date()
        })

        dateRange.forEach(date => {
            const key = format(date, 'yyyy-MM-dd')
            viewsByDay[key] = 0
            commentsByDay[key] = 0
            pollsByDay[key] = 0
            citationsByDay[key] = 0
            contributionsByDay[key] = 0
        })

        // Helper to aggregate by day
        const aggregateByDay = (data: any[] | null, dayMap: Record<string, number>) => {
            if (data) {
                data.forEach((item: any) => {
                    const key = format(new Date(item.created_at), 'yyyy-MM-dd')
                    if (dayMap[key] !== undefined) {
                        dayMap[key]++
                    }
                })
            }
        }

        aggregateByDay(currentViews, viewsByDay)
        aggregateByDay(currentComments, commentsByDay)
        aggregateByDay(currentPollVotes, pollsByDay)
        aggregateByDay(currentCitations, citationsByDay)
        aggregateByDay(currentGapContributions, contributionsByDay)

        const viewsOverTime = dateRange.map(date => {
            const key = format(date, 'yyyy-MM-dd')
            return {
                date: format(date, 'MMM d'),
                fullDate: key,
                views: viewsByDay[key] || 0,
                comments: commentsByDay[key] || 0,
                polls: pollsByDay[key] || 0,
                citations: citationsByDay[key] || 0,
                contributions: contributionsByDay[key] || 0
            }
        })

        // Fallback for votes over time if needed, or simple trends
        const viewsTrend = 0 // Calculated in specific period queries if needed, using simple 0 for now to focus on totals

        const finalResponse = {
            totalViews,
            totalVotes,
            totalCitations,
            totalComments,
            totalFollowers: stats?.followers || currentFollowers || 0,
            // Always use filtered posts count (published, excluding answers)
            publications: (posts || []).length,
            projects: stats?.projects || 0,
            totalInteractions: (stats?.comments_made || 0) + (stats?.lab_contributions || 0),
            viewsTrend,
            votesTrend: 0,
            followersTrend: 0,
            viewsOverTime
        }
        console.log('[Analytics] Final response:', JSON.stringify(finalResponse, null, 2))
        return NextResponse.json(finalResponse)
    } catch (error) {
        console.error('Researcher analytics error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
