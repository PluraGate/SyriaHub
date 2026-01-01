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

// TypeScript type narrowing: assert these are strings after the check
const url: string = supabaseUrl
const serviceKey: string = supabaseServiceKey

const supabase = createClient(url, serviceKey)

async function listPosts() {
    console.log('Listing posts...')
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            id, 
            title, 
            author_id,
            author:users!posts_author_id_fkey(id, name, email)
        `)

    if (error) {
        console.error('Error fetching posts:', error)
        return
    }

    console.log('Found posts:', posts.length)
    posts.forEach(post => {
        console.log(`- ${post.title} (${post.id})`)
        console.log(`  Author ID: ${post.author_id}`)
        // Author is returned as an array, get first element
        const authorData = Array.isArray(post.author) ? post.author[0] : post.author
        console.log(`  Author Found: ${authorData ? 'Yes' : 'NO'}`)
        if (authorData) {
            console.log(`  Author Name: ${authorData.name}`)
        }
    })
}

listPosts().catch(console.error)
