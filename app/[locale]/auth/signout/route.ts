import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit } from '@/lib/rateLimit'
import { validateOrigin } from '@/lib/apiUtils'

async function handlePost(request: NextRequest) {
  // CSRF protection
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export const POST = withRateLimit('auth')(handlePost)
