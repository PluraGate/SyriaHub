import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugInsert() {
    console.log('Debugging Post Insert...')

    // Create user
    const { data: { user }, error: uError } = await supabase.auth.admin.createUser({
        email: `debug_user_${Date.now()}@test.com`,
        password: 'password123',
        email_confirm: true
    })

    if (uError || !user) {
        console.error('User creation failed:', uError)
        return
    }
    console.log('User created:', user.id)

    // Insert Post
    const { data, error } = await supabase.from('posts').insert({
        title: 'Debug Post',
        content: 'Debug Content',
        content_type: 'article',
        author_id: user.id,
        status: 'published'
    }).select().single()

    if (error) {
        console.error('Insert Error:', JSON.stringify(error, null, 2))
    } else {
        console.log('Insert Success:', data)
    }

    // Cleanup
    await supabase.auth.admin.deleteUser(user.id)
}

debugInsert()
