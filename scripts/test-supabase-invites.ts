import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Supabase Invite System Diagnostic')
console.log('=====================================\n')

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing')
    process.exit(1)
}

console.log('✅ Environment variables loaded')
console.log('   URL:', supabaseUrl)
console.log('')

// Use service role key to bypass RLS for diagnostics
const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseKey)

async function runDiagnostics() {
    try {
        // Test 1: Check if invite_codes table exists
        console.log('📋 Test 1: Checking invite_codes table...')
        const { data: invites, error: invitesError } = await supabase
            .from('invite_codes')
            .select('*')
            .limit(1)

        if (invitesError) {
            console.error('   ❌ Error:', invitesError.message)
            console.error('   Code:', invitesError.code)
            console.error('   Details:', invitesError.details)
        } else {
            console.log('   ✅ invite_codes table exists')
            console.log('   Found', invites?.length ?? 0, 'records (limited to 1)')
        }

        // Test 2: Check if waitlist table exists
        console.log('\n📋 Test 2: Checking waitlist table...')
        const { data: waitlist, error: waitlistError } = await supabase
            .from('waitlist')
            .select('*')
            .limit(1)

        if (waitlistError) {
            console.error('   ❌ Error:', waitlistError.message)
        } else {
            console.log('   ✅ waitlist table exists')
        }

        // Test 3: Try to insert a test invite code
        console.log('\n📋 Test 3: Testing insert into invite_codes...')
        const testCode = 'TEST-' + Math.random().toString(36).substring(2, 6).toUpperCase()

        const { data: insertData, error: insertError } = await supabase
            .from('invite_codes')
            .insert({
                code: testCode,
                created_by: null, // No user for test
                note: 'Diagnostic test - safe to delete',
            })
            .select()
            .single()

        if (insertError) {
            console.error('   ❌ Insert error:', insertError.message)
            console.error('   Code:', insertError.code)
        } else {
            console.log('   ✅ Insert successful!')
            console.log('   Created code:', insertData.code)

            // Clean up test record
            await supabase.from('invite_codes').delete().eq('id', insertData.id)
            console.log('   🧹 Test record cleaned up')
        }

        // Test 4: Check get_user_invite_stats function
        console.log('\n📋 Test 4: Testing get_user_invite_stats RPC...')
        const { data: stats, error: statsError } = await supabase.rpc('get_user_invite_stats', {
            p_user_id: '00000000-0000-0000-0000-000000000000' // Fake UUID
        })

        if (statsError) {
            console.error('   ❌ RPC error:', statsError.message)
        } else {
            console.log('   ✅ RPC function works!')
            console.log('   Stats:', stats)
        }

        // Test 5: List table columns
        console.log('\n📋 Test 5: Checking invite_codes columns...')
        const { data: columns, error: columnsError } = await supabase
            .rpc('get_table_columns', { table_name: 'invite_codes' })
            .catch(() => ({ data: null, error: { message: 'RPC not available' } }))

        // Alternative: just try to select all columns
        const { data: sample, error: sampleError } = await supabase
            .from('invite_codes')
            .select('id, code, created_by, used_by, created_at, is_active, max_uses, current_uses, note, expires_at, used_at')
            .limit(0)

        if (sampleError) {
            console.log('   ⚠️  Some columns might be missing:', sampleError.message)
        } else {
            console.log('   ✅ All expected columns exist')
        }

        console.log('\n=====================================')
        console.log('✅ Diagnostics complete!')

    } catch (error) {
        console.error('\n❌ Unexpected error:', error)
    }
}

runDiagnostics()
