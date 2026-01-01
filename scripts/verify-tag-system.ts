
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyTagSystem() {
    console.log('Starting Tag System Verification...')

    // 1. Get Admin User ID
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()
    if (userError || !users || users.length === 0) {
        console.error('No users found. Run create-admin-user.ts first.')
        return
    }
    const userId = users[0].id
    console.log('Using User ID:', userId)

    // 2. Create Post with New Tag
    const newTag = `TestTag_${Date.now()}`
    console.log(`Creating post with tag: ${newTag}`)

    const { error: postError } = await supabase.from('posts').insert({
        title: 'Tag Test Post',
        content: 'Testing tag verification',
        tags: [newTag],
        author_id: userId,
        content_type: 'article',
        status: 'published'
    })

    if (postError) {
        console.error('Error creating post:', postError)
        return
    }

    // 3. Verify it appears in get_unverified_tags
    console.log('Checking unverified tags...')
    const { data: unverified, error: rpcError } = await supabase.rpc('get_unverified_tags')

    if (rpcError) {
        console.error('Error calling RPC:', rpcError)
        return
    }

    const found = unverified.find((t: any) => t.tag === newTag)
    if (found) {
        console.log('SUCCESS: Tag found in unverified list:', found)
    } else {
        console.error('FAILURE: Tag NOT found in unverified list')
        console.log('Unverified list:', unverified)
        return
    }

    // 4. Approve Tag
    console.log('Approving tag...')
    const { error: approveError } = await supabase.from('tags').insert({
        label: newTag,
        color: '#10B981'
    })

    if (approveError) {
        console.error('Error approving tag:', approveError)
        return
    }

    // 5. Verify it's now official and NOT in unverified
    const { data: official } = await supabase.from('tags').select('*').eq('label', newTag).single()
    const { data: unverifiedAfter } = await supabase.rpc('get_unverified_tags')
    const foundAfter = unverifiedAfter.find((t: any) => t.tag === newTag)

    if (official && !foundAfter) {
        console.log('SUCCESS: Tag is now official and removed from unverified list.')
    } else {
        console.error('FAILURE: Tag state incorrect after approval.')
        console.log('Official:', official)
        console.log('In Unverified:', foundAfter)
    }
}

verifyTagSystem()
