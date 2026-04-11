'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'
import type { UserRole } from '@/types'

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
      const { data } = await supabase
        .from('users')
        .select('name, avatar_url, role')
        .eq('id', userId)
        .maybeSingle()

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
    await supabase.auth.signOut()
    setSession(null)
    setAuthUser(null)
    // Redirect handled by the auth state change listener below —
    // but also do a hard navigate to clear any stale client state.
    window.location.href = '/'
  }, [supabase])

  // ── Bootstrap: get the initial session then listen for changes ──
  useEffect(() => {
    let mounted = true

    // 1. Resolve initial session
    async function init() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()

        if (!mounted) return

        if (currentSession?.user) {
          setSession(currentSession)
          await fetchProfile(
            currentSession.user.id,
            currentSession.user.email ?? undefined,
            currentSession.user.user_metadata,
          )
        } else if (serverUser) {
          // Fallback: use the server-provided user hint
          await fetchProfile(serverUser.id, serverUser.email)
        }
      } catch {
        // Auth unavailable — treat as logged-out
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
      async (event, newSession) => {
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
