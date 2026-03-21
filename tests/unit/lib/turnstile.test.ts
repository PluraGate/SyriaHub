import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { verifyTurnstileToken } from '@/lib/turnstile'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('verifyTurnstileToken', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        vi.unstubAllEnvs()
    })

    afterEach(() => {
        vi.unstubAllEnvs()
    })

    describe('when TURNSTILE_SECRET_KEY is configured', () => {
        beforeEach(() => {
            vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret-key')
        })

        it('returns false when token is null', async () => {
            const result = await verifyTurnstileToken(null)
            expect(result).toBe(false)
            expect(mockFetch).not.toHaveBeenCalled()
        })

        it('returns false when token is empty string', async () => {
            const result = await verifyTurnstileToken('')
            expect(result).toBe(false)
            expect(mockFetch).not.toHaveBeenCalled()
        })

        it('returns true when Cloudflare responds with success: true', async () => {
            mockFetch.mockResolvedValueOnce({
                json: () => Promise.resolve({ success: true }),
            })

            const result = await verifyTurnstileToken('valid-token')

            expect(result).toBe(true)
            expect(mockFetch).toHaveBeenCalledWith(
                'https://challenges.cloudflare.com/turnstile/v0/siteverify',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }),
                })
            )
        })

        it('returns false when Cloudflare responds with success: false and error-codes', async () => {
            mockFetch.mockResolvedValueOnce({
                json: () => Promise.resolve({
                    success: false,
                    'error-codes': ['invalid-input-response'],
                }),
            })

            const result = await verifyTurnstileToken('invalid-token')

            expect(result).toBe(false)
        })

        it('returns false when fetch throws a network error', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            const result = await verifyTurnstileToken('some-token')

            expect(result).toBe(false)
        })
    })

    describe('when TURNSTILE_SECRET_KEY is not configured', () => {
        beforeEach(() => {
            vi.stubEnv('TURNSTILE_SECRET_KEY', '')
        })

        it('returns false in production (fail closed)', async () => {
            vi.stubEnv('NODE_ENV', 'production')

            const result = await verifyTurnstileToken('any-token')

            expect(result).toBe(false)
            expect(mockFetch).not.toHaveBeenCalled()
        })

        it('returns true in development (skip verification)', async () => {
            vi.stubEnv('NODE_ENV', 'development')

            const result = await verifyTurnstileToken('any-token')

            expect(result).toBe(true)
            expect(mockFetch).not.toHaveBeenCalled()
        })

        it('returns true in development even when token is null (key absent takes precedence)', async () => {
            vi.stubEnv('NODE_ENV', 'development')

            // When no key is set in dev mode, the function returns true early (before the null token check)
            const result = await verifyTurnstileToken(null)

            expect(result).toBe(true)
        })
    })
})
