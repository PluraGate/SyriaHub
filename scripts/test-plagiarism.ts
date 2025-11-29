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

// Ensure we use the API port
const apiUrl = supabaseUrl.includes('54323') ? supabaseUrl.replace('54323', '54321') : supabaseUrl
console.log('🌍 Connecting to Supabase at:', apiUrl)

const supabase = createClient(apiUrl, supabaseServiceKey)

async function testPlagiarism() {
    console.log('🔍 Testing Plagiarism Detection...')

    // 1. Sign in
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'forum_tester@syrealize.org',
        password: 'password123'
    })

    if (authError || !user) {
        console.error('❌ Auth failed:', authError)
        return
    }
    console.log('✅ Signed in as:', user.email)

    // 1.5 Promote to moderator (to bypass RLS for plagiarism checks)
    const { error: roleError } = await supabase
        .from('users')
        .update({ role: 'moderator' })
        .eq('id', user.id)

    if (roleError) {
        console.error('❌ Failed to promote user:', roleError)
        return
    }
    console.log('✅ User promoted to moderator')

    // 2. Create a post
    const { data: post, error: createError } = await supabase
        .from('posts')
        .insert({
            title: 'Plagiarism Test Post',
            content: 'This is some content to check.',
            content_type: 'article',
            author_id: user.id
        })
        .select()
        .single()

    if (createError) {
        console.error('❌ Post creation failed:', createError)
        return
    }
    console.log('✅ Post created:', post.id)

    // 3. Update to create a version
    const { error: updateError } = await supabase
        .from('posts')
        .update({
            content: 'Updated content for plagiarism check',
            title: 'Plagiarism Test Post v2'
        })
        .eq('id', post.id)

    if (updateError) {
        console.error('❌ Post update failed:', updateError)
        return
    }
    console.log('✅ Post updated (version created)')

    // 4. Get the version ID
    const { data: versions } = await supabase
        .from('post_versions')
        .select('*')
        .eq('post_id', post.id)
        .order('version_number', { ascending: false })
        .limit(1)

    if (!versions || versions.length === 0) {
        console.error('❌ No versions found')
        return
    }
    const versionId = versions[0].id
    console.log('✅ Found version:', versionId)

    // 5. Call the API (Mocking the fetch call since we are in node)
    // We can't easily call the Next.js API route from here without the server running.
    // So we will simulate what the API does: insert into plagiarism_checks

    console.log('🔄 Simulating API call...')

    const { data: check, error: checkError } = await supabase
        .from('plagiarism_checks')
        .insert({
            post_version_id: versionId,
            provider: 'test-script',
            status: 'completed',
            score: 15.5,
            flagged: false,
            summary: 'Test summary',
            raw_response: { test: true }
        })
        .select()
        .single()

    if (checkError) {
        console.error('❌ Plagiarism check insertion failed:', checkError)
    } else {
        console.log('✅ Plagiarism check record created:', check.id)
        console.log(`   - Score: ${check.score}`)
        console.log(`   - Status: ${check.status}`)
    }

    // Cleanup
    await supabase.from('posts').delete().eq('id', post.id)
    console.log('🧹 Cleanup done')
}

testPlagiarism()
