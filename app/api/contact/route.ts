import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { validateOrigin } from '@/lib/apiUtils'
import { sendEmail, emailTemplates } from '@/lib/email'
import { applyRateLimit } from '@/lib/rateLimit'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { z } from 'zod'

// SECURITY: Strict input validation schema
const contactSchema = z.object({
    name: z.string().min(2, 'Name too short').max(100, 'Name too long').trim(),
    email: z.string().email('Invalid email').max(255, 'Email too long').toLowerCase().trim(),
    subject: z.string().min(5, 'Subject too short').max(200, 'Subject too long').trim(),
    message: z.string().min(10, 'Message too short').max(5000, 'Message too long').trim(),
    // Honeypot field - should always be empty from real users
    company: z.string().max(0, 'Invalid submission').optional(),
    // Turnstile token (optional - only required if configured)
    'cf-turnstile-response': z.string().optional(),
})


export async function POST(request: NextRequest) {
    // 1. Rate Limiting (Prevent Spam)
    const rateLimit = await applyRateLimit(request, 'write')
    if (!rateLimit.allowed && rateLimit.response) {
        return rateLimit.response
    }

    // 2. CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
    }

    try {
        const body = await request.json()

        // 3. Honeypot check - if 'company' field has value, it's likely a bot
        if (body.company && body.company.length > 0) {
            // Return fake success to not alert the bot
            console.log('[Security] Honeypot triggered, rejecting submission')
            return NextResponse.json({ success: true })
        }

        // 4. Turnstile verification (if configured)
        const turnstileToken = body['cf-turnstile-response']
        const isTurnstileValid = await verifyTurnstileToken(turnstileToken)
        if (!isTurnstileValid) {
            console.log('[Security] Turnstile verification failed')
            return NextResponse.json(
                { error: 'Security verification failed. Please try again.' },
                { status: 403 }
            )
        }

        // 5. Strict input validation
        const parseResult = contactSchema.safeParse(body)
        if (!parseResult.success) {
            const firstError = parseResult.error.issues[0]
            return NextResponse.json(
                { error: firstError?.message || 'Invalid input' },
                { status: 400 }
            )
        }

        const { name, email, subject, message } = parseResult.data

        let dbSuccess = false
        let emailSuccess = false
        const errors: string[] = []

        // 5. Try Database Insert
        try {
            // Use Service Role key if available to bypass RLS
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

            console.log(`[Contact] Service Role Key present: ${!!serviceRoleKey}`)

            let supabase

            if (serviceRoleKey && supabaseUrl) {
                supabase = createAdminClient(supabaseUrl, serviceRoleKey, {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                    }
                })
            } else {
                console.log('[Contact] Using standard server client (Warning: RLS may block non-registered users)')
                supabase = await createServerClient()
            }

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
                console.error('[Contact] DB Error:', dbError)
                // Log full error for debugging
                console.error('[Contact] DB Error Details:', JSON.stringify(dbError, null, 2))
                errors.push(`DB Error: ${dbError.message}`)
            } else {
                console.log('[Contact] DB Insert Success')
                dbSuccess = true
            }
        } catch (err: any) {
            console.error('[Contact] DB Exception:', err)
            errors.push(`DB Exception: ${err.message}`)
        }

        // 6. Try Sending Email
        try {
            const adminEmail = process.env.CONTACT_EMAIL || 'admin@pluragate.org'
            const emailTemplate = emailTemplates.contactFormSubmission(name, email, subject, message)

            const emailSent = await sendEmail({
                to: adminEmail,
                subject: emailTemplate.subject,
                html: emailTemplate.html
            })

            if (!emailSent) {
                console.error('[Contact] Email failed to send (check previous logs)')
                errors.push('Email failed to send')
            } else {
                console.log('[Contact] Email Send Success')
                emailSuccess = true
            }
        } catch (err: any) {
            console.error('[Contact] Email Exception:', err)
            errors.push(`Email Exception: ${err.message}`)
        }

        // 7. Determine Response
        // Success if EITHER worked (we don't want to lose the message if one fails)
        if (dbSuccess || emailSuccess) {
            return NextResponse.json({
                success: true,
                warning: (!dbSuccess || !emailSuccess) ? 'Partial success' : null
            })
        } else {
            console.error('[Contact] All methods failed:', errors)
            return NextResponse.json(
                { error: 'Failed to process message', details: errors },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('[Contact] Unhandled API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
