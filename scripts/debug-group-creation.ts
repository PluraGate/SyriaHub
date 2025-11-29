import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

// Use service key to bypass Auth for initial setup, but we want to test AS A USER.
// So we need to sign in as a user.
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugGroupCreation() {
    console.log('🔍 Debugging Group Creation...')

    // 1. Sign in as researcher
    const { data: { user, session }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'researcher@syrealize.org',
        password: 'password123'
    })

    if (authError || !user || !session) {
        console.error('❌ Auth failed:', authError)
        return
    }
    console.log('✅ Signed in as:', user.email)

    // Create a client acting as the user (RLS applies)
    // Note: supabase-js with service key bypasses RLS. We need a client with the USER's token.
    // But signInWithPassword on the service client sets the session on that client?
    // Yes, usually. Let's verify.

    // Actually, better to create a new client with the user's access token to be sure we are testing RLS.
    const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        }
    })

    const slug = `debug-group-${Date.now()}`

    console.log('1️⃣ Attempting to create group...')
    const { data: group, error: groupError } = await userClient
        .from('groups')
        .insert({
            name: 'Debug Group',
            description: 'Debugging RLS',
            visibility: 'private',
            slug: slug,
            created_by: user.id
        })
        .select()
        .single()

    if (groupError) {
        console.error('❌ Group creation failed:', groupError)
        return
    }
    console.log('✅ Group created:', group.id)

    console.log('2️⃣ Attempting to add owner...')
    const { error: memberError } = await userClient
        .from('group_members')
        .insert({
            group_id: group.id,
            user_id: user.id,
            role: 'owner'
        })

    if (memberError) {
        console.error('❌ Member addition failed:', memberError)

        // Cleanup
        console.log('🧹 Cleaning up group...')
        await supabase.from('groups').delete().eq('id', group.id)
    } else {
        console.log('✅ Member added successfully!')

        // Verify visibility
        console.log('3️⃣ Verifying visibility...')
        const { data: fetchedGroup, error: fetchError } = await userClient
            .from('groups')
            .select('*, members:group_members(*)')
            .eq('id', group.id)
            .single()

        if (fetchError) {
            console.error('❌ Failed to fetch group after creation:', fetchError)
        } else {
            console.log('✅ Group fetched successfully:', fetchedGroup.name)
        }
    }
}

debugGroupCreation().catch(console.error)
