/**
 * Setup Main Admin Script
 * 
 * This script sets up the main admin user (latif@lavartstudio.com) with admin rights.
 * Run this after a database clear/reset to restore admin access.
 * 
 * Usage:
 *   npx ts-node scripts/setup-main-admin.ts
 *   
 * Or add to package.json scripts:
 *   "setup:admin": "ts-node scripts/setup-main-admin.ts"
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const MAIN_ADMIN_EMAIL = 'latif@lavartstudio.com'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupMainAdmin() {
    console.log('🔧 Setting up main admin...')
    console.log(`   Email: ${MAIN_ADMIN_EMAIL}\n`)

    // Step 1: Find the user in auth.users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
        console.error('❌ Failed to list users:', listError.message)
        process.exit(1)
    }

    const adminUser = users?.find(u => u.email === MAIN_ADMIN_EMAIL)

    if (!adminUser) {
        console.error(`❌ User with email "${MAIN_ADMIN_EMAIL}" not found in auth.users`)
        console.error('   The user needs to sign up first before being promoted to admin.')
        console.log('\n   Available users:')
        users?.slice(0, 5).forEach(u => console.log(`     - ${u.email}`))
        if (users && users.length > 5) {
            console.log(`     ... and ${users.length - 5} more`)
        }
        process.exit(1)
    }

    console.log(`✓ Found user in auth.users (ID: ${adminUser.id})`)

    // Step 2: Check if user profile exists
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('id', adminUser.id)
        .single()

    if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Error checking user profile:', profileError.message)
        process.exit(1)
    }

    if (!profile) {
        // Create the profile if it doesn't exist
        console.log('⚠️  User profile not found, creating...')
        
        const { error: insertError } = await supabase
            .from('users')
            .insert({
                id: adminUser.id,
                email: MAIN_ADMIN_EMAIL,
                name: adminUser.user_metadata?.name || 'Main Admin',
                role: 'admin'
            })

        if (insertError) {
            console.error('❌ Failed to create user profile:', insertError.message)
            process.exit(1)
        }

        console.log('✓ Created user profile with admin role')
    } else {
        // Update existing profile to admin
        if (profile.role === 'admin') {
            console.log('✓ User already has admin role')
        } else {
            console.log(`⚠️  Current role: ${profile.role}, updating to admin...`)

            const { error: updateError } = await supabase
                .from('users')
                .update({ role: 'admin' })
                .eq('id', adminUser.id)

            if (updateError) {
                console.error('❌ Failed to update role:', updateError.message)
                process.exit(1)
            }

            console.log('✓ Updated role to admin')
        }
    }

    console.log('\n✅ Main admin setup complete!')
    console.log(`   ${MAIN_ADMIN_EMAIL} now has full admin access.`)
}

setupMainAdmin().catch(err => {
    console.error('❌ Unexpected error:', err)
    process.exit(1)
})
