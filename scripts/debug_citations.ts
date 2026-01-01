
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    console.log('URL:', supabaseUrl)
    console.log('Key:', supabaseKey ? 'Present' : 'Missing')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ID of the post mentioned in the logs (from previous user turn)
const TEST_POST_ID = '5872bbc1-285a-4ff7-8c5b-aea789ba7f86'

async function runDebug() {
    console.log('Testing connection...')
    console.log('Querying for post_id:', TEST_POST_ID)

    try {
        const { data, error } = await supabase
            .from('citations')
            .select(`
          id,
          type,
          quote_content,
          external_url,
          external_doi,
          external_title,
          external_author,
          external_year,
          external_source,
          target_post:posts!citations_target_post_id_fkey (
              id,
              title,
              created_at,
              author:users (
                  name,
                  email
              )
          )
      `)
            .eq('source_post_id', TEST_POST_ID)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('SUPABASE ERROR:', error)
            console.log('JSON:', JSON.stringify(error, null, 2))
        } else {
            console.log('SUCCESS! Data:', JSON.stringify(data, null, 2))
        }
    } catch (e) {
        console.error('EXCEPTION:', e)
    }
}

runDebug()
