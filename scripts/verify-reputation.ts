import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyReputation() {
    console.log('--- Verifying Reputation System ---')

    // 1. Create Test User
    console.log('Creating test user...')
    const email = `reputation_test_${Date.now()}@test.com`
    const password = 'password123'

    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: 'Reputation Tester' }
    })

    if (createError || !user) {
        console.error('Failed to create user:', createError)
        return
    }
    console.log('User created:', user.id)

    try {
        // 2. Test award_reputation RPC
        console.log('\nTesting award_reputation RPC...')
        // Note: award_reputation is SECURITY DEFINER, so we can call it. 
        // But usually it's called by triggers or internal logic. 
        // We can call it directly as admin (service role) or simulate a call.
        // Let's call it via rpc.
        const { error: rpcError } = await supabase.rpc('award_reputation', {
            target_user_id: user.id,
            points: 50
        })

        if (rpcError) {
            console.error('RPC failed:', rpcError)
        } else {
            console.log('RPC success')
        }

        // 3. Verify Reputation
        console.log('\nVerifying reputation update...')
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('reputation')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.error('Failed to fetch profile:', profileError)
        } else {
            console.log('Current Reputation:', profile.reputation)
            if (profile.reputation === 50) {
                console.log('SUCCESS: Reputation updated correctly')
            } else {
                console.error('FAILURE: Reputation mismatch')
            }
        }

        // 4. Test Badge Assignment
        console.log('\nTesting badge assignment...')
        // Get a badge ID (e.g., 'Verified Researcher')
        const { data: badge } = await supabase
            .from('badges')
            .select('id')
            .eq('name', 'Verified Researcher')
            .single()

        if (badge) {
            const { error: badgeError } = await supabase
                .from('user_badges')
                .insert({
                    user_id: user.id,
                    badge_id: badge.id
                })

            if (badgeError) {
                console.error('Failed to assign badge:', badgeError)
            } else {
                console.log('Badge assigned successfully')
            }

            // 5. Verify Badge Fetch
            console.log('\nVerifying badge fetch...')
            const { data: userBadges } = await supabase
                .from('user_badges')
                .select('*, badge:badges(*)')
                .eq('user_id', user.id)

            if (userBadges && userBadges.length > 0) {
                console.log('SUCCESS: User has badges:', userBadges.map(ub => ub.badge.name))
            } else {
                console.error('FAILURE: No badges found')
            }
        } else {
            console.warn('Skipping badge test: "Verified Researcher" badge not found')
        }

    } catch (err) {
        console.error('Unexpected error:', err)
    } finally {
        // Cleanup
        console.log('\nCleaning up...')
        await supabase.auth.admin.deleteUser(user.id)
        console.log('Done.')
    }
}

verifyReputation()
