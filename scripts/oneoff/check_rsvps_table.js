
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
    console.log('Checking event_rsvps table access...');

    // Try to select from the table
    const { data, error } = await supabase
        .from('event_rsvps')
        .select('count', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Error assessing table:', error.message);
        console.error('Full Error:', JSON.stringify(error, null, 2));

        if (error.message.includes('schema cache')) {
            console.log('\n💡 DIAGNOSIS: The PostgREST API explicitly claims the table is not in the schema cache.');
            console.log('This usually means the table exists in Postgres but PostgREST hasn\'t refreshed yet, OR permissions are missing.');
        } else if (error.message.includes('relation "public.event_rsvps" does not exist')) {
            console.log('\n💡 DIAGNOSIS: The table physically does not exist in the database.');
        }
    } else {
        console.log('✅ Success! The table exists and is accessible.');
        console.log('Row count:', data); // data is null for head request usually, count is in count
    }
}

checkTable();
