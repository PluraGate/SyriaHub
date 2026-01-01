
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugFetch() {
    console.log('Listing posts to get an ID...')
    const { data: posts, error: listError } = await supabase
        .from('posts')
        .select('id')
        .limit(1)

    if (listError) {
        console.error('Error listing posts:', listError)
        return
    }

    if (!posts || posts.length === 0) {
        console.log('No posts found.')
        return
    }

    const id = posts[0].id
    console.log(`Fetching post ${id} with relations...`)

    const { data, error } = await supabase
        .from('posts')
        .select(
            `
        *,
        author:users!posts_author_id_fkey(id, name, email, bio, affiliation),
        forked_from:posts!forked_from_id(id, title)
      `
        )
        .eq('id', id)
        .single()

    if (error) {
        console.error('FULL ERROR:', JSON.stringify(error, null, 2))
    } else {
        console.log('Success!', data.title)
    }
}

debugFetch()
