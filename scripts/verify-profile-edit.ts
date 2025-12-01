
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

async function verifyProfileEdit() {
    console.log('👤 Verifying Profile Editing...')

    // 1. Create a test user
    const email = `profile_test_${Date.now()}@example.com`
    const password = 'password123'

    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: 'Original Name' }
    })

    if (createError || !user) {
        console.error('❌ Failed to create user:', createError)
        return
    }
    console.log('✅ Created test user:', user.id)

    // 2. Sign in as user to get session (simulate frontend)
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (loginError || !session) {
        console.error('❌ Login failed:', loginError)
        return
    }

    // Create client acting as user
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!anonKey) {
        console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
        return
    }

    const userClient = createClient(url, anonKey, {
        global: {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        }
    })

    // 3. Update Profile
    const newName = 'Updated Name'
    const newBio = 'This is my new bio.'
    const newAffiliation = 'Test University'

    console.log('📝 Updating profile...')
    const { error: updateError } = await userClient
        .from('users')
        .update({
            name: newName,
            bio: newBio,
            affiliation: newAffiliation
        })
        .eq('id', user.id)

    if (updateError) {
        console.error('❌ Update failed:', updateError)
        return
    }

    // 4. Verify Persistence
    console.log('🔍 Verifying persistence...')
    const { data: profile, error: fetchError } = await userClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    if (fetchError) {
        console.error('❌ Fetch failed:', fetchError)
        return
    }

    if (profile.name === newName && profile.bio === newBio && profile.affiliation === newAffiliation) {
        console.log('✅ Profile updated successfully!')
        console.log('   Name:', profile.name)
        console.log('   Bio:', profile.bio)
        console.log('   Affiliation:', profile.affiliation)
    } else {
        console.error('❌ Profile mismatch!')
        console.log('Expected:', { newName, newBio, newAffiliation })
        console.log('Got:', profile)
    }

    // Cleanup
    await supabase.auth.admin.deleteUser(user.id)
    console.log('🧹 Cleanup done')
}

verifyProfileEdit().catch(console.error)
