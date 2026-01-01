
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS for test

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCreatePost() {
    console.log('Testing post creation...')

    // 1. Get a user (or create one if needed, but we'll try to find one)
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    if (userError || !users || users.length === 0) {
        console.error('No users found to test with. Please create a user first.')
        return
    }
    const userId = users[0].id
    console.log(`Using user: ${userId}`)

    // 2. Insert a post with content_type and group_id (null for now, or create a group)
    // We'll test with group_id: null first, as that was also failing if column didn't exist
    const { data, error } = await supabase
        .from('posts')
        .insert({
            title: 'Test Post Verification',
            content: 'This is a test post to verify schema.',
            tags: ['test'],
            author_id: userId,
            content_type: 'article', // Test content_type
            status: 'draft',        // Test status
            group_id: null          // Test group_id column existence
        })
        .select()
        .single()

    if (error) {
        console.error('FAILED to create post:', error)
        process.exit(1)
    } else {
        console.log('SUCCESS: Post created with ID:', data.id)

        // Clean up
        await supabase.from('posts').delete().eq('id', data.id)
        console.log('Cleaned up test post.')
    }
}

testCreatePost()
