import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { createServerClient } from '@/lib/supabaseClient'
import { withRateLimit } from '@/lib/rateLimit'

async function handlePost(request: NextRequest) {
    try {
        // SECURITY: Only allow service-role access to prevent abuse
        // End users should not be able to send arbitrary emails
        const authHeader = request.headers.get('authorization')

        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
        }

        const token = authHeader.substring(7)

        // Only accept service role key - no user tokens allowed
        if (token !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: 'Unauthorized - service role required' }, { status: 403 })
        }

        const { to, subject, html, text } = await request.json()

        if (!to || !subject || !html) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, html' },
                { status: 400 }
            )
        }

        const success = await sendEmail({ to, subject, html, text })

        if (success) {
            return NextResponse.json({ success: true, message: 'Email sent' })
        } else {
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
        }
    } catch (error: any) {
        console.error('API send-email error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export const POST = withRateLimit('write')(handlePost)
