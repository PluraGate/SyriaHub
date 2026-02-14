/**
 * Rate Limiting Module
 *
 * Uses @upstash/ratelimit backed by Upstash Redis for production.
 * Falls back to an in-memory sliding-window when UPSTASH_REDIS_REST_URL
 * is not configured (local dev / CI).
 *
 * The public API (checkRateLimit, withRateLimit, applyRateLimit, etc.)
 * is unchanged — no consumer changes needed.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

// ─── Types ──────────────────────────────────────────────────────

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  identifier: string
}

export const RATE_LIMIT_CONFIGS = {
  read: { windowMs: 60_000, maxRequests: 100, identifier: 'read' },
  write: { windowMs: 60_000, maxRequests: 20, identifier: 'write' },
  auth: { windowMs: 15 * 60_000, maxRequests: 10, identifier: 'auth' },
  upload: { windowMs: 60_000, maxRequests: 5, identifier: 'upload' },
  report: { windowMs: 60 * 60_000, maxRequests: 10, identifier: 'report' },
  ai: { windowMs: 60 * 60_000, maxRequests: 50, identifier: 'ai' },
} as const satisfies Record<string, RateLimitConfig>

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
}

// ─── Redis / in-memory strategy ─────────────────────────────────

const hasRedis = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
)

function createUpstashLimiter(cfg: RateLimitConfig): Ratelimit {
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(cfg.maxRequests, `${cfg.windowMs} ms`),
    analytics: true,
    prefix: `syriahub:rl:${cfg.identifier}`,
  })
}

const upstashCache = new Map<string, Ratelimit>()
function getUpstashLimiter(type: RateLimitType): Ratelimit {
  let limiter = upstashCache.get(type)
  if (!limiter) {
    limiter = createUpstashLimiter(RATE_LIMIT_CONFIGS[type])
    upstashCache.set(type, limiter)
  }
  return limiter
}

// ─── In-memory fallback (dev / CI) ──────────────────────────────

interface MemoryEntry {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, MemoryEntry>()

function memoryCheck(key: string, cfg: RateLimitConfig): RateLimitResult {
  const now = Date.now()

  if (Math.random() < 0.01) {
    for (const [k, v] of memoryStore) {
      if (now >= v.resetAt) memoryStore.delete(k)
    }
  }

  let entry = memoryStore.get(key)

  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + cfg.windowMs }
    memoryStore.set(key, entry)
    return { success: true, remaining: cfg.maxRequests - 1, resetAt: entry.resetAt }
  }

  entry.count += 1

  if (entry.count > cfg.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { success: false, remaining: 0, resetAt: entry.resetAt, retryAfter }
  }

  return { success: true, remaining: cfg.maxRequests - entry.count, resetAt: entry.resetAt }
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * Check rate limit for a given user/IP.
 */
export async function checkRateLimit(
  userId: string | null,
  ipAddress: string,
  type: RateLimitType = 'read',
): Promise<RateLimitResult> {
  const cfg = RATE_LIMIT_CONFIGS[type]
  const key = `${cfg.identifier}:${userId || ipAddress}`

  if (hasRedis) {
    const limiter = getUpstashLimiter(type)
    const { success, remaining, reset } = await limiter.limit(key)
    return {
      success,
      remaining,
      resetAt: reset,
      ...(!success ? { retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) } : {}),
    }
  }

  return memoryCheck(key, cfg)
}

/**
 * Create rate limit headers for response.
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
 * Extract IP address from headers.
 */
export function getClientIP(headers: Headers): string {
  const xff = headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const realIP = headers.get('x-real-ip')
  if (realIP) return realIP
  return 'unknown'
}

// ─── Middleware helpers ─────────────────────────────────────────

/**
 * Rate limit middleware wrapper for API routes.
 */
export function withRateLimit(type: RateLimitType = 'read') {
  return function <T extends (req: NextRequest | Request, context?: unknown) => Promise<NextResponse>>(
    handler: T,
  ) {
    return async function rateLimitedHandler(
      req: NextRequest | Request,
      context?: unknown,
    ): Promise<NextResponse> {
      const ipAddress = getClientIP(req.headers)
      const result = await checkRateLimit(null, ipAddress, type)

      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Too many requests',
            message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
          },
          { status: 429, headers: createRateLimitHeaders(result) },
        )
      }

      const response = await handler(req, context)
      const rlHeaders = createRateLimitHeaders(result)
      for (const [k, v] of Object.entries(rlHeaders)) {
        response.headers.set(k, v)
      }
      return response
    }
  }
}

/**
 * Simple rate limit check for use inside API route handlers.
 */
export async function applyRateLimit(
  req: NextRequest | Request,
  type: RateLimitType = 'read',
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const ipAddress = getClientIP(req.headers)
  const result = await checkRateLimit(null, ipAddress, type)

  if (!result.success) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
        },
        { status: 429, headers: createRateLimitHeaders(result) },
      ),
    }
  }
  return { allowed: true }
}

// ─── Abuse detection ────────────────────────────────────────────

interface AbuseEntry {
  violations: number
  lastViolation: number
  blocked: boolean
  blockedUntil?: number
}

const abuseStore = new Map<string, AbuseEntry>()

export function recordViolation(identifier: string): void {
  const now = Date.now()
  let entry = abuseStore.get(identifier)

  if (!entry) {
    entry = { violations: 1, lastViolation: now, blocked: false }
  } else {
    entry.violations += 1
    entry.lastViolation = now
    if (entry.violations >= 10) {
      entry.blocked = true
      entry.blockedUntil = now + 24 * 60 * 60_000
      console.warn('[Rate Limit] Abuse detected, blocking:', identifier)
    }
  }
  abuseStore.set(identifier, entry)
}

export function isBlocked(identifier: string): boolean {
  const entry = abuseStore.get(identifier)
  if (!entry) return false
  if (entry.blocked && entry.blockedUntil) {
    if (Date.now() >= entry.blockedUntil) {
      entry.blocked = false
      entry.violations = 0
      abuseStore.set(identifier, entry)
      return false
    }
    return true
  }
  return false
}

/**
 * Reset all rate limit entries (for testing).
 */
export function resetRateLimit(): void {
  memoryStore.clear()
  abuseStore.clear()
}
