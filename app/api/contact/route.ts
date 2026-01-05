import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit } from '@/lib/rateLimit'
import { validateOrigin } from '@/lib/apiUtils'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
    // CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    }

    try {
        const supabase = await createClient()
        const { name, email, subject, message } = await request.json()

        // Basic validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }

        // Insert into contact_messages table
        const { error: dbError } = await supabase
            .from('contact_messages')
            .insert({
                name,
                email,
                subject,
                message,
                status: 'new'
            })

        if (dbError) {
            console.error('Contact form db error:', dbError)
            // We continue even if DB fails, to try sending email
        }

        // Send email to admin
        // We import sendEmail and emailTemplates from @/lib/email which handles the transport
        const adminEmail = 'admin@pluragate.org'
        const emailTemplate = emailTemplates.contactFormSubmission(name, email, subject, message)

        const emailSent = await sendEmail({
            to: adminEmail,
            subject: emailTemplate.subject,
            html: emailTemplate.html
        })

        if (!emailSent) {
            console.error('Failed to send contact email')
            // If both DB and Email fail, then we should probably error out or at least warn
            if (dbError) {
                return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Contact API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
