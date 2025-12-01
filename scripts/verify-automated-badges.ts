import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyAutomatedBadges() {
    console.log('--- Verifying Automated Badges ---')

    // 1. Create Test User
    console.log('Creating test user...')
    const email = `badge_test_${Date.now()}@test.com`
    const password = 'password123'

    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: 'Badge Tester' }
    })

    if (createError || !user) {
        console.error('Failed to create user:', createError)
        return
    }
    console.log('User created:', user.id)

    try {
        // 2. Test "First Step" Badge (1 Post)
        console.log('\nTesting "First Step" Badge (1 Post)...')
        const { error: postError } = await supabase
            .from('posts')
            .insert({
                title: 'My First Post',
                content: 'Hello World',
                content_type: 'article',
                author_id: user.id,
                status: 'published'
            })

        if (postError) throw new Error('Failed to create post')

        // Check for badge
        const { data: badges1 } = await supabase
            .from('user_badges')
            .select('badge:badges(name)')
            .eq('user_id', user.id)

        const hasFirstStep = badges1?.some((b: any) => b.badge.name === 'First Step')
        if (hasFirstStep) {
            console.log('SUCCESS: "First Step" badge awarded')
        } else {
            console.error('FAILURE: "First Step" badge NOT awarded')
        }

        // 3. Test "Expert" Badge (100 Reputation)
        console.log('\nTesting "Expert" Badge (100 Reputation)...')
        // Award reputation manually to trigger update
        const { error: repError } = await supabase.rpc('award_reputation', {
            target_user_id: user.id,
            points: 100
        })

        if (repError) throw new Error('Failed to award reputation')

        // Check for badge
        const { data: badges2 } = await supabase
            .from('user_badges')
            .select('badge:badges(name)')
            .eq('user_id', user.id)

        const hasExpert = badges2?.some((b: any) => b.badge.name === 'Expert')
        if (hasExpert) {
            console.log('SUCCESS: "Expert" badge awarded')
        } else {
            console.error('FAILURE: "Expert" badge NOT awarded')
        }

    } catch (err) {
        console.error('Unexpected error:', err)
    } finally {
        // Cleanup
        console.log('\nCleaning up...')
        await supabase.from('posts').delete().eq('author_id', user.id)
        await supabase.auth.admin.deleteUser(user.id)
        console.log('Done.')
    }
}

verifyAutomatedBadges()
