import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'
import { withErrorHandling } from '@/lib/apiUtils'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

async function handleHealth(): Promise<NextResponse> {
  const envStatus = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  try {
    const supabase = await createServerClient()
    const { error } = await supabase.from('posts').select('id').limit(1)

    if (error) {
      console.error('[Health Check] Database error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Database check failed',
          details: error.message,
          env: envStatus,
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: envStatus,
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('[Health Check] Unexpected error:', err)
    return NextResponse.json(
      {
        success: false,
        error: 'Terminal health check failure',
        message: err.message,
        env: envStatus,
      },
      { status: 500 }
    )
  }
}

export const GET = withErrorHandling(handleHealth, {
  cache: {
    enabled: false,
  },
})
