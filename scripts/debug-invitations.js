const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

console.log('🚀 Starting debug script (JS)...');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugInvitations() {
    console.log('🔍 Debugging Group Invitations...');

    // 1. Sign in as researcher
    const { data: { user, session }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'researcher@syrealize.org',
        password: 'password123'
    });

    if (authError || !user || !session) {
        console.error('❌ Auth failed:', authError);
        return;
    }
    console.log('✅ Signed in as:', user.email);

    // Create client for user
    const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        global: {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        }
    });

    // 2. Create a test group
    const slug = `invite-debug-${Date.now()}`;
    const { data: group, error: groupError } = await userClient
        .from('groups')
        .insert({
            name: 'Invite Debug Group',
            description: 'Testing invitations',
            visibility: 'private',
            slug: slug,
            created_by: user.id
        })
        .select()
        .single();

    if (groupError) {
        console.error('❌ Group creation failed:', groupError);
        return;
    }
    console.log('✅ Group created:', group.id);

    // 3. Add owner (required for permission to invite)
    const { error: memberError } = await userClient
        .from('group_members')
        .insert({
            group_id: group.id,
            user_id: user.id,
            role: 'owner'
        });

    if (memberError) {
        console.error('❌ Failed to add owner:', memberError);
        return;
    }
    console.log('✅ Owner added');

    // 4. Attempt to invite
    console.log('💌 Attempting to send invitation...');
    const { data: invite, error: inviteError } = await userClient
        .from('group_invitations')
        .insert({
            group_id: group.id,
            inviter_id: user.id,
            invitee_email: 'invitee@example.com',
            token: crypto.randomUUID(),
            status: 'pending'
        })
        .select()
        .single();

    if (inviteError) {
        console.error('❌ Invitation failed:', inviteError);
    } else {
        console.log('✅ Invitation sent successfully:', invite.id);
    }

    // Cleanup
    console.log('🧹 Cleaning up...');
    await supabase.from('groups').delete().eq('id', group.id);
}

debugInvitations().catch(console.error);
