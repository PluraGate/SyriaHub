import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'
import { sendInvitationEmail, emailTemplates } from '@/lib/email'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'

async function handlePost(request: NextRequest) {
    // CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin or moderator
        const { data: userData } = await supabase
            .from('users')
            .select('role, name')
            .eq('id', user.id)
            .single()

        if (!userData || !['admin', 'moderator'].includes(userData.role)) {
            return NextResponse.json(
                { error: 'Only admins and moderators can send invitation emails' },
                { status: 403 }
            )
        }

        const { code, recipientEmail, recipientName, language } = await request.json()

        if (!code || !recipientEmail) {
            return NextResponse.json(
                { error: 'Missing required fields: code, recipientEmail' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(recipientEmail)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
        }

        // Verify the invite code exists and is active
        const { data: invite } = await supabase
            .from('invite_codes')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .single()

        if (!invite) {
            return NextResponse.json({ error: 'Invalid or inactive invite code' }, { status: 400 })
        }

        // Only owner or admin can send email for this code
        if (invite.created_by !== user.id && userData.role !== 'admin') {
            return NextResponse.json(
                { error: 'You can only send emails for your own invite codes' },
                { status: 403 }
            )
        }

        // Build the invite URL with encoded email
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const encodedEmail = encodeURIComponent(recipientEmail.trim())
        const inviteUrl = `${siteUrl}/auth/signup?code=${code.toUpperCase()}&email=${encodedEmail}`

        // Get the appropriate template based on language (uses SyriaHub branding to match sending domain)
        const lang = language === 'ar' ? 'ar' : 'en'
        const template = lang === 'ar'
            ? emailTemplates.syriaHubInviteAR(inviteUrl, recipientName)
            : emailTemplates.syriaHubInviteEN(inviteUrl, recipientName)

        // Send the email using dedicated invitation sender (invitations@syriahub.org)
        const success = await sendInvitationEmail({
            to: recipientEmail,
            subject: template.subject,
            html: template.html,
        })

        if (success) {
            // Update the invite code with the sent email info (optional tracking)
            await supabase
                .from('invite_codes')
                .update({
                    note: `Sent to ${recipientEmail} on ${new Date().toISOString().split('T')[0]}`
                })
                .eq('id', invite.id)

            return NextResponse.json({
                success: true,
                message: `Invitation sent to ${recipientEmail}`
            })
        } else {
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
        }
    } catch (error: any) {
        console.error('Send invite email error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export const POST = withRateLimit('write')(handlePost)
