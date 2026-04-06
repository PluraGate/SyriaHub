'use server'

import { createClient } from '@/lib/supabase/server'
import { logAuthEvent } from '@/lib/auditLog'

export async function handlePasswordReset(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters', success: false }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match', success: false }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: 'Your reset link has expired or is invalid. Please request a new one.',
      success: false,
    }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message, success: false }
  }

  await logAuthEvent('password_reset_completed', user.id, {})

  return { error: null, success: true }
}
