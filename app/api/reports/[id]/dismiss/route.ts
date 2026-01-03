import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

async function handlePost(request: Request, { params }: { params: Promise<{ id: string }> }) {
    // CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    const { id } = await params
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!userData || !['admin', 'moderator'].includes(userData.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update report status
    const { error } = await supabase
        .from('reports')
        .update({ status: 'dismissed' })
        .eq('id', id)

    if (error) {
        console.error('Error dismissing report:', error)
        return NextResponse.json({ error: 'Error dismissing report' }, { status: 500 })
    }

    redirect('/admin/reports')
}

export const POST = withRateLimit('write')(handlePost)
