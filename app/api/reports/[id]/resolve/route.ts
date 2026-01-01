import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!userData || !['admin', 'moderator'].includes(userData.role)) {
        return new Response('Forbidden', { status: 403 })
    }

    // Update report status
    const { error } = await supabase
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', id)

    if (error) {
        console.error('Error resolving report:', error)
        return new Response('Error', { status: 500 })
    }

    redirect('/admin/reports')
}
