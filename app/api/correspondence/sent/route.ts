import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CorrespondenceInboxResponse } from '@/types'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('page_size') || '20')

        // Validate pagination
        if (page < 1 || pageSize < 1 || pageSize > 50) {
            return NextResponse.json(
                { success: false, error: 'Invalid pagination parameters' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase.rpc('get_correspondence_sent', {
            p_page: page,
            p_page_size: pageSize
        })

        if (error) {
            console.error('[correspondence/sent] RPC error:', error)
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json(data as CorrespondenceInboxResponse)
    } catch (error) {
        console.error('[correspondence/sent] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
