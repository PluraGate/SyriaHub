import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSearch() {
    console.log('--- Testing Search & Discovery ---')

    // 1. Setup Data
    console.log('Setting up test data...')
    const email = `search_test_${Date.now()}@test.com`
    const password = 'password123'

    const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: 'Search Test User' }
    })

    if (userError || !user) {
        console.error('Failed to create user', userError)
        return
    }

    // Create a Post
    const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
            title: 'Unique Searchable Post Title',
            content: 'This contains a specific keyword: xylophone',
            author_id: user.id,
            status: 'published',
            content_type: 'article'
        })
        .select()
        .single()

    if (postError) {
        console.error('Failed to create post', postError)
        return
    }

    // Create a Group
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
            name: 'Unique Searchable Group',
            slug: `search-group-${Date.now()}`,
            description: 'This group is about xylophones',
            created_by: user.id,
            visibility: 'public'
        })
        .select()
        .single()

    if (groupError) {
        console.error('Failed to create group', groupError)
        return
    }

    // 2. Test Search Query
    console.log('\n--- Running Search Query: "xylophone" ---')
    const { data: results, error: searchError } = await supabase.rpc('search_content', {
        query: 'xylophone',
        filter_type: null,
        filter_tag: null,
        filter_date: null
    })

    if (searchError) {
        console.error('Search failed', searchError)
    } else {
        console.log(`Found ${results.length} results`)
        results.forEach((r: any) => {
            console.log(`- [${r.type}] ${r.title}`)
        })

        const foundPost = results.find((r: any) => r.type === 'post' && r.id === post.id)
        const foundGroup = results.find((r: any) => r.type === 'group' && r.id === group.id)

        if (foundPost) console.log('SUCCESS: Found Post')
        else console.error('FAILURE: Post not found')

        if (foundGroup) console.log('SUCCESS: Found Group')
        else console.error('FAILURE: Group not found')
    }

    // 3. Test User Search
    console.log('\n--- Running Search Query: "Search Test User" ---')
    const { data: userResults, error: userSearchError } = await supabase.rpc('search_content', {
        query: 'Search Test User',
        filter_type: null,
        filter_tag: null,
        filter_date: null
    })

    if (userSearchError) {
        console.error('User search failed', userSearchError)
    } else {
        const foundUser = userResults.find((r: any) => r.type === 'user' && r.id === user.id)
        if (foundUser) console.log('SUCCESS: Found User')
        else console.error('FAILURE: User not found')
    }

    // Cleanup
    console.log('\nCleaning up...')
    await supabase.auth.admin.deleteUser(user.id)
    await supabase.from('groups').delete().eq('id', group.id)
    await supabase.from('posts').delete().eq('id', post.id)

    console.log('Done.')
}

testSearch()
