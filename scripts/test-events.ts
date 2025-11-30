import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testEvents() {
    console.log('--- Testing Events System ---')

    // 1. Setup User
    console.log('Setting up user...')
    const email = `event_test_${Date.now()}@test.com`
    const password = 'password123'

    const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true
    })

    if (userError || !user) {
        console.error('Failed to create user', userError)
        return
    }

    // 2. Create Event
    console.log('\nCreating event...')
    const startTime = new Date()
    startTime.setDate(startTime.getDate() + 7) // 1 week from now

    const { data: event, error: postError } = await supabase
        .from('posts')
        .insert({
            title: 'Test Event',
            content: 'This is a test event.',
            content_type: 'event',
            author_id: user.id,
            status: 'published',
            metadata: {
                start_time: startTime.toISOString(),
                location: 'Test Location',
                link: 'https://example.com'
            }
        })
        .select()
        .single()

    if (postError || !event) {
        console.error('Failed to create event', postError)
        return
    }
    console.log('SUCCESS: Event created', event.id)

    // 3. RSVP to Event
    console.log('\nRSVPing to event...')
    const { error: rsvpError } = await supabase
        .from('event_rsvps')
        .insert({
            event_id: event.id,
            user_id: user.id,
            status: 'going'
        })

    if (rsvpError) {
        console.error('Failed to RSVP', rsvpError)
    } else {
        console.log('SUCCESS: RSVP created')
    }

    // 4. Verify RSVP Count
    console.log('\nVerifying RSVP count...')
    const { count, error: countError } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('status', 'going')

    if (countError) {
        console.error('Failed to get RSVP count', countError)
    } else {
        if (count === 1) {
            console.log('SUCCESS: RSVP count correct')
        } else {
            console.error('FAILURE: RSVP count mismatch', count)
        }
    }

    // Cleanup
    console.log('\nCleaning up...')
    await supabase.from('posts').delete().eq('id', event.id)
    await supabase.auth.admin.deleteUser(user.id)

    console.log('Done.')
}

testEvents()
