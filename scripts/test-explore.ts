import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testExplore() {
    console.log('--- Testing Explore Recommendations ---')

    // 1. Test Trending Posts RPC
    console.log('\nFetching Trending Posts...')
    const { data: trending, error: trendingError } = await supabase
        .rpc('get_trending_posts')
        .limit(5)

    if (trendingError) {
        console.error('Failed to fetch trending posts', trendingError)
    } else {
        console.log(`Found ${trending.length} trending posts`)
        if (trending.length > 0) {
            console.log('Top Trending:', trending[0].title)
            console.log('SUCCESS: Trending posts RPC works')
        } else {
            console.log('WARNING: No trending posts found (might be empty DB)')
        }
    }

    // 2. Test Recommended Groups RPC
    console.log('\nFetching Recommended Groups...')
    const { data: groups, error: groupsError } = await supabase
        .rpc('get_recommended_groups')
        .limit(5)

    if (groupsError) {
        console.error('Failed to fetch recommended groups', groupsError)
    } else {
        console.log(`Found ${groups.length} recommended groups`)
        if (groups.length > 0) {
            console.log('Top Recommended:', groups[0].name)
            console.log('SUCCESS: Recommended groups RPC works')
        } else {
            console.log('WARNING: No recommended groups found')
        }
    }

    console.log('\nDone.')
}

testExplore()
