import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rateLimit'
import { validateOrigin } from '@/lib/apiUtils'

async function handlePost(request: Request) {
    // SECURITY: Validate origin for CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }
    
    const supabase = await createClient()

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Check permissions (Mock: allow anyone for now, or check role if roles table is populated)
    // In a real app, we would query the users table to check role = 'moderator' | 'admin'
    // For this demo, we'll assume if they can call this, they are authorized (RLS will enforce DB writes anyway)

    try {
        const { postVersionId } = await request.json()

        if (!postVersionId) {
            return NextResponse.json({ error: 'Missing postVersionId' }, { status: 400 })
        }

        // 3. Simulate external API call (e.g. Turnitin)
        await new Promise(resolve => setTimeout(resolve, 1500)) // 1.5s delay

        // Generate random score
        const score = Math.floor(Math.random() * 30) // Mostly clean (0-30%)
        const isFlagged = score > 20
        const status = 'completed'

        // 4. Save result to database
        const { data, error } = await supabase
            .from('plagiarism_checks')
            .insert({
                post_version_id: postVersionId,
                provider: 'mock-detector-v1',
                status: status,
                score: score,
                flagged: isFlagged,
                summary: isFlagged ? 'Potential overlap detected with external sources.' : 'Content appears original.',
                raw_response: { mock_id: '123', confidence: 0.95 }
            })
            .select()
            .single()

        if (error) {
            console.error('Database error:', error)
            return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
        }

        return NextResponse.json(data)

    } catch (e) {
        console.error('API error:', e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// SECURITY: Apply rate limiting to plagiarism checks (AI rate - stricter)
export const POST = withRateLimit('ai')(handlePost)
