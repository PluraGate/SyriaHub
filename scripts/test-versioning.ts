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

async function testVersioning() {
    console.log('🔍 Testing Content Versioning...')

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

    // 2. Create a post
    const { data: post, error: createError } = await supabase
        .from('posts')
        .insert({
            title: 'Version Test Post',
            content: 'Original content',
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

    // 3. Update the post (should trigger version creation)
    const { error: updateError } = await supabase
        .from('posts')
        .update({
            content: 'Updated content v2',
            title: 'Version Test Post v2'
        })
        .eq('id', post.id)

    if (updateError) {
        console.error('❌ Post update failed:', updateError)
        return
    }
    console.log('✅ Post updated')

    // 4. Check versions
    const { data: versions, error: versionError } = await supabase
        .from('post_versions')
        .select('*')
        .eq('post_id', post.id)
        .order('version_number', { ascending: true })

    if (versionError) {
        console.error('❌ Fetching versions failed:', versionError)
        return
    }

    if (versions.length === 1) {
        console.log(`✅ Found ${versions.length} version! (Expected 1)`)
        versions.forEach(v => {
            console.log(`   - v${v.version_number}: ${v.title} (Content: ${v.content})`)
        })

        // Verify content matches what we expect
        // The trigger saves the OLD content as a version.
        // So v1 should be "Original content"

        const v1 = versions[0]
        if (v1.content === 'Original content') {
            console.log('✅ Version 1 content matches original content')
        } else {
            console.log('❌ Version 1 content mismatch:', v1.content)
        }

    } else {
        console.log(`❌ Unexpected number of versions: ${versions.length} (Expected 1)`)
    }

    // Cleanup
    await supabase.from('posts').delete().eq('id', post.id)
    console.log('🧹 Cleanup done')
}

testVersioning()
