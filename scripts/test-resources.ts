import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testResources() {
    console.log('--- Testing Resource Library ---')

    // 1. Setup User
    console.log('Setting up user...')
    const email = `resource_test_${Date.now()}@test.com`
    const password = 'password123'

    const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true
    })

    if (userError || !user) {
        console.error('Failed to create user', userError)
        return
    }

    // 2. Upload File (Mock)
    console.log('\nCreating resource post...')

    const mockUrl = 'https://example.com/test.pdf'

    const { data: resource, error: postError } = await supabase
        .from('posts')
        .insert({
            title: 'Test Resource',
            content: 'This is a test resource.',
            content_type: 'resource',
            author_id: user.id,
            status: 'published',
            metadata: {
                url: mockUrl,
                size: 1024 * 1024, // 1MB
                mime_type: 'application/pdf',
                original_name: 'test.pdf',
                downloads: 0,
                license: 'CC-BY-4.0'
            }
        })
        .select()
        .single()

    if (postError || !resource) {
        console.error('Failed to create resource', postError)
        return
    }
    console.log('SUCCESS: Resource created', resource.id)

    // 3. Fetch Resource List
    console.log('\nFetching resources...')
    const { data: list, error: listError } = await supabase
        .from('posts')
        .select('*')
        .eq('content_type', 'resource')

    if (listError) {
        console.error('Failed to list resources', listError)
    } else {
        console.log(`Found ${list.length} resources`)
        if (list.some(r => r.id === resource.id)) {
            console.log('SUCCESS: Created resource found in list')
        } else {
            console.error('FAILURE: Created resource not found')
        }
    }

    // 4. Verify Metadata
    console.log('\nVerifying metadata...')
    if (resource.metadata && resource.metadata.license === 'CC-BY-4.0') {
        console.log('SUCCESS: Metadata stored correctly (License: CC-BY-4.0)')
    } else {
        console.error('FAILURE: Metadata mismatch', resource.metadata)
    }

    // Cleanup
    console.log('\nCleaning up...')
    await supabase.from('posts').delete().eq('id', resource.id)
    await supabase.auth.admin.deleteUser(user.id)

    console.log('Done.')
}

testResources()
