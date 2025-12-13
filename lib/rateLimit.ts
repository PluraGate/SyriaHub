/**
 * Rate Limiting Module
 * Provides in-memory rate limiting with sliding window algorithm
 * For production, consider using @upstash/ratelimit with Redis
 */

interface RateLimitEntry {
    count: number
    resetAt: number
}

interface RateLimitConfig {
    windowMs: number      // Time window in milliseconds
    maxRequests: number   // Max requests per window
    identifier: string    // Rate limit identifier (e.g., 'api-read', 'api-write')
}

// In-memory store for rate limits (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Default configurations for different endpoint types
export const RATE_LIMIT_CONFIGS = {
    // Read operations - more permissive
    read: {
        windowMs: 60 * 1000,      // 1 minute
        maxRequests: 100,
        identifier: 'read',
    },
    // Write operations - stricter
    write: {
        windowMs: 60 * 1000,      // 1 minute
        maxRequests: 20,
        identifier: 'write',
    },
    // Auth operations - very strict to prevent brute force
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 10,
        identifier: 'auth',
    },
    // Upload operations
    upload: {
        windowMs: 60 * 1000,      // 1 minute
        maxRequests: 5,
        identifier: 'upload',
    },
    // Report/flag operations
    report: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10,
        identifier: 'report',
    },
} as const satisfies Record<string, RateLimitConfig>

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS

export interface RateLimitResult {
    success: boolean
    remaining: number
    resetAt: number
    retryAfter?: number
}

/**
 * Check rate limit for a given user/IP
 */
export function checkRateLimit(
    userId: string | null,
    ipAddress: string,
    type: RateLimitType = 'read'
): RateLimitResult {
    const config = RATE_LIMIT_CONFIGS[type]
    const key = `${config.identifier}:${userId || ipAddress}`
    const now = Date.now()

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
        cleanupExpiredEntries()
    }

    let entry = rateLimitStore.get(key)

    if (!entry || now >= entry.resetAt) {
        // Create new entry
        entry = {
            count: 1,
            resetAt: now + config.windowMs,
        }
        rateLimitStore.set(key, entry)

        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetAt: entry.resetAt,
        }
    }

    // Increment existing entry
    entry.count += 1

    if (entry.count > config.maxRequests) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
        return {
            success: false,
            remaining: 0,
            resetAt: entry.resetAt,
            retryAfter,
        }
    }

    return {
        success: true,
        remaining: config.maxRequests - entry.count,
        resetAt: entry.resetAt,
    }
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries() {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now >= entry.resetAt) {
            rateLimitStore.delete(key)
        }
    }
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
    }

    if (!result.success && result.retryAfter) {
        headers['Retry-After'] = result.retryAfter.toString()
    }

    return headers
}

/**
 * Extract IP address from headers
 */
export function getClientIP(headers: Headers): string {
    const forwardedFor = headers.get('x-forwarded-for')
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
    }

    const realIP = headers.get('x-real-ip')
    if (realIP) {
        return realIP
    }

    return 'unknown'
}

// ==================== Middleware Helpers ====================

import { NextRequest, NextResponse } from 'next/server'

/**
 * Rate limit middleware wrapper for API routes
 */
export function withRateLimit(
    type: RateLimitType = 'read'
) {
    return function (
        handler: (req: NextRequest, context?: any) => Promise<NextResponse>
    ) {
        return async function rateLimitedHandler(
            req: NextRequest,
            context?: any
        ): Promise<NextResponse> {
            // Get user ID from auth header or null
            const authHeader = req.headers.get('authorization')
            let userId: string | null = null

            // Try to extract user ID from JWT if present
            if (authHeader?.startsWith('Bearer ')) {
                try {
                    const token = authHeader.substring(7)
                    // Simple extraction - in production use proper JWT verification
                    const payload = JSON.parse(atob(token.split('.')[1]))
                    userId = payload.sub || null
                } catch {
                    // Ignore parsing errors
                }
            }

            const ipAddress = getClientIP(req.headers)
            const result = checkRateLimit(userId, ipAddress, type)

            if (!result.success) {
                return NextResponse.json(
                    {
                        error: 'Too many requests',
                        message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
                    },
                    {
                        status: 429,
                        headers: createRateLimitHeaders(result),
                    }
                )
            }

            // Call the original handler
            const response = await handler(req, context)

            // Add rate limit headers to response
            const rateLimitHeaders = createRateLimitHeaders(result)
            for (const [key, value] of Object.entries(rateLimitHeaders)) {
                response.headers.set(key, value)
            }

            return response
        }
    }
}

/**
 * Simple rate limit check for use in API routes
 */
export async function applyRateLimit(
    req: NextRequest,
    type: RateLimitType = 'read'
): Promise<{ allowed: boolean; response?: NextResponse }> {
    const ipAddress = getClientIP(req.headers)

    // Try to get user ID from cookie or header
    let userId: string | null = null
    const authCookie = req.cookies.get('sb-auth-token')?.value
    if (authCookie) {
        try {
            const payload = JSON.parse(atob(authCookie.split('.')[1]))
            userId = payload.sub || null
        } catch {
            // Ignore
        }
    }

    const result = checkRateLimit(userId, ipAddress, type)

    if (!result.success) {
        return {
            allowed: false,
            response: NextResponse.json(
                {
                    error: 'Too many requests',
                    message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
                },
                {
                    status: 429,
                    headers: createRateLimitHeaders(result),
                }
            ),
        }
    }

    return { allowed: true }
}

// ==================== Abuse Detection ====================

interface AbuseEntry {
    violations: number
    lastViolation: number
    blocked: boolean
    blockedUntil?: number
}

const abuseStore = new Map<string, AbuseEntry>()

/**
 * Record a rate limit violation for abuse detection
 */
export function recordViolation(identifier: string): void {
    const now = Date.now()
    let entry = abuseStore.get(identifier)

    if (!entry) {
        entry = {
            violations: 1,
            lastViolation: now,
            blocked: false,
        }
    } else {
        entry.violations += 1
        entry.lastViolation = now

        // Block if too many violations in a short period
        if (entry.violations >= 10) {
            entry.blocked = true
            entry.blockedUntil = now + 24 * 60 * 60 * 1000 // 24 hour block
            console.warn('[Rate Limit] Abuse detected, blocking:', identifier)
        }
    }

    abuseStore.set(identifier, entry)
}

/**
 * Check if an identifier is blocked
 */
export function isBlocked(identifier: string): boolean {
    const entry = abuseStore.get(identifier)
    if (!entry) return false

    if (entry.blocked && entry.blockedUntil) {
        if (Date.now() >= entry.blockedUntil) {
            // Unblock after timeout
            entry.blocked = false
            entry.violations = 0
            abuseStore.set(identifier, entry)
            return false
        }
        return true
    }

    return false
}
