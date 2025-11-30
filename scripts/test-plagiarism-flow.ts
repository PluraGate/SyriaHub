
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testPlagiarismFlow() {
    console.log('🔍 Testing Plagiarism Detection Flow (DB Schema & RLS)...')

    try {
        // 1. Create a Moderator User (RLS requires moderator/admin to insert checks)
        const { data: modUser, error: modError } = await supabase.auth.admin.createUser({
            email: `mod_${Date.now()}@test.com`,
            password: 'password123',
            email_confirm: true,
            user_metadata: { role: 'moderator' }
        })
        if (modError) throw modError
        console.log('✅ Created Moderator User:', modUser.user.id)

        await supabase.from('users').update({ role: 'moderator' }).eq('id', modUser.user.id)
        console.log('✅ Assigned Moderator Role')

        // 2. Create a Post
        const { data: post, error: postError } = await supabase
            .from('posts')
            .insert({
                title: 'Plagiarism Test Post',
                content: 'Original content for checking',
                author_id: modUser.user.id
            })
            .select()
            .single()

        if (postError) throw postError
        console.log('✅ Created Post:', post.id)

        // 2.5 Update the post to trigger a version snapshot
        const { error: updateError } = await supabase
            .from('posts')
            .update({ title: 'Plagiarism Test Post (Updated)' })
            .eq('id', post.id)

        if (updateError) throw updateError
        console.log('✅ Updated Post to trigger version')

        // 3. Get the Version ID
        const { data: versions, error: versionError } = await supabase
            .from('post_versions')
            .select('id')
            .eq('post_id', post.id)
            .order('version_number', { ascending: false })
            .limit(1)

        if (versionError || !versions || versions.length === 0) {
            throw new Error('No version created for post')
        }
        const versionId = versions[0].id
        console.log('✅ Found Version:', versionId)

        // 4. Insert Plagiarism Check (Simulate API logic)
        const modClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
            global: { headers: { Authorization: `Bearer ${(await supabase.auth.signInWithPassword({ email: modUser.user.email!, password: 'password123' })).data.session?.access_token}` } }
        })

        const { data: check, error: checkError } = await modClient
            .from('plagiarism_checks')
            .insert({
                post_version_id: versionId,
                provider: 'test-provider',
                status: 'completed',
                score: 15.5,
                flagged: false,
                summary: 'Test summary'
            })
            .select()
            .single()

        if (checkError) throw checkError
        console.log('✅ Created Plagiarism Check:', check.id)

        // 5. Verify we can read it back
        const { data: readCheck, error: readError } = await modClient
            .from('plagiarism_checks')
            .select('*')
            .eq('id', check.id)
            .single()

        if (readError) throw readError
        if (readCheck.score !== 15.5) throw new Error('Data mismatch')
        console.log('✅ Verified Check Data')

        // 6. Cleanup
        await supabase.from('posts').delete().eq('id', post.id)
        await supabase.auth.admin.deleteUser(modUser.user.id)
        console.log('✅ Cleanup Complete')

    } catch (error) {
        console.error('❌ Verification Failed:', error)
        process.exit(1)
    }
}

testPlagiarismFlow()
