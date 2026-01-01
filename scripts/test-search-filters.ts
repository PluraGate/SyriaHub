import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSearchFilters() {
    console.log('--- Testing Search Filters ---')

    // 1. Setup Data
    console.log('Setting up test data...')
    const email = `filter_test_${Date.now()}@test.com`
    const password = 'password123'

    const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: 'Filter Test User' }
    })

    if (userError || !user) {
        console.error('Failed to create user', userError)
        return
    }

    // Create Post (Article)
    const { data: article, error: articleError } = await supabase
        .from('posts')
        .insert({
            title: 'Filter Test Article',
            content: 'Content for article',
            author_id: user.id,
            status: 'published',
            content_type: 'article',
            created_at: new Date().toISOString() // Today
        })
        .select()
        .single()

    // Create Group
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
            name: 'Filter Test Group',
            slug: `filter-group-${Date.now()}`,
            description: 'Description for group',
            created_by: user.id,
            visibility: 'public',
            created_at: new Date(Date.now() - 86400000 * 10).toISOString() // 10 days ago (older than week)
        })
        .select()
        .single()

    if (articleError || groupError) {
        console.error('Failed to create data', articleError, groupError)
        return
    }

    // 2. Test Type Filter
    console.log('\n--- Testing Type Filter: "post" ---')
    const { data: postResults } = await supabase.rpc('search_content', {
        query: 'Filter Test',
        filter_type: 'post'
    })

    const foundArticle = postResults.find((r: any) => r.id === article.id)
    const foundGroupInPost = postResults.find((r: any) => r.id === group.id)

    if (foundArticle && !foundGroupInPost) {
        console.log('SUCCESS: Found post and excluded group')
    } else {
        console.error('FAILURE: Type filter failed', { foundArticle: !!foundArticle, foundGroupInPost: !!foundGroupInPost })
    }

    // 3. Test Date Filter
    console.log('\n--- Testing Date Filter: "week" ---')
    const { data: dateResults } = await supabase.rpc('search_content', {
        query: 'Filter Test',
        filter_date: 'week'
    })

    const foundArticleDate = dateResults.find((r: any) => r.id === article.id)
    const foundGroupDate = dateResults.find((r: any) => r.id === group.id)

    if (foundArticleDate && !foundGroupDate) {
        console.log('SUCCESS: Found recent article and excluded older group')
    } else {
        console.error('FAILURE: Date filter failed', { foundArticleDate: !!foundArticleDate, foundGroupDate: !!foundGroupDate })
    }

    // Cleanup
    console.log('\nCleaning up...')
    await supabase.auth.admin.deleteUser(user.id)
    await supabase.from('groups').delete().eq('id', group.id)
    await supabase.from('posts').delete().eq('id', article.id)

    console.log('Done.')
}

testSearchFilters()
