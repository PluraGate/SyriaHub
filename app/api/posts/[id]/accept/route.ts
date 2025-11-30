import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params // Answer ID
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get answer to find parent question
    const { data: answer } = await supabase
        .from('posts')
        .select('parent_id, author_id')
        .eq('id', id)
        .single()

    if (!answer || !answer.parent_id) {
        return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
    }

    // Verify user is the author of the QUESTION (parent)
    const { data: question } = await supabase
        .from('posts')
        .select('author_id')
        .eq('id', answer.parent_id)
        .single()

    if (!question || question.author_id !== user.id) {
        return NextResponse.json({ error: 'Only the question author can accept an answer' }, { status: 403 })
    }

    // Unaccept any other answer for this question
    await supabase
        .from('posts')
        .update({ is_accepted: false })
        .eq('parent_id', answer.parent_id)

    // Accept this answer
    const { error } = await supabase
        .from('posts')
        .update({ is_accepted: true })
        .eq('id', id)

    if (error) {
        console.error('Accept error:', error)
        return NextResponse.json({ error: 'Failed to accept answer' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
