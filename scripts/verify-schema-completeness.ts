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

console.log('🌍 Connecting to Supabase at:', supabaseUrl)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifySchema() {
    console.log('🔍 Verifying Schema Completeness...')

    // We can't query information_schema directly easily with supabase-js without permissions or rpc.
    // But we can try to inspect the tables by selecting 1 row from each expected table.

    const expectedTables = [
        'plagiarism_checks'
    ]

    const results: Record<string, string[]> = {}

    for (const table of expectedTables) {
        const { data, error } = await supabase.from(table).select('*').limit(1)
        if (error) {
            console.error(`❌ Table '${table}' check failed:`, error.message)
            results[table] = ['ERROR: ' + error.message]
        } else {
            if (data.length > 0) {
                results[table] = Object.keys(data[0])
                console.log(`✅ Table '${table}' exists. Found columns:`, results[table].join(', '))
            } else {
                // Table exists but is empty. We can't see columns easily without data or introspection.
                // We'll try to insert a dummy row and rollback/delete if possible, or just report it exists.
                // Actually, if data is empty array [], the table exists but has no rows.
                // We can't get keys from empty array.
                console.log(`✅ Table '${table}' exists (but is empty).`)
                results[table] = ['(Empty table)']
            }
        }
    }

    console.log('\n--- Schema Summary ---')
    console.table(results)
}

verifySchema()
