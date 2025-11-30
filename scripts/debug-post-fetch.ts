
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:55331'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

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
