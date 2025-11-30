
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testStorage() {
    console.log('🔍 Testing Storage Operations...')

    try {
        // 1. Create a Test User
        const { data: user, error: userError } = await supabase.auth.admin.createUser({
            email: `storage_tester_${Date.now()}@test.com`,
            password: 'password123',
            email_confirm: true
        })
        if (userError) throw userError
        console.log('✅ Created Test User:', user.user.id)

        // 2. Upload Avatar (Simulate)
        // Create a dummy buffer
        const buffer = Buffer.from('fake image content')
        const fileName = `${user.user.id}/avatar.png`

        // We need to use a client with the user's token to test RLS
        const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
            email: user.user.email!,
            password: 'password123'
        })
        if (sessionError) throw sessionError

        const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
            global: { headers: { Authorization: `Bearer ${sessionData.session.access_token}` } }
        })

        const { data: uploadData, error: uploadError } = await userClient.storage
            .from('avatars')
            .upload(fileName, buffer, {
                contentType: 'image/png'
            })

        if (uploadError) throw uploadError
        console.log('✅ Uploaded Avatar:', uploadData.path)

        // 3. Get Public URL
        const { data: { publicUrl } } = userClient.storage
            .from('avatars')
            .getPublicUrl(fileName)

        console.log('✅ Generated Public URL:', publicUrl)

        // 4. Update User Profile with Avatar URL
        const { error: updateError } = await userClient
            .from('users')
            .update({ avatar_url: publicUrl })
            .eq('id', user.user.id)

        if (updateError) throw updateError
        console.log('✅ Updated User Profile with Avatar URL')

        // 5. Verify Profile Update
        const { data: profile, error: profileError } = await userClient
            .from('users')
            .select('avatar_url')
            .eq('id', user.user.id)
            .single()

        if (profileError) throw profileError
        if (profile.avatar_url !== publicUrl) throw new Error('Avatar URL mismatch')
        console.log('✅ Verified Profile Update')

        // 6. Cleanup
        await supabase.storage.from('avatars').remove([fileName])
        await supabase.auth.admin.deleteUser(user.user.id)
        console.log('✅ Cleanup Complete')

    } catch (error) {
        console.error('❌ Verification Failed:', error)
        process.exit(1)
    }
}

testStorage()
