import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function testStats() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const userId = '0b6a2888-6ea1-485c-9ade-66fc3b4d46d1';

    console.log('Testing get_user_stats for user:', userId);

    // Test 1: RPC call
    const { data: stats, error: statsError } = await supabase
        .rpc('get_user_stats', { user_uuid: userId })
        .single();

    console.log('\n=== RPC Result ===');
    console.log('Stats:', stats);
    console.log('Error:', statsError);

    // Test 2: Direct query to posts table
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, title, status, author_id')
        .eq('author_id', userId)
        .eq('status', 'published');

    console.log('\n=== Posts Query ===');
    console.log('Posts count:', posts?.length);
    console.log('Posts:', posts);
    console.log('Error:', postsError);

    // Test 3: Count directly  
    const { count, error: countError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId)
        .eq('status', 'published');

    console.log('\n=== Direct Count ===');
    console.log('Count:', count);
    console.log('Error:', countError);
}

testStats().catch(console.error);
