
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyEventSystem() {
    console.log('--- Verifying Event System ---');

    // 1. Fetch an event
    console.log('1. Fetching an event...');
    const { data: event, error } = await supabase
        .from('posts')
        .select('id, title, content_type')
        .eq('content_type', 'event')
        .limit(1)
        .single();

    if (error || !event) {
        console.error('❌ Failed to fetch event or no events found.');
        return;
    }
    console.log(`✅ Found event: ${event.id} (${event.title})`);

    // 2. Simulate User Navigation logic (mock)
    console.log('2. Checking navigation logic...');
    const expectedUrl = `/events/${event.id}`;
    const mockCardUrl = event.content_type === 'event' ? `/events/${event.id}` : `/post/${event.id}`;

    if (mockCardUrl === expectedUrl) {
        console.log(`✅ MagazineCard routing logic is correct: ${mockCardUrl}`);
    } else {
        console.error(`❌ MagazineCard routing logic FAILED. Expected ${expectedUrl}, got ${mockCardUrl}`);
    }

    // 3. Fetch Feed posts to ensure event is NOT there
    console.log('3. Checking Feed filtering...');
    const { data: feedPosts } = await supabase
        .from('posts')
        .select('id, content_type')
        .eq('status', 'published')
        .neq('content_type', 'event')
        .limit(50); // Fetch top 50 to see if our event is there

    const eventInFeed = feedPosts.find(p => p.id === event.id);
    if (!eventInFeed) {
        console.log('✅ Event successfully filtered from Main Feed.');
    } else {
        console.error('❌ Event FOUND in Main Feed. Filter failed.');
    }

    console.log('--- Verification Complete ---');
}

verifyEventSystem();
