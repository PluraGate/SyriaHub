import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testQA() {
    console.log('Starting Q&A Verification...')

    // 1. Create a test user (Question Author)
    const { data: qAuthor, error: qUserError } = await supabase.auth.admin.createUser({
        email: `q_author_${Date.now()}@test.com`,
        password: 'password123',
        email_confirm: true
    })
    if (qUserError) throw qUserError
    console.log('Created Question Author:', qAuthor.user.id)

    // 2. Create a test user (Answer Author)
    const { data: aAuthor, error: aUserError } = await supabase.auth.admin.createUser({
        email: `a_author_${Date.now()}@test.com`,
        password: 'password123',
        email_confirm: true
    })
    if (aUserError) throw aUserError
    console.log('Created Answer Author:', aAuthor.user.id)

    // 3. Create a Question
    const { data: question, error: qError } = await supabase
        .from('posts')
        .insert({
            title: 'Test Question',
            content: 'How do I test Q&A?',
            content_type: 'question',
            author_id: qAuthor.user.id,
            status: 'published'
        })
        .select()
        .single()

    if (qError) throw qError
    console.log('Created Question:', question.id)

    // 4. Create an Answer
    const { data: answer, error: aError } = await supabase
        .from('posts')
        .insert({
            title: 'Answer',
            content: 'You run this script.',
            content_type: 'answer',
            parent_id: question.id,
            author_id: aAuthor.user.id,
            status: 'published'
        })
        .select()
        .single()

    if (aError) throw aError
    console.log('Created Answer:', answer.id)

    // 5. Vote on Answer (Upvote by Question Author)
    const { error: voteError } = await supabase
        .from('post_votes')
        .insert({
            post_id: answer.id,
            voter_id: qAuthor.user.id,
            value: 1
        })

    if (voteError) throw voteError
    console.log('Upvoted Answer')

    // 6. Accept Answer (by Question Author)
    // Note: We are simulating the API logic here since we can't call the API route directly from this script easily without running the server.
    // But we can verify the database constraints/logic if any.
    // The API logic ensures only author can accept. Here we just update the DB as admin to verify the column works.
    const { error: acceptError } = await supabase
        .from('posts')
        .update({ is_accepted: true })
        .eq('id', answer.id)

    if (acceptError) throw acceptError
    console.log('Accepted Answer in DB')

    // 7. Verify State
    const { data: verifiedAnswer } = await supabase
        .from('posts')
        .select('*, vote_count:post_votes(value)')
        .eq('id', answer.id)
        .single()

    if (!verifiedAnswer.is_accepted) throw new Error('Answer was not marked as accepted')
    console.log('Verification Successful: Answer is accepted.')

    // Cleanup
    await supabase.from('posts').delete().eq('id', question.id) // Cascades to answer and votes
    await supabase.auth.admin.deleteUser(qAuthor.user.id)
    await supabase.auth.admin.deleteUser(aAuthor.user.id)
    console.log('Cleanup complete.')
}

testQA().catch(console.error)
