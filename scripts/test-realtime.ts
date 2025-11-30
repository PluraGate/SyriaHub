import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testRealtime() {
    console.log('--- Testing Real-time Features ---')

    // 1. Setup Users
    console.log('Setting up users...')
    const emailA = `userA_${Date.now()}@test.com`
    const emailB = `userB_${Date.now()}@test.com`
    const password = 'password123'

    const { data: { user: userA }, error: errA } = await supabase.auth.admin.createUser({ email: emailA, password, email_confirm: true, user_metadata: { name: 'User A' } })
    const { data: { user: userB }, error: errB } = await supabase.auth.admin.createUser({ email: emailB, password, email_confirm: true, user_metadata: { name: 'User B' } })

    if (errA || errB || !userA || !userB) {
        console.error('Failed to create users', errA, errB)
        return
    }
    console.log('Users created:', userA.id, userB.id)

    // 2. Test Notifications (Comment)
    console.log('\n--- Testing Notifications ---')

    // User A creates a post
    const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
            title: 'Test Post for Notifications',
            content: 'Content',
            author_id: userA.id,
            status: 'published',
            content_type: 'article'
        })
        .select()
        .single()

    if (postError) {
        console.error('Failed to create post', postError)
        return
    }
    console.log('Post created by User A:', post.id)

    // User B comments on User A's post
    const { error: commentError } = await supabase
        .from('comments')
        .insert({
            post_id: post.id,
            user_id: userB.id,
            content: 'Nice post, User A!'
        })

    if (commentError) {
        console.error('Failed to create comment', commentError)
        return
    }
    console.log('User B commented on post')

    // Wait for trigger
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Check if User A has a notification
    const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userA.id)

    if (notifError) {
        console.error('Failed to fetch notifications', notifError)
    } else {
        console.log('User A Notifications:', notifications.length)
        if (notifications.length > 0) {
            console.log('Notification Content:', notifications[0].content)
            console.log('SUCCESS: Notification created!')
        } else {
            console.error('FAILURE: No notification found for User A')
        }
    }

    // 3. Test Group Chat
    console.log('\n--- Testing Group Chat ---')

    // Create a group
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
            name: 'Chat Test Group',
            slug: `chat-test-group-${Date.now()}`,
            description: 'Testing chat',
            created_by: userA.id,
            visibility: 'public'
        })
        .select()
        .single()

    if (groupError) {
        console.error('Failed to create group', groupError)
        return
    }
    console.log('Group created:', group.id)

    // Add User A and User B to group
    await supabase.from('group_members').insert([
        { group_id: group.id, user_id: userA.id, role: 'owner' },
        { group_id: group.id, user_id: userB.id, role: 'member' }
    ])
    console.log('Users added to group')

    // User A sends a message
    const { error: msgError } = await supabase
        .from('group_messages')
        .insert({
            group_id: group.id,
            user_id: userA.id,
            content: 'Hello User B!'
        })

    if (msgError) {
        console.error('Failed to send message', msgError)
    } else {
        console.log('User A sent a message')
    }

    // Verify message exists
    const { data: messages, error: fetchMsgError } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', group.id)

    if (fetchMsgError) {
        console.error('Failed to fetch messages', fetchMsgError)
    } else {
        console.log('Group Messages:', messages.length)
        if (messages.length > 0) {
            console.log('Message Content:', messages[0].content)
            console.log('SUCCESS: Message stored!')
        } else {
            console.error('FAILURE: No message found')
        }
    }

    // Cleanup
    console.log('\nCleaning up...')
    await supabase.auth.admin.deleteUser(userA.id)
    await supabase.auth.admin.deleteUser(userB.id)
    // Group and Post will be deleted via cascade (if configured) or manually
    // Since we don't have cascade on user delete for groups creator, we might leave artifacts.
    // But for test environment it's okay. Ideally we delete group and post explicitly.
    await supabase.from('groups').delete().eq('id', group.id)
    await supabase.from('posts').delete().eq('id', post.id)

    console.log('Done.')
}

testRealtime()
