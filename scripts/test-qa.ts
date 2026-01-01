import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testQA() {
    console.log('--- Testing Q&A System ---')

    // 1. Setup Data (Asker & Answerer)
    console.log('Setting up users...')
    const askerEmail = `asker_${Date.now()}@test.com`
    const answererEmail = `answerer_${Date.now()}@test.com`
    const password = 'password123'

    const { data: { user: asker } } = await supabase.auth.admin.createUser({
        email: askerEmail, password, email_confirm: true
    })
    const { data: { user: answerer } } = await supabase.auth.admin.createUser({
        email: answererEmail, password, email_confirm: true
    })

    if (!asker || !answerer) {
        console.error('Failed to create users')
        return
    }

    // 2. Ask Question
    console.log('\nAsking question...')
    const { data: question, error: qError } = await supabase
        .from('posts')
        .insert({
            title: 'Test Question',
            content: 'How do I test Q&A?',
            content_type: 'question',
            author_id: asker.id,
            status: 'published'
        })
        .select()
        .single()

    if (qError || !question) {
        console.error('Failed to create question', qError)
        return
    }
    console.log('SUCCESS: Question created', question.id)

    // 3. Answer Question
    console.log('\nAnswering question...')
    const { data: answer, error: aError } = await supabase
        .from('posts')
        .insert({
            content: 'Run this script!',
            content_type: 'answer',
            parent_id: question.id,
            author_id: answerer.id,
            status: 'published',
            title: 'Answer'
        })
        .select()
        .single()

    if (aError || !answer) {
        console.error('Failed to create answer', aError)
        return
    }
    console.log('SUCCESS: Answer created', answer.id)

    // 4. Vote on Question (by Answerer)
    console.log('\nVoting on question...')
    const { error: vError } = await supabase
        .from('post_votes')
        .insert({
            post_id: question.id,
            voter_id: answerer.id,
            value: 1
        })

    if (vError) {
        console.error('Failed to vote', vError)
    } else {
        // Verify count update (trigger)
        const { data: updatedQ } = await supabase
            .from('posts')
            .select('vote_count')
            .eq('id', question.id)
            .single()

        if (updatedQ?.vote_count === 1) {
            console.log('SUCCESS: Vote count updated')
        } else {
            console.error('FAILURE: Vote count mismatch', updatedQ?.vote_count)
        }
    }

    // 5. Accept Answer (by Asker)
    console.log('\nAccepting answer...')
    const { error: acceptError } = await supabase
        .from('posts')
        .update({ is_accepted: true })
        .eq('id', answer.id)

    if (acceptError) {
        console.error('Failed to accept answer', acceptError)
    } else {
        console.log('SUCCESS: Answer accepted')
    }

    // Cleanup
    console.log('\nCleaning up...')
    await supabase.from('posts').delete().eq('id', question.id)
    await supabase.auth.admin.deleteUser(asker.id)
    await supabase.auth.admin.deleteUser(answerer.id)

    console.log('Done.')
}

testQA()
