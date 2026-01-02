import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/apiUtils'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // SECURITY: Validate origin for CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }
    
    const { id: answerId } = await params
    const supabase = await createClient()

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get the answer to find the question ID
        const { data: answer, error: answerError } = await supabase
            .from('posts')
            .select('parent_id')
            .eq('id', answerId)
            .single()

        if (answerError || !answer) {
            return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
        }

        if (!answer.parent_id) {
            return NextResponse.json({ error: 'This post is not an answer' }, { status: 400 })
        }

        // Call RPC to mark solution
        const { error: rpcError } = await supabase.rpc('mark_solution', {
            question_id: answer.parent_id,
            answer_id: answerId
        })

        if (rpcError) {
            console.error('RPC Error:', rpcError)
            return NextResponse.json({ error: rpcError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error accepting answer:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
