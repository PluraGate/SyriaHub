'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import type { UserRole } from '@/types'
import { withTimeout } from '@/lib/utils'

// ─── Public types ────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email?: string
  name?: string
  avatarUrl?: string
  role: UserRole
}

interface AuthContextType {
  /** The resolved user (null when logged out or still loading) */
  user: AuthUser | null
  /** Raw Supabase session — useful for token access */
  session: Session | null
  /** True while the initial auth check is in progress */
  isLoading: boolean
  /** Convenience boolean — false while loading */
  isAuthenticated: boolean
  /** Force a re-fetch of user profile data (role, avatar, etc.) */
  refreshProfile: () => Promise<void>
  /** Sign out and redirect to home */
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ─── Hook ────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

// ─── Provider ────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode
  /** Pre-fetched user from the server layout (avoids an extra round-trip) */
  serverUser?: { id: string; email?: string } | null
}

const AUTH_REQUEST_TIMEOUT_MS = 6000

export function AuthProvider({ children, serverUser }: AuthProviderProps) {
  const supabase = useMemo(() => createClient(), [])

  const [session, setSession] = useState<Session | null>(null)
  // Initialize from server-provided user to avoid flash of unauthenticated UI
  const [authUser, setAuthUser] = useState<AuthUser | null>(
    serverUser
      ? { id: serverUser.id, email: serverUser.email, role: 'member' as UserRole }
      : null,
  )
  const [isLoading, setIsLoading] = useState(!serverUser)

  // ── Fetch profile (role + avatar) from users table ──────────────
  const fetchProfile = useCallback(
    async (userId: string, email?: string, meta?: Record<string, unknown>) => {
      let data = null
      try {
        const profileRequest = supabase
          .from('users')
          .select('name, avatar_url, role')
          .eq('id', userId)
          .maybeSingle()

        const result: Awaited<typeof profileRequest> = await withTimeout(
          profileRequest,
          AUTH_REQUEST_TIMEOUT_MS,
          '[Auth] Profile fetch timed out',
        )
        data = result.data
        if (result.error) {
          console.warn('[Auth] Profile fetch failed:', result.error.message)
        }
      } catch (err) {
        console.warn('[Auth] Profile fetch error:', err)
      }

      const resolved: AuthUser = {
        id: userId,
        email: email ?? undefined,
        name: data?.name ?? (meta?.full_name as string) ?? (meta?.name as string) ?? undefined,
        avatarUrl: data?.avatar_url ?? (meta?.avatar_url as string) ?? undefined,
        role: (data?.role as UserRole) ?? 'member',
      }

      setAuthUser(resolved)
      return resolved
    },
    [supabase],
  )

  // ── Public refresh helper ──────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    if (authUser?.id) {
      await fetchProfile(authUser.id, authUser.email)
    }
  }, [authUser?.id, authUser?.email, fetchProfile])

  // ── Sign out ────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    // Tell service worker to purge cached API/auth responses
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_AUTH_CACHE' })
    }
    // Clear all SW caches to prevent stale state on next visit
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map(key => caches.delete(key)))
    }
    setSession(null)
    setAuthUser(null)

    // Sign out via the server-side route so httpOnly auth cookies are
    // cleared reliably.  The previous approach (client-side signOut +
    // redirect) raced against the Supabase call and could leave stale
    // cookies, causing a "half signed-in" ghost state on reload.
    try {
      await supabase.auth.signOut()
    } catch {
      // Best-effort client-side cleanup; the server route handles cookies
    }

    // POST to the server-side signout route which clears httpOnly cookies
    // and redirects to '/'.  Use a form submission for a full navigation.
    const locale = window.location.pathname.match(/^\/(en|ar)/)?.[1] || 'ar'
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = `/${locale}/auth/signout`
    document.body.appendChild(form)
    form.submit()
  }, [supabase])

  // ── Bootstrap: get the initial session then listen for changes ──
  useEffect(() => {
    let mounted = true

    // 1. Resolve initial session
    async function init() {
      try {
        const sessionRequest = supabase.auth.getSession()
        const { data: { session: currentSession } }: Awaited<typeof sessionRequest> = await withTimeout(
          sessionRequest,
          AUTH_REQUEST_TIMEOUT_MS,
          '[Auth] Session init timed out',
        )

        if (!mounted) return

        if (currentSession?.user) {
          setSession(currentSession)
          await fetchProfile(
            currentSession.user.id,
            currentSession.user.email ?? undefined,
            currentSession.user.user_metadata,
          )
        } else {
          // No valid client-side session — discard any stale server-provided
          // hint.  This prevents a "half signed-in" state when the browser
          // serves a cached page whose serverUser prop is outdated (e.g. after
          // closing a tab and reopening, or after a failed sign-out).
          setSession(null)
          setAuthUser(null)
        }
      } catch (err) {
        console.warn('[Auth] Session init failed — treating as logged out:', err)
        setSession(null)
        setAuthUser(null)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    init()

    // Safety timeout: force isLoading=false if auth check hangs
    const timeout = setTimeout(() => {
      if (mounted) setIsLoading(false)
    }, 5000)

    // 2. Subscribe to auth changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, newSession: Session | null) => {
        if (!mounted) return

        setSession(newSession)

        if (newSession?.user) {
          await fetchProfile(
            newSession.user.id,
            newSession.user.email ?? undefined,
            newSession.user.user_metadata,
          )
        } else {
          setAuthUser(null)
        }

        // On sign-out, loading is already false — nothing extra to do
      },
    )

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [supabase, serverUser, fetchProfile])

  // ── Memoised context value ──────────────────────────────────────
  const value = useMemo<AuthContextType>(
    () => ({
      user: authUser,
      session,
      isLoading,
      isAuthenticated: !isLoading && authUser !== null,
      refreshProfile,
      signOut,
    }),
    [authUser, session, isLoading, refreshProfile, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
