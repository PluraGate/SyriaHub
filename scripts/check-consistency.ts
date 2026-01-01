import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkConsistency() {
    console.log('🔍 Checking database consistency...')

    // 1. Check Users
    const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')

    if (usersError) {
        console.error('❌ Error fetching users:', usersError)
    } else {
        console.log(`✅ Found ${users.length} users in public.users`)
        users.forEach(u => console.log(`   - ${u.id} (${u.email})`))
    }

    // 2. Check Posts and their Authors
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, title, author_id')

    if (postsError) {
        console.error('❌ Error fetching posts:', postsError)
    } else {
        console.log(`✅ Found ${posts.length} posts`)

        for (const post of posts) {
            const authorExists = users?.find(u => u.id === post.author_id)
            if (authorExists) {
                console.log(`   - Post "${post.title}" has valid author ${post.author_id}`)
            } else {
                console.error(`   ❌ Post "${post.title}" has MISSING author ${post.author_id}`)
            }
        }
    }

    // 3. Test Profile Query for each user
    if (users) {
        console.log('🔍 Testing Profile Query for each user...')
        for (const user of users) {
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('id, name, email, bio, affiliation, created_at')
                .eq('id', user.id)
                .single()

            if (profileError) {
                console.error(`   ❌ Failed to fetch profile for ${user.id}:`, profileError)
            } else {
                console.log(`   ✅ Successfully fetched profile for ${user.id}`)
            }
        }
    }
}

checkConsistency().catch(console.error)
