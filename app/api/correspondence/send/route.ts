import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateOrigin } from '@/lib/apiUtils'
import { withRateLimit } from '@/lib/rateLimit'
import type { SendCorrespondenceInput, SendCorrespondenceResponse } from '@/types'

// Strip/limit URLs for anti-chat (max 1 URL allowed) and block dangerous URI schemes
function sanitizeBody(body: string): string {
    // Remove dangerous URI schemes that could enable XSS if rendered
    let sanitized = body
        .replace(/javascript\s*:/gi, '[removed]')
        .replace(/data\s*:/gi, '[removed]')
        .replace(/vbscript\s*:/gi, '[removed]')

    // Keep only the first http(s) URL, strip the rest
    const urlRegex = /https?:\/\/[^\s]+/g
    let count = 0
    sanitized = sanitized.replace(urlRegex, (match) => {
        count++
        return count === 1 ? match : '[link removed]'
    })

    return sanitized
}

async function handlePost(request: NextRequest) {
    // CSRF protection
    if (!validateOrigin(request)) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
    }

    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const input: SendCorrespondenceInput = await request.json()

        // Validate required fields
        if (!input.kind || !input.recipient_id || !input.subject || !input.body) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Validate subject length
        if (input.subject.length < 10 || input.subject.length > 200) {
            return NextResponse.json(
                { success: false, error: 'Subject must be between 10 and 200 characters' },
                { status: 400 }
            )
        }

        // Validate body length
        if (input.body.length < 50 || input.body.length > 2000) {
            return NextResponse.json(
                { success: false, error: 'Message must be between 50 and 2000 characters' },
                { status: 400 }
            )
        }

        // Sanitize body (strip excess URLs)
        const sanitizedBody = sanitizeBody(input.body)

        // Call the RPC function
        const { data, error } = await supabase.rpc('send_correspondence', {
            p_kind: input.kind,
            p_post_id: input.post_id || null,
            p_moderation_case_id: input.moderation_case_id || null,
            p_recipient_id: input.recipient_id,
            p_subject: input.subject.trim(),
            p_body: sanitizedBody.trim(),
            p_parent_id: input.parent_id || null
        })

        if (error) {
            console.error('[correspondence/send] RPC error:', error)
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            )
        }

        const result = data as SendCorrespondenceResponse

        if (!result.success) {
            return NextResponse.json(result, { status: 400 })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('[correspondence/send] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export const POST = withRateLimit('write')(handlePost)
