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

  return NextResponse.json(
    {
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: envStatus,
    },
    { status: 200 }
  )
}

export const GET = withErrorHandling(handleHealth, {
  cache: {
    enabled: false,
  },
})
