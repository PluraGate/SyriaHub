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

async function verifyGroup() {
    console.log(`🔍 Listing all groups...`)

    const { data: groups, error } = await supabase
        .from('groups')
        .select('id, name, visibility, created_by')

    if (error) {
        console.error('❌ Error fetching groups:', error)
        return
    }

    console.log(`✅ Found ${groups.length} groups:`)
    groups.forEach(g => {
        console.log(`   - ${g.id}: ${g.name} (${g.visibility})`)
    })
}

verifyGroup().catch(console.error)
