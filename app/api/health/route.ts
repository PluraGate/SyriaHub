import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'
import { withErrorHandling } from '@/lib/apiUtils'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

async function handleHealth(): Promise<NextResponse> {
  const supabase = await createServerClient()
  const { error } = await supabase.from('posts').select('id').limit(1)

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Database check failed',
        details: error.message,
      },
      { status: 503 }
    )
  }

  return NextResponse.json(
    {
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}

export const GET = withErrorHandling(handleHealth, {
  cache: {
    enabled: false,
  },
})
