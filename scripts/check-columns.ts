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

console.log('🌍 Connecting to Supabase at:', supabaseUrl)

// Try overriding to port 54321 if the env var is pointing to 54323 (Studio)
const apiUrl = supabaseUrl?.replace('54323', '54321')
console.log('🔄 Trying API URL:', apiUrl)

const supabase = createClient(apiUrl!, supabaseServiceKey)

async function checkColumns() {
    console.log('🔍 Checking columns for table "posts"...')

    // Sign in first
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'researcher@syrealize.org',
        password: 'password123'
    })

    if (authError || !user) {
        console.log('⚠️ Auth failed, trying to create temp user...')
        // Try creating a temp user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: 'diag_tester@syrealize.org',
            password: 'password123',
            options: { data: { name: 'Diag Tester' } }
        })

        if (signUpError) {
            console.log('❌ Could not sign in or sign up:', signUpError)
            // Proceeding anonymously might fail if RLS is strict
        } else {
            console.log('✅ Signed up as:', signUpData.user?.email)
        }
    } else {
        console.log('✅ Signed in as:', user.email)
    }

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .limit(1)

    if (error) {
        console.error('❌ Error fetching posts:', error)
        return
    }

    if (data && data.length > 0) {
        const keys = Object.keys(data[0])
        console.log('Found columns:', keys)
        if (keys.includes('parent_id')) console.log('✅ parent_id column EXISTS!')
        else console.log('❌ parent_id column MISSING!')

        if (keys.includes('content_type')) console.log('✅ content_type column EXISTS!')
        else console.log('❌ content_type column MISSING!')

    } else {
        console.log('⚠️ No posts found to check columns. Creating a dummy post...')
        const { data: currentUser } = await supabase.auth.getUser()

        const { data: newPost, error: createError } = await supabase
            .from('posts')
            .insert({
                title: 'Schema Check',
                content: 'Checking schema',
                author_id: currentUser.user?.id
            })
            .select()
            .single()

        if (createError) {
            console.log('Could not create post to check:', createError)
        } else {
            const keys = Object.keys(newPost)
            console.log('Found columns:', keys)
            if (keys.includes('parent_id')) console.log('✅ parent_id column EXISTS!')
            else console.log('❌ parent_id column MISSING!')

            if (keys.includes('content_type')) console.log('✅ content_type column EXISTS!')
            else console.log('❌ content_type column MISSING!')

            // Cleanup
            await supabase.from('posts').delete().eq('id', newPost.id)
        }
    }
}

checkColumns()
