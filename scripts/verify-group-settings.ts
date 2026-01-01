
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyGroupSettings() {
    console.log('🔍 Verifying Group Settings Operations...')

    try {
        // 1. Create a test user (Owner)
        const { data: owner, error: ownerError } = await supabase.auth.admin.createUser({
            email: `owner_${Date.now()}@test.com`,
            password: 'password123',
            email_confirm: true
        })
        if (ownerError) throw ownerError
        console.log('✅ Created Owner:', owner.user.id)

        // 2. Create a test group
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .insert({
                name: 'Settings Test Group',
                slug: `settings-test-group-${Date.now()}`,
                description: 'Original Description',
                visibility: 'public',
                created_by: owner.user.id
            })
            .select()
            .single()

        if (groupError) throw groupError
        console.log('✅ Created Group:', group.id)

        // 3. Add owner as member with 'owner' role
        const { error: memberError } = await supabase
            .from('group_members')
            .insert({
                group_id: group.id,
                user_id: owner.user.id,
                role: 'owner'
            })

        if (memberError) throw memberError
        console.log('✅ Added Owner as Member')

        // 4. Update Group Details (Simulate Owner Action)
        const { data: updatedGroup, error: updateError } = await supabase
            .from('groups')
            .update({
                name: 'Updated Group Name',
                description: 'Updated Description',
                visibility: 'private'
            })
            .eq('id', group.id)
            .select()
            .single()

        if (updateError) throw updateError

        if (updatedGroup.name !== 'Updated Group Name' || updatedGroup.visibility !== 'private') {
            throw new Error('Group update failed verification')
        }
        console.log('✅ Verified Group Update')

        // 5. Add a second member
        const { data: member2, error: member2Error } = await supabase.auth.admin.createUser({
            email: `member_${Date.now()}@test.com`,
            password: 'password123',
            email_confirm: true
        })
        if (member2Error) throw member2Error

        await supabase.from('group_members').insert({
            group_id: group.id,
            user_id: member2.user.id,
            role: 'member'
        })
        console.log('✅ Added Second Member')

        // 6. Remove the second member
        const { error: removeError } = await supabase
            .from('group_members')
            .delete()
            .eq('group_id', group.id)
            .eq('user_id', member2.user.id)

        if (removeError) throw removeError
        console.log('✅ Verified Member Removal')

        // 7. Cleanup
        await supabase.from('groups').delete().eq('id', group.id)
        await supabase.auth.admin.deleteUser(owner.user.id)
        await supabase.auth.admin.deleteUser(member2.user.id)
        console.log('✅ Cleanup Complete')

    } catch (error) {
        console.error('❌ Verification Failed:', error)
        process.exit(1)
    }
}

verifyGroupSettings()
