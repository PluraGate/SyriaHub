import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addComments() {
    console.log('💬 Adding comments...')

    // 1. Get a post
    const { data: posts } = await supabase
        .from('posts')
        .select('id, title')
        .ilike('title', '%Water Infrastructure%')
        .single()

    if (!posts) {
        console.error('Post not found')
        return
    }

    const postId = posts.id
    console.log('Target Post:', posts.title)

    // 2. Get a user
    const { data: users } = await supabase.auth.admin.listUsers()
    const userId = users.users[0].id

    // 3. Insert comments
    const comments = [
        { content: 'Great research!', post_id: postId, user_id: userId },
        { content: 'Very relevant to our work.', post_id: postId, user_id: userId },
        { content: 'Can you share more data?', post_id: postId, user_id: userId },
        { content: 'This is crucial.', post_id: postId, user_id: userId },
        { content: 'Thanks for sharing.', post_id: postId, user_id: userId }
    ]

    const { error } = await supabase
        .from('comments')
        .insert(comments)

    if (error) {
        console.error('Error adding comments:', error)
    } else {
        console.log('✅ Added 5 comments to post.')
    }
}

addComments().catch(console.error)
