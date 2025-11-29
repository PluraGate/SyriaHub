import { NextResponse } from 'next/server'
import { createServerClient, verifyAuth } from '@/lib/supabaseClient'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: answerId } = await params
        const user = await verifyAuth()
        const supabase = await createServerClient()

        // 1. Get the answer to find its parent (the question)
        const { data: answer, error: answerError } = await supabase
            .from('posts')
            .select('parent_id, id')
            .eq('id', answerId)
            .single()

        if (answerError || !answer) {
            return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
        }

        if (!answer.parent_id) {
            return NextResponse.json({ error: 'This post is not an answer' }, { status: 400 })
        }

        // 2. Get the question to verify ownership
        const { data: question, error: questionError } = await supabase
            .from('posts')
            .select('author_id')
            .eq('id', answer.parent_id)
            .single()

        if (questionError || !question) {
            return NextResponse.json({ error: 'Parent question not found' }, { status: 404 })
        }

        if (question.author_id !== user.id) {
            return NextResponse.json(
                { error: 'Only the author of the question can accept an answer' },
                { status: 403 }
            )
        }

        // 3. Unmark any other accepted answers for this question
        await supabase
            .from('posts')
            .update({ is_accepted: false })
            .eq('parent_id', answer.parent_id)
            .eq('is_accepted', true)

        // 4. Mark this answer as accepted
        const { error: updateError } = await supabase
            .from('posts')
            .update({ is_accepted: true })
            .eq('id', answerId)

        if (updateError) {
            throw updateError
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Accept answer error:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
