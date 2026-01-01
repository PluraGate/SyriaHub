
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function promoteUser() {
    // Get the first user
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    if (userError || !users || users.length === 0) {
        console.error('No users found.')
        return
    }
    const userId = users[0].id
    console.log(`Promoting user ${userId} to admin...`)

    const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId)

    if (error) {
        console.error('Failed to update role:', error)
    } else {
        console.log('SUCCESS: User role updated to admin.')
    }
}

promoteUser()
