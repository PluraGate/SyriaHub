import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugStats() {
    const userId = '0b6a2888-6ea1-485c-9ade-66fc3b4d46d1'

    console.log('=== Debug Stats for User:', userId, '===\n')

    // Test 1: RPC call with .single()
    console.log('Test 1: RPC call with .single()')
    const { data: stats1, error: error1 } = await supabase
        .rpc('get_user_stats', { user_uuid: userId })
        .single()
    console.log('Result:', stats1)
    console.log('Error:', error1)

    // Test 2: RPC call without .single()
    console.log('\nTest 2: RPC call without .single()')
    const { data: stats2, error: error2 } = await supabase
        .rpc('get_user_stats', { user_uuid: userId })
    console.log('Result:', stats2)
    console.log('Error:', error2)

    // Test 3: Direct posts count
    console.log('\nTest 3: Direct query - posts count')
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, title, status, author_id')
        .eq('author_id', userId)
    console.log('All posts:', posts)
    console.log('Error:', postsError)

    // Test 4: Published posts only
    console.log('\nTest 4: Published posts only')
    const { data: publishedPosts } = await supabase
        .from('posts')
        .select('id, title, status')
        .eq('author_id', userId)
        .eq('status', 'published')
    console.log('Published posts:', publishedPosts)
    console.log('Count:', publishedPosts?.length || 0)

    // Test 5: Check if function exists
    console.log('\nTest 5: Testing RPC with different user')
    const { data: stats3, error: error3 } = await supabase
        .rpc('get_user_stats', { user_uuid: '00000000-0000-0000-0000-000000000000' })
        .single()
    console.log('Result:', stats3)
    console.log('Error:', error3)
}

debugStats().catch(console.error)
