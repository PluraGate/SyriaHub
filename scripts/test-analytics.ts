import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAnalytics() {
    console.log('--- Testing Analytics Dashboard ---')

    // 1. Setup User
    console.log('Setting up user...')
    const email = `analytics_test_${Date.now()}@test.com`
    const password = 'password123'

    const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true
    })

    if (userError || !user) {
        console.error('Failed to create user', userError)
        return
    }

    // 2. Create Post
    console.log('\nCreating post...')
    const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
            title: 'Analytics Test Post',
            content: 'Testing view counts.',
            content_type: 'article',
            author_id: user.id,
            status: 'published',
            view_count: 0
        })
        .select()
        .single()

    if (postError || !post) {
        console.error('Failed to create post', postError)
        return
    }
    console.log('SUCCESS: Post created', post.id)

    // 3. Increment View Count (Simulate API call)
    console.log('\nIncrementing view count...')
    const { error: rpcError } = await supabase.rpc('increment_view_count', {
        post_id: post.id
    })

    if (rpcError) {
        console.error('Failed to increment views', rpcError)
    } else {
        console.log('SUCCESS: View count incremented via RPC')
    }

    // 4. Verify View Count
    console.log('\nVerifying view count...')
    const { data: updatedPost } = await supabase
        .from('posts')
        .select('view_count')
        .eq('id', post.id)
        .single()

    if (updatedPost?.view_count === 1) {
        console.log('SUCCESS: View count is 1')
    } else {
        console.error('FAILURE: View count mismatch', updatedPost?.view_count)
    }

    // Cleanup
    console.log('\nCleaning up...')
    await supabase.from('posts').delete().eq('id', post.id)
    await supabase.auth.admin.deleteUser(user.id)

    console.log('Done.')
}

testAnalytics()
