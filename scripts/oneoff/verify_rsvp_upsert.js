
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyRsvpFlow() {
    console.log('--- Verifying RSVP Flow (Client-Side Simulation) ---');

    // 1. Sign up/Sign in a temporary test user
    const email = `test_entry_${Date.now()}@example.com`;
    const password = 'testpassword123';

    console.log(`1. Creating temp user: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error('❌ Auth failed:', authError.message);
        return;
    }

    const user = authData.user;
    if (!user) {
        console.error('❌ No user created (maybe email confirmation needed?).');
        // If email confirmation is enabled, we might be stuck. 
        // But let's assume we can at least get a user object or we'll fail here.
        return;
    }
    console.log('✅ User created/identified:', user.id);

    // 2. Find an event to RSVP to
    console.log('2. Finding an event...');
    const { data: event, error: eventError } = await supabase
        .from('posts')
        .select('id')
        .eq('content_type', 'event')
        .limit(1)
        .single();

    if (eventError || !event) {
        console.error('❌ No event found:', eventError);
        return;
    }
    console.log('✅ Event found:', event.id);

    // 3. Try to UPSERT RSVP
    console.log('3. Attempting UPSERT RSVP...');
    const { data, error } = await supabase
        .from('event_rsvps')
        .upsert({
            event_id: event.id,
            user_id: user.id,
            status: 'going'
        }, {
            onConflict: 'event_id, user_id'
        });

    if (error) {
        console.error('❌ UPSERT FAILED:', error.message);
        console.error('Full Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('✅ UPSERT SUCCESS! The backend is working correctly.');
    }
}

verifyRsvpFlow();
