
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:55331'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
    const email = 'admin@syrealize.com'
    const password = 'password123'

    console.log(`Creating user ${email}...`)

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: 'Admin User',
            role: 'admin'
        }
    })

    if (error) {
        console.error('Error creating user:', error.message)
        return
    }

    console.log('User created successfully:', data.user.id)
}

createAdminUser()
