import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { createServerClient } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
    try {
        // Verify the request is from Supabase Edge Function or authenticated
        const authHeader = request.headers.get('authorization')
        const supabase = await createServerClient()

        // Verify service role key or user session
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const { data: { user }, error } = await supabase.auth.getUser(token)

            // Allow if valid user or if it matches service role
            if (error && token !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        } else {
            return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
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
