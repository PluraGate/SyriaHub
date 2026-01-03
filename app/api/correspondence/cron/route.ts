import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withRateLimit } from '@/lib/rateLimit'

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// It uses the service role to bypass RLS and deliver pending correspondence

async function handlePost(request: NextRequest) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        // SECURITY: Fail-closed - reject if CRON_SECRET is not configured
        if (!cronSecret) {
            console.error('[correspondence/cron] CRON_SECRET not configured')
            return NextResponse.json(
                { success: false, error: 'Server misconfiguration' },
                { status: 500 }
            )
        }

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Use service role client to bypass RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        )

        // Call the delivery function
        const { data, error } = await supabaseAdmin.rpc('deliver_pending_correspondence')

        if (error) {
            console.error('[correspondence/cron] Delivery error:', error)
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            )
        }

        const deliveredCount = data || 0
        console.log(`[correspondence/cron] Delivered ${deliveredCount} correspondence`)

        return NextResponse.json({
            success: true,
            delivered: deliveredCount,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('[correspondence/cron] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Also support GET for manual testing (protected by same secret)
async function handleGet(request: NextRequest) {
    return handlePost(request)
}

export const POST = withRateLimit('write')(handlePost)
export const GET = withRateLimit('write')(handleGet)
