import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testModeration() {
    console.log('--- Testing Moderation Tools ---')

    // 1. Setup Data (User & Post)
    console.log('Setting up test data...')
    const email = `mod_test_${Date.now()}@test.com`
    const password = 'password123'

    const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: 'Mod Test User' }
    })

    if (userError || !user) {
        console.error('Failed to create user', userError)
        return
    }

    const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
            title: 'Reportable Post',
            content: 'This post will be reported.',
            author_id: user.id,
            status: 'published'
        })
        .select()
        .single()

    if (postError || !post) {
        console.error('Failed to create post', postError)
        return
    }

    // 2. Create Post Report
    console.log('\nCreating post report...')
    const { data: report, error: reportError } = await supabase
        .from('reports')
        .insert({
            post_id: post.id,
            reporter_id: user.id,
            reason: 'spam: Automated test report',
            status: 'pending'
        })
        .select()
        .single()

    if (reportError) {
        console.error('Failed to create report', reportError)
    } else {
        console.log('SUCCESS: Post Report created', report.id)
    }

    // 2.1 Create Comment and Report
    console.log('\nCreating comment and report...')
    const { data: comment, error: commentError } = await supabase
        .from('comments')
        .insert({
            content: 'Reportable comment',
            post_id: post.id,
            user_id: user.id
        })
        .select()
        .single()

    if (commentError || !comment) {
        console.error('Failed to create comment', commentError)
    } else {
        const { data: commentReport, error: commentReportError } = await supabase
            .from('reports')
            .insert({
                comment_id: comment.id,
                reporter_id: user.id,
                reason: 'harassment: Test comment report',
                status: 'pending'
            })
            .select()
            .single()

        if (commentReportError) {
            console.error('Failed to create comment report', commentReportError)
        } else {
            console.log('SUCCESS: Comment Report created', commentReport.id)
        }
    }

    // 3. Verify Admin Access (Simulated by Service Role)
    console.log('\nFetching reports as admin...')
    const { data: reports, error: fetchError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', report?.id)

    if (fetchError) {
        console.error('Failed to fetch reports', fetchError)
    } else {
        console.log(`Found ${reports.length} reports`)
        if (reports.length > 0) {
            console.log('SUCCESS: Admin can view reports')
        }
    }

    // 4. Resolve Report
    console.log('\nResolving report...')
    const { error: resolveError } = await supabase
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', report?.id)

    if (resolveError) {
        console.error('Failed to resolve report', resolveError)
    } else {
        console.log('SUCCESS: Report resolved')
    }

    // Cleanup
    console.log('\nCleaning up...')
    await supabase.from('posts').delete().eq('id', post.id)
    await supabase.auth.admin.deleteUser(user.id)

    console.log('Done.')
}

testModeration()
