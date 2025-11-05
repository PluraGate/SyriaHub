// Enhanced Supabase client utilities with helper functions
import { createClient as createBrowserClient } from './supabase/client'
import { createClient as createServerClient } from './supabase/server'
import type { User, UserRole } from '@/types'

// Re-export clients
export { createBrowserClient, createServerClient }

/**
 * Get the current authenticated user with profile data
 */
export async function getCurrentUser() {
  const supabase = await createServerClient()
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !authUser) {
    return { user: null, error: authError }
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (profileError) {
    return { user: null, error: profileError }
  }

  return { user: profile as User, error: null }
}

/**
 * Check if user has required role
 */
export async function hasRole(requiredRoles: UserRole | UserRole[]): Promise<boolean> {
  const { user } = await getCurrentUser()
  
  if (!user) return false

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  return roles.includes(user.role)
}

/**
 * Check if user is moderator or admin
 */
export async function isModerator(): Promise<boolean> {
  return hasRole(['moderator', 'admin'])
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin')
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return { user: data as User | null, error }
}

/**
 * Check if user owns a resource
 */
export async function isOwner(resourceUserId: string): Promise<boolean> {
  const { user } = await getCurrentUser()
  return user?.id === resourceUserId
}

/**
 * Check if user can modify resource (owner, moderator, or admin)
 */
export async function canModify(resourceUserId: string): Promise<boolean> {
  const { user } = await getCurrentUser()
  
  if (!user) return false
  if (user.id === resourceUserId) return true
  
  return ['moderator', 'admin'].includes(user.role)
}

/**
 * Verify authentication and return user
 */
export async function verifyAuth() {
  const { user, error } = await getCurrentUser()
  
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

/**
 * Verify authentication and required role
 */
export async function verifyRole(requiredRoles: UserRole | UserRole[]) {
  const user = await verifyAuth()
  
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions')
  }
  
  return user
}
