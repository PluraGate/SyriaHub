import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testProfile() {
    console.log('--- Testing User Profiles ---')

    // 1. Setup Data
    console.log('Setting up test user...')
    const email = `profile_test_${Date.now()}@test.com`
    const password = 'password123'

    const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: 'Profile Test User' }
    })

    if (userError || !user) {
        console.error('Failed to create user', userError)
        return
    }

    // 2. Update Profile
    console.log('\nUpdating profile...')
    const { error: updateError } = await supabase
        .from('users')
        .update({
            bio: 'This is a test bio',
            affiliation: 'Test University',
            location: 'Test City',
            research_interests: ['Testing', 'Automation']
        })
        .eq('id', user.id)

    if (updateError) {
        console.error('Failed to update profile', updateError)
    } else {
        console.log('SUCCESS: Profile updated')
    }

    // 3. Fetch Profile and Stats
    console.log('\nFetching profile and stats...')
    const { data: profile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    if (fetchError) {
        console.error('Failed to fetch profile', fetchError)
    } else {
        console.log('Profile Data:', {
            bio: profile.bio,
            affiliation: profile.affiliation,
            interests: profile.research_interests
        })

        if (profile.bio === 'This is a test bio' && profile.research_interests.includes('Testing')) {
            console.log('SUCCESS: Profile data verified')
        } else {
            console.error('FAILURE: Profile data mismatch')
        }
    }

    const { data: stats, error: statsError } = await supabase
        .rpc('get_user_stats', { user_uuid: user.id })
        .single()

    if (statsError) {
        console.error('Failed to fetch stats', statsError)
    } else {
        console.log('User Stats:', stats)
        if (stats.post_count === 0 && stats.group_count === 0) {
            console.log('SUCCESS: Stats verified (empty)')
        }
    }

    // Cleanup
    console.log('\nCleaning up...')
    await supabase.auth.admin.deleteUser(user.id)

    console.log('Done.')
}

testProfile()
