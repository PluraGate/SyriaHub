import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const migrationsDir = path.join(process.cwd(), 'supabase/migrations')
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

console.log(`Found ${files.length} migrations.`)

for (const file of files) {
    console.log(`Applying ${file}...`)
    try {
        // Copy file to container
        execSync(`docker cp "${path.join(migrationsDir, file)}" supabase_db_SyriaHub:/tmp/${file}`)
        // Execute
        execSync(`docker exec supabase_db_SyriaHub psql -U postgres -f /tmp/${file}`)
        console.log(`✅ ${file} applied.`)
    } catch (e: any) {
        console.error(`❌ Failed to apply ${file}:`, e.message)
    }
}

console.log('Reloading schema cache...')
try {
    execSync(`docker exec supabase_db_SyriaHub psql -U postgres -c "NOTIFY pgrst, 'reload schema';"`)
    console.log('✅ Schema cache reloaded.')
} catch (e: any) {
    console.error('❌ Failed to reload schema cache:', e.message)
}

console.log('Done.')
