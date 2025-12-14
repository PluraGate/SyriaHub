
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRecentPosts() {
    console.log('Fetching most recent post...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    if (!posts || posts.length === 0) {
        console.log('No posts found.');
        return;
    }

    const post = posts[0];
    console.log('Recent Post:', JSON.stringify(post, null, 2));

    // Check if it's an event
    if (post.content_type === 'event') {
        console.log('This is an event.');
    } else {
        console.log(`Content type is: ${post.content_type}`);
    }
}

checkRecentPosts();
