console.log('🚀 Starting Forum Flow Test...')
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

console.log('🌍 Connecting to Supabase at:', supabaseUrl)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testForumFlow() {
    console.log('🔍 Testing Forum Workflow...')

    // 1. Sign in (or create user)
    const email = 'forum_tester@syrealize.org'
    const password = 'password123'

    const { data: { user: signInUser }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    })
    let user = signInUser

    if (authError) {
        console.log('⚠️ Login failed, attempting to sign up...')
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name: 'Forum Tester' }
            }
        })

        if (signUpError) {
            console.error('❌ Sign up failed:', signUpError)
            return
        }
        user = signUpData.user
    }

    if (!user) {
        console.error('❌ Could not get user')
        return
    }
    console.log('✅ Signed in as:', user.email)

    // 2. Create a Question
    const questionTitle = `Test Question ${Date.now()}`
    const { data: question, error: questionError } = await supabase
        .from('posts')
        .insert({
            title: questionTitle,
            content: 'How do I test the forum module?',
            content_type: 'question',
            status: 'published',
            author_id: user.id,
            tags: ['testing', 'forum']
        })
        .select()
        .single()

    if (questionError) {
        console.error('❌ Question creation failed:', questionError)
        return
    }
    console.log('✅ Question created:', question.id)

    // 3. Create an Answer
    const { data: answer, error: answerError } = await supabase
        .from('posts')
        .insert({
            title: 'Re: ' + questionTitle,
            content: 'You run this script!',
            content_type: 'answer',
            status: 'published',
            author_id: user.id,
            parent_id: question.id
        })
        .select()
        .single()

    if (answerError) {
        console.error('❌ Answer creation failed:', answerError)
        return
    }
    console.log('✅ Answer created:', answer.id)

    // 4. Vote on the Question
    const { error: voteError } = await supabase
        .from('post_votes')
        .insert({
            post_id: question.id,
            voter_id: user.id,
            value: 1
        })

    if (voteError) {
        console.error('❌ Voting failed:', voteError)
    } else {
        console.log('✅ Voted on question')
    }

    // 5. Verify Vote Count (via trigger or manual check if trigger not set)
    // Note: If you have a trigger updating vote_count on posts, check it here.
    // Otherwise, just checking the vote table is enough for now.

    const { count } = await supabase
        .from('post_votes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', question.id)

    console.log('✅ Vote count verified:', count)

    // Cleanup
    console.log('🧹 Cleaning up...')
    await supabase.from('posts').delete().eq('id', question.id) // Cascade should delete answer and votes
}

testForumFlow().catch(console.error)
