
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFetch() {
    console.log('Testing fetch of a single post...')

    // 1. Get any post ID
    const { data: posts, error: listError } = await supabase
        .from('posts')
        .select('id')
        .limit(1)

    if (listError) {
        console.error('Error listing posts:', listError)
        return
    }

    if (!posts || posts.length === 0) {
        console.log('No posts found in DB.')
        return
    }

    const id = posts[0].id
    console.log(`Fetching post ${id}...`)

    // 2. Try the problematic query
    const { data: post, error } = await supabase
        .from('posts')
        .select(
            `
        *,
        author:users!posts_author_id_fkey(id, name, email, bio, affiliation),
        forked_from:posts!posts_forked_from_id_fkey(id, title)
      `
        )
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching post with relations:', JSON.stringify(error, null, 2))

        // 3. Try without the new relation to confirm that's the issue
        console.log('Retrying without forked_from relation...')
        const { data: postSimple, error: errorSimple } = await supabase
            .from('posts')
            .select(
                `
            *,
            author:users!posts_author_id_fkey(id, name, email, bio, affiliation)
        `
            )
            .eq('id', id)
            .single()

        if (errorSimple) {
            console.error('Error fetching post WITHOUT forked_from:', errorSimple)
        } else {
            console.log('Success fetching post WITHOUT forked_from. The issue is likely the FK name.')
        }

    } else {
        console.log('Success! Post fetched:', post.title)
        console.log('Forked from:', post.forked_from)
    }
}

testFetch()
