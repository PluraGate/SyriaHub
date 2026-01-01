import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email'

// Simple test endpoint - only works in development
export async function GET(request: NextRequest) {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Test endpoint disabled in production' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const to = searchParams.get('to') || 'architecture.visual.art@gmail.com'

    try {
        const template = emailTemplates.welcome('PluraGate Tester')

        const success = await sendEmail({
            to,
            subject: '🧪 ' + template.subject,
            html: template.html,
        })

        if (success) {
            return NextResponse.json({
                success: true,
                message: `Test email sent to ${to}`,
                timestamp: new Date().toISOString()
            })
        } else {
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
        }
    } catch (error: any) {
        console.error('Test email error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
