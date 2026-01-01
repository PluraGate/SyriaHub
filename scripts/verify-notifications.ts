import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyNotifications() {
    console.log('--- Verifying Notification System ---')

    // 1. Setup Users
    console.log('Creating test users...')
    const user1Email = `notif_user1_${Date.now()}@test.com`
    const user2Email = `notif_user2_${Date.now()}@test.com`
    const password = 'password123'

    const { data: { user: user1 } } = await supabase.auth.admin.createUser({
        email: user1Email, password, email_confirm: true, user_metadata: { name: 'User One' }
    })
    const { data: { user: user2 } } = await supabase.auth.admin.createUser({
        email: user2Email, password, email_confirm: true, user_metadata: { name: 'User Two' }
    })

    if (!user1 || !user2) {
        console.error('Failed to create users')
        return
    }
    console.log('Users created:', user1.id, user2.id)

    try {
        // 2. Test Badge Notification (User 1 creates a post -> First Step Badge)
        console.log('\nTesting Badge Notification...')
        const { error: pError } = await supabase.from('posts').insert({
            title: 'Post for Badge',
            content: 'Content',
            content_type: 'article',
            author_id: user1.id,
            status: 'published'
        })
        if (pError) console.error('First post insert error:', pError)

        // Check for badge
        const { data: badges } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', user1.id)

        console.log('Badges found:', badges?.length)

        // Check notification
        const { data: notifs1 } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user1.id)
            .eq('type', 'badge')

        if (notifs1 && notifs1.length > 0) {
            console.log('SUCCESS: Badge notification created')
        } else {
            console.error('FAILURE: Badge notification NOT found')
        }

        // 3. Test Reply Notification (User 2 replies to User 1)
        console.log('\nTesting Reply Notification...')
        // User 1 creates a post
        const { data: post } = await supabase.from('posts').insert({
            title: 'Post for Reply',
            content: 'Content',
            content_type: 'article',
            author_id: user1.id,
            status: 'published'
        }).select().single()

        if (post) {
            // User 2 comments
            await supabase.from('comments').insert({
                content: 'Nice post!',
                post_id: post.id,
                user_id: user2.id
            })

            // Check notification for User 1
            const { data: notifs2 } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user1.id)
                .eq('type', 'reply')

            if (notifs2 && notifs2.length > 0) {
                console.log('SUCCESS: Reply notification created')
            } else {
                console.error('FAILURE: Reply notification NOT found')
            }
        }

        // 4. Test Solution Notification
        console.log('\nTesting Solution Notification...')
        // User 1 asks question
        const { data: question, error: qError } = await supabase.from('posts').insert({
            title: 'Question',
            content: 'Help?',
            content_type: 'question',
            author_id: user1.id,
            status: 'published'
        }).select().single()

        if (qError) console.error('Question insert error:', qError)

        // User 2 answers
        const { data: answer } = await supabase.from('posts').insert({
            title: 'Answer',
            content: 'Here is help',
            content_type: 'answer',
            parent_id: question!.id,
            author_id: user2.id,
            status: 'published'
        }).select().single()

        // User 1 accepts answer (using RPC or direct update if allowed, but RPC is safer)
        // We'll simulate RPC logic by updating directly as admin
        await supabase.from('posts').update({ is_accepted: true }).eq('id', answer!.id)

        // Check notification for User 2
        const { data: notifs3 } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user2.id)
            .eq('type', 'solution')

        if (notifs3 && notifs3.length > 0) {
            console.log('SUCCESS: Solution notification created')
        } else {
            console.error('FAILURE: Solution notification NOT found')
        }

    } catch (err) {
        console.error('Unexpected error:', err)
    } finally {
        // Cleanup
        // Check all notifications
        const { data: allNotifs } = await supabase.from('notifications').select('*')
        console.log('Total notifications found:', allNotifs?.length)
        if (allNotifs?.length > 0) {
            console.log('First notification:', JSON.stringify(allNotifs[0], null, 2))
        }

        console.log('\nCleaning up...')
        await supabase.from('posts').delete().eq('author_id', user1.id)
        await supabase.from('posts').delete().eq('author_id', user2.id)
        await supabase.auth.admin.deleteUser(user1.id)
        await supabase.auth.admin.deleteUser(user2.id)
        console.log('Done.')
    }
}

verifyNotifications()
