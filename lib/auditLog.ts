/**
 * Audit Log Service
 * 
 * Logs security-critical events to the audit_logs table for forensic analysis.
 * Logs are immutable - they cannot be updated or deleted.
 */

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export type AuditAction =
    // Authentication
    | 'login_success'
    | 'login_failed'
    | 'logout'
    | 'password_changed'
    | 'password_reset_requested'
    | 'password_reset_completed'
    | 'signup'
    // Authorization
    | 'role_changed'
    | 'user_banned'
    | 'user_unbanned'
    // Moderation
    | 'content_flagged'
    | 'content_approved'
    | 'content_rejected'
    | 'appeal_submitted'
    | 'appeal_decided'
    | 'jury_vote_cast'
    // Data access
    | 'admin_viewed_user'
    | 'admin_exported_data'
    // Generic
    | 'custom'

export type AuditCategory = 'auth' | 'moderation' | 'admin' | 'data' | 'general'

export interface AuditLogEntry {
    action: AuditAction
    category?: AuditCategory
    userId?: string | null
    metadata?: Record<string, unknown>
}

/**
 * Get client IP and user agent from request headers
 */
async function getRequestContext(): Promise<{ ip: string | null; userAgent: string | null }> {
    try {
        const headersList = await headers()
        const forwardedFor = headersList.get('x-forwarded-for')
        const ip = forwardedFor?.split(',')[0]?.trim() || headersList.get('x-real-ip') || null
        const userAgent = headersList.get('user-agent') || null
        return { ip, userAgent }
    } catch {
        // Headers may not be available in some contexts
        return { ip: null, userAgent: null }
    }
}

/**
 * Determine category from action if not provided
 */
function inferCategory(action: AuditAction): AuditCategory {
    if (action.startsWith('login') || action.startsWith('logout') ||
        action.startsWith('password') || action === 'signup') {
        return 'auth'
    }
    if (action.startsWith('content') || action.startsWith('appeal') ||
        action.startsWith('jury') || action === 'role_changed') {
        return 'moderation'
    }
    if (action.startsWith('admin') || action.startsWith('user_')) {
        return 'admin'
    }
    return 'general'
}

/**
 * Log an audit event
 * 
 * @param entry - The audit log entry to record
 * @returns The created log ID, or null if logging failed
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<string | null> {
    try {
        const supabase = await createClient()
        const { ip, userAgent } = await getRequestContext()

        const category = entry.category || inferCategory(entry.action)

        const { data, error } = await supabase
            .from('audit_logs')
            .insert({
                action: entry.action,
                category,
                user_id: entry.userId || null,
                ip_address: ip,
                user_agent: userAgent,
                metadata: entry.metadata || {}
            })
            .select('id')
            .single()

        if (error) {
            // Log to console but don't throw - audit logging should never break the app
            console.error('[AuditLog] Failed to log event:', error.message, entry)
            return null
        }

        return data?.id || null
    } catch (error) {
        console.error('[AuditLog] Unexpected error:', error)
        return null
    }
}

/**
 * Convenience function to log authentication events
 */
export async function logAuthEvent(
    action: Extract<AuditAction, 'login_success' | 'login_failed' | 'logout' | 'signup' | 'password_changed' | 'password_reset_requested' | 'password_reset_completed'>,
    userId?: string | null,
    metadata?: Record<string, unknown>
): Promise<string | null> {
    return logAuditEvent({
        action,
        category: 'auth',
        userId,
        metadata
    })
}

/**
 * Convenience function to log moderation events
 */
export async function logModerationEvent(
    action: Extract<AuditAction, 'content_flagged' | 'content_approved' | 'content_rejected' | 'appeal_submitted' | 'appeal_decided' | 'jury_vote_cast'>,
    userId: string,
    metadata: Record<string, unknown>
): Promise<string | null> {
    return logAuditEvent({
        action,
        category: 'moderation',
        userId,
        metadata
    })
}
