import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifySchema() {
    console.log('🔍 Verifying posts table schema...')

    // Try to select group_id from posts
    const { data, error } = await supabase
        .from('posts')
        .select('group_id')
        .limit(1)

    if (error) {
        console.error('❌ Error selecting group_id:', error.message)
        // If error is about column not existing, then migration didn't apply
        if (error.message.includes('does not exist')) {
            console.error('❌ group_id column does not exist in posts table.')
        }
    } else {
        console.log('✅ group_id column exists in posts table.')
    }
}

verifySchema()
