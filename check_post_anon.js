
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

// simulate anon client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRecentPostsAnon() {
    console.log('Fetching most recent post as ANON...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
        *,
        author:users!author_id(name, email)
    `)
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    if (!posts || posts.length === 0) {
        console.log('No posts found as ANON.');
        return;
    }

    console.log('Recent Post (Anon):', JSON.stringify(posts[0], null, 2));
}

checkRecentPostsAnon();
