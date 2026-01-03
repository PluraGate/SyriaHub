import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

// DELETE /api/question-advisor/history/[id]
async function handleDelete(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    const supabase = await createClient()
    const { id } = await params

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const { error } = await supabase
            .from('question_history')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Delete question history error:', error)
        return NextResponse.json(
            { error: 'Failed to delete' },
            { status: 500 }
        )
    }
}

export const DELETE = withRateLimit('write')(handleDelete)
