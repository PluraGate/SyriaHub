import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyQAFlow() {
    console.log('--- Verifying Q&A Flow ---')
    console.log('URL present:', !!supabaseUrl)
    console.log('Service Key present:', !!supabaseServiceKey)
    console.log('Anon Key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    // 1. Setup Data
    console.log('Setting up users...')
    const askerEmail = `asker_${Date.now()}@test.com`
    const answererEmail = `answerer_${Date.now()}@test.com`
    const password = 'password123'

    const { data: { user: asker } } = await supabase.auth.admin.createUser({
        email: askerEmail, password, email_confirm: true, user_metadata: { name: 'Asker' }
    })
    const { data: { user: answerer } } = await supabase.auth.admin.createUser({
        email: answererEmail, password, email_confirm: true, user_metadata: { name: 'Answerer' }
    })

    if (!asker || !answerer) {
        console.error('Failed to create users')
        return
    }

    let question: any

    try {
        // 2. Ask Question
        console.log('\nAsking question...')
        const { data: q } = await supabase
            .from('posts')
            .insert({
                title: 'How do I mark a solution?',
                content: 'I need to know how to mark a solution.',
                content_type: 'question',
                author_id: asker.id,
                status: 'published'
            })
            .select()
            .single()

        question = q

        if (!question) throw new Error('Failed to create question')
        console.log('Question created:', question.id)

        // 3. Answer Question
        console.log('\nAnswering question...')
        const { data: answer } = await supabase
            .from('posts')
            .insert({
                content: 'You click the checkmark button.',
                content_type: 'answer',
                parent_id: question.id,
                author_id: answerer.id,
                status: 'published',
                title: 'Answer'
            })
            .select()
            .single()

        if (!answer) throw new Error('Failed to create answer')
        console.log('Answer created:', answer.id)

        // 4. Mark Solution (Simulate RPC call as Asker)
        console.log('\nMarking solution...')
        // We need to impersonate the asker to call the RPC if we want to test RLS/permissions strictly,
        // but here we are using admin client. 
        // However, the RPC checks `auth.uid()`. 
        // Since we are using service role, `auth.uid()` might be null or we can fake it.
        // Actually, `supabase-js` admin client bypasses RLS, but RPC logic `IF v_question_author_id != auth.uid()` might fail if `auth.uid()` is null.
        // We can sign in as asker to test properly.

        const askerClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
        await askerClient.auth.signInWithPassword({ email: askerEmail, password })

        const { error: rpcError } = await askerClient.rpc('mark_solution', {
            question_id: question.id,
            answer_id: answer.id
        })

        if (rpcError) {
            console.error('RPC failed:', rpcError)
        } else {
            console.log('RPC success')
        }

        // 5. Verify Updates
        console.log('\nVerifying updates...')

        // Check Question
        const { data: updatedQuestion } = await supabase
            .from('posts')
            .select('accepted_answer_id')
            .eq('id', question.id)
            .single()

        if (updatedQuestion?.accepted_answer_id === answer.id) {
            console.log('SUCCESS: Question has accepted_answer_id')
        } else {
            console.error('FAILURE: Question missing accepted_answer_id')
        }

        // Check Answer
        const { data: updatedAnswer } = await supabase
            .from('posts')
            .select('is_accepted')
            .eq('id', answer.id)
            .single()

        if (updatedAnswer?.is_accepted) {
            console.log('SUCCESS: Answer is marked as accepted')
        } else {
            console.error('FAILURE: Answer not marked accepted')
        }

        // Check Reputation
        const { data: answererProfile } = await supabase
            .from('users')
            .select('reputation')
            .eq('id', answerer.id)
            .single()

        if (answererProfile?.reputation === 15) { // 15 points as per migration
            console.log('SUCCESS: Answerer received reputation')
        } else {
            console.error('FAILURE: Reputation mismatch', answererProfile?.reputation)
        }

    } catch (err) {
        console.error('Unexpected error:', err)
    } finally {
        // Cleanup
        console.log('\nCleaning up...')
        await supabase.from('posts').delete().eq('id', question?.id) // Cascade deletes answer
        await supabase.auth.admin.deleteUser(asker.id)
        await supabase.auth.admin.deleteUser(answerer.id)
        console.log('Done.')
    }
}

verifyQAFlow()
