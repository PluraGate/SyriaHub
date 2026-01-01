
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Service role for admin access

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseKey)

async function verifyPlagiarism() {
    console.log('Verifying plagiarism setup...')

    // 1. Check if table exists by trying to select (count)
    const { count, error: tableError } = await adminClient
        .from('plagiarism_checks')
        .select('*', { count: 'exact', head: true })

    if (tableError) {
        console.error('ERROR: plagiarism_checks table access failed. It might be missing.', tableError.message)
    } else {
        console.log('SUCCESS: plagiarism_checks table exists.')
    }

    // 2. Check a user's role
    const { data: { users }, error: userError } = await adminClient.auth.admin.listUsers()
    if (users && users.length > 0) {
        const userId = users[0].id
        const { data: userProfile, error: profileError } = await adminClient
            .from('users')
            .select('role')
            .eq('id', userId)
            .single()

        if (profileError) {
            console.error('Failed to fetch user profile:', profileError)
        } else {
            console.log(`User ${userId} has role: ${userProfile.role}`)
            if (!['moderator', 'admin'].includes(userProfile.role)) {
                console.warn('WARNING: User is not a moderator/admin. RLS will block inserts.')
            }
        }
    }
}

verifyPlagiarism()
