/**
 * Database Reset CLI Script
 * 
 * Usage: npx tsx scripts/reset-database.ts [--force]
 * 
 * This script clears all user data from the database for a fresh start.
 * Requires confirmation unless --force flag is provided.
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

// Load environment variables
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
})

// Tables to clear in dependency order (most dependent first)
const tablesToClear = [
    // Notifications and sessions
    'notifications',
    'post_sessions',
    'read_positions',
    'suggestions',
    'feedback_tickets',

    // Moderation
    'moderation_appeals',
    'moderation_actions',

    // Knowledge gaps and precedents
    'knowledge_gaps',
    'precedent_links',
    'precedents',

    // Trust system
    'trust_appeals',
    'trust_decisions',
    'trust_scores',

    // Analytics
    'analytics_daily',
    'search_analytics',
    'page_views',

    // Content interactions
    'bookmarks',
    'votes',
    'answers',
    'comments',
    'reports',

    // Citations
    'citations',

    // Versioning
    'plagiarism_checks',
    'post_versions',

    // Groups
    'group_invitations',
    'group_members',

    // Resources and events
    'resources',
    'events',

    // Posts
    'posts',

    // Groups table
    'groups',

    // User badges
    'user_badges',

    // Users (last, as many tables reference it)
    'users',
]

async function confirmReset(): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve) => {
        console.log('\n⚠️  WARNING: This will DELETE ALL DATA from the database!')
        console.log('   This action cannot be undone.\n')

        rl.question('Type "RESET" to confirm: ', (answer) => {
            rl.close()
            resolve(answer === 'RESET')
        })
    })
}

async function clearTable(tableName: string): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
        // First get count
        const { count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })

        // Delete all rows
        const { error } = await supabase
            .from(tableName)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all (workaround for "delete all" restriction)

        if (error) {
            // Try alternative approach for tables that might have RLS issues
            const { error: error2 } = await supabase.rpc('truncate_table', { table_name: tableName })
            if (error2) {
                return { success: false, error: error.message }
            }
        }

        return { success: true, count: count || 0 }
    } catch (err) {
        return { success: false, error: String(err) }
    }
}

async function resetDatabase() {
    console.log('🗄️  SyriaHub Database Reset Tool\n')
    console.log('='.repeat(50))

    const forceMode = process.argv.includes('--force')

    if (!forceMode) {
        const confirmed = await confirmReset()
        if (!confirmed) {
            console.log('\n❌ Reset cancelled.')
            process.exit(0)
        }
    } else {
        console.log('⚡ Running in force mode (--force flag detected)\n')
    }

    console.log('\n🔄 Starting database reset...\n')

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const table of tablesToClear) {
        process.stdout.write(`   ${table.padEnd(25)}`)

        const result = await clearTable(table)

        if (result.success) {
            if (result.count && result.count > 0) {
                console.log(`✓ Cleared ${result.count} rows`)
                successCount++
            } else {
                console.log(`○ Empty`)
                skipCount++
            }
        } else {
            // Table might not exist or have restrictions - that's okay
            console.log(`⊘ Skipped (${result.error?.substring(0, 30) || 'not found'})`)
            skipCount++
        }
    }

    console.log('\n' + '='.repeat(50))
    console.log(`\n✅ Database reset complete!`)
    console.log(`   • ${successCount} tables cleared`)
    console.log(`   • ${skipCount} tables skipped`)
    if (errorCount > 0) {
        console.log(`   • ${errorCount} errors`)
    }
    console.log('\n💡 Users will be recreated when they log in again.')
}

resetDatabase().catch(console.error)
