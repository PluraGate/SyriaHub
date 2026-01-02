import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
    checkRateLimit,
    RATE_LIMIT_CONFIGS,
    type RateLimitType
} from '@/lib/rateLimit'

describe('checkRateLimit', () => {
    beforeEach(() => {
        // Reset the rate limit store between tests by using unique IPs
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('basic functionality', () => {
        it('allows requests under the limit', () => {
            const ip = `test-ip-${Date.now()}-${Math.random()}`
            const result = checkRateLimit(null, ip, 'read')

            expect(result.success).toBe(true)
            expect(result.remaining).toBe(RATE_LIMIT_CONFIGS.read.maxRequests - 1)
        })

        it('returns remaining count after each request', () => {
            const ip = `test-ip-${Date.now()}-${Math.random()}`

            const result1 = checkRateLimit(null, ip, 'read')
            expect(result1.remaining).toBe(99) // 100 - 1

            const result2 = checkRateLimit(null, ip, 'read')
            expect(result2.remaining).toBe(98) // 100 - 2
        })

        it('blocks requests when limit is exceeded', () => {
            const ip = `test-ip-${Date.now()}-${Math.random()}`

            // Exhaust the limit
            for (let i = 0; i < RATE_LIMIT_CONFIGS.auth.maxRequests; i++) {
                checkRateLimit(null, ip, 'auth')
            }

            // Next request should be blocked
            const result = checkRateLimit(null, ip, 'auth')
            expect(result.success).toBe(false)
            expect(result.remaining).toBe(0)
        })
    })

    describe('rate limit types', () => {
        const rateLimitTypes: RateLimitType[] = ['read', 'write', 'auth', 'upload', 'report', 'ai']

        rateLimitTypes.forEach(type => {
            it(`has correct config for ${type} type`, () => {
                expect(RATE_LIMIT_CONFIGS[type]).toBeDefined()
                expect(RATE_LIMIT_CONFIGS[type].windowMs).toBeGreaterThan(0)
                expect(RATE_LIMIT_CONFIGS[type].maxRequests).toBeGreaterThan(0)
                expect(RATE_LIMIT_CONFIGS[type].identifier).toBe(type)
            })
        })
    })

    describe('user vs IP identification', () => {
        it('uses user ID when provided', () => {
            const userId = `user-${Date.now()}`
            const ip = `ip-${Date.now()}`

            // Make requests as user
            checkRateLimit(userId, ip, 'read')
            checkRateLimit(userId, ip, 'read')

            // Same user, different IP should share limit
            const result = checkRateLimit(userId, 'different-ip', 'read')
            expect(result.remaining).toBe(97) // 100 - 3
        })

        it('uses IP when user ID is null', () => {
            const ip1 = `ip1-${Date.now()}`
            const ip2 = `ip2-${Date.now()}`

            // Make requests from ip1
            checkRateLimit(null, ip1, 'read')
            checkRateLimit(null, ip1, 'read')

            // ip2 should have fresh limit
            const result = checkRateLimit(null, ip2, 'read')
            expect(result.remaining).toBe(99) // 100 - 1
        })
    })

    describe('reset timing', () => {
        it('includes resetAt timestamp', () => {
            const ip = `test-ip-${Date.now()}`
            const result = checkRateLimit(null, ip, 'read')

            expect(result.resetAt).toBeGreaterThan(Date.now())
        })

        it('includes retryAfter when blocked', () => {
            const ip = `test-ip-${Date.now()}-${Math.random()}`

            // Exhaust auth limit (10 requests)
            for (let i = 0; i < RATE_LIMIT_CONFIGS.auth.maxRequests; i++) {
                checkRateLimit(null, ip, 'auth')
            }

            const result = checkRateLimit(null, ip, 'auth')
            expect(result.success).toBe(false)
            expect(result.retryAfter).toBeDefined()
            expect(result.retryAfter).toBeGreaterThan(0)
        })
    })
})

describe('RATE_LIMIT_CONFIGS', () => {
    it('read config allows 100 requests per minute', () => {
        expect(RATE_LIMIT_CONFIGS.read.maxRequests).toBe(100)
        expect(RATE_LIMIT_CONFIGS.read.windowMs).toBe(60 * 1000)
    })

    it('write config is stricter than read', () => {
        expect(RATE_LIMIT_CONFIGS.write.maxRequests).toBeLessThan(RATE_LIMIT_CONFIGS.read.maxRequests)
    })

    it('auth config has longest window for brute force protection', () => {
        expect(RATE_LIMIT_CONFIGS.auth.windowMs).toBe(15 * 60 * 1000) // 15 minutes
        expect(RATE_LIMIT_CONFIGS.auth.maxRequests).toBe(10)
    })

    it('ai config has 1 hour window', () => {
        expect(RATE_LIMIT_CONFIGS.ai.windowMs).toBe(60 * 60 * 1000) // 1 hour
    })
})
