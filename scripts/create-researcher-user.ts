
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

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createResearcher() {
    const email = 'researcher@syrealize.org'
    const password = 'password123'

    console.log(`Creating user: ${email}`)

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            name: 'Test Researcher',
            role: 'researcher' // Assuming 'role' is stored in metadata or handled by trigger
        }
    })

    if (error) {
        console.error('Error creating user:', error)
    } else {
        console.log('User created successfully:', data.user.id)
    }
}

createResearcher()
