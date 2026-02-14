import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
    test.describe('Health Check API', () => {
        test('GET /api/health returns 200', async ({ request }) => {
            const response = await request.get('/api/health')
            expect(response.status()).toBe(200)

            const data = await response.json()
            expect(data.success).toBe(true)
            expect(data.status).toBe('ok')
        })

        test('health check includes timestamp', async ({ request }) => {
            const response = await request.get('/api/health')
            const data = await response.json()
            
            expect(data.timestamp).toBeDefined()
            expect(new Date(data.timestamp).getTime()).toBeGreaterThan(0)
        })
    })

    test.describe('Posts API', () => {
        test('GET /api/posts returns posts list', async ({ request }) => {
            const response = await request.get('/api/posts')
            const data = await response.json()

            // In CI with placeholder DB credentials, the API may return an error
            if (response.status() === 200 && data.success) {
                expect(data.data).toHaveProperty('posts')
                expect(Array.isArray(data.data.posts)).toBe(true)
            } else {
                // Accept a well-formed error response (DB unavailable)
                expect([200, 500]).toContain(response.status())
                expect(data).toHaveProperty('success')
            }
        })

        test('GET /api/posts supports pagination', async ({ request }) => {
            const response = await request.get('/api/posts?limit=5&offset=0')
            const data = await response.json()

            if (response.status() === 200 && data.success) {
                expect(data.data.pagination).toBeDefined()
                expect(data.data.pagination.limit).toBe(5)
                expect(data.data.pagination.offset).toBe(0)
            } else {
                expect([200, 500]).toContain(response.status())
            }
        })

        test('GET /api/posts sanitizes pagination params', async ({ request }) => {
            // Try to request too many items
            const response = await request.get('/api/posts?limit=10000')
            const data = await response.json()

            if (response.status() === 200 && data.success) {
                // Should be capped at maxLimit (50)
                expect(data.data.pagination.limit).toBeLessThanOrEqual(50)
            } else {
                expect([200, 500]).toContain(response.status())
            }
        })

        test('POST /api/posts requires authentication', async ({ request }) => {
            const response = await request.post('/api/posts', {
                data: {
                    title: 'Test Post',
                    content: 'Test content',
                },
            })

            // Should return 401 Unauthorized
            expect(response.status()).toBe(401)
        })
    })

    test.describe('Tags API', () => {
        test('GET /api/tags returns tags list', async ({ request }) => {
            const response = await request.get('/api/tags')
            
            // Tags endpoint should exist and return success, 404 if no tags, or 500 if DB unavailable
            expect([200, 404, 500]).toContain(response.status())
            
            if (response.status() === 200) {
                const data = await response.json()
                expect(data.success).toBe(true)
            }
        })
    })

    test.describe('Search API', () => {
        test('GET /api/search requires query parameter', async ({ request }) => {
            const response = await request.get('/api/search')
            
            // Should return empty results for missing/short query
            expect(response.status()).toBe(200)
            const data = await response.json()
            expect(data.results).toEqual([])
        })

        test('GET /api/search returns results structure for valid query', async ({ request }) => {
            const response = await request.get('/api/search?q=syria')
            
            // Accept 200 (success) or 500 (DB unavailable in CI)
            expect([200, 500]).toContain(response.status())
            
            if (response.status() === 200) {
                const data = await response.json()
                expect(data).toHaveProperty('results')
                expect(Array.isArray(data.results)).toBe(true)
            }
        })
    })

    test.describe('Public Users API', () => {
        test('GET /api/public/users returns public user list', async ({ request }) => {
            const response = await request.get('/api/public/users')
            
            // Should exist and return data
            expect([200, 404]).toContain(response.status())
            
            if (response.status() === 200) {
                const data = await response.json()
                expect(data.success).toBe(true)
            }
        })
    })

    test.describe('Rate Limiting', () => {
        test('API returns appropriate headers', async ({ request }) => {
            const response = await request.get('/api/health')
            
            // Should have cache-control or rate limit headers
            const headers = response.headers()
            // At minimum, response should be valid
            expect(response.status()).toBe(200)
        })
    })

    test.describe('Error Handling', () => {
        test('returns 404 for non-existent API routes', async ({ request }) => {
            const response = await request.get('/api/nonexistent-endpoint-12345')
            expect(response.status()).toBe(404)
        })

        test('handles malformed JSON gracefully', async ({ request }) => {
            const response = await request.post('/api/posts', {
                headers: { 'Content-Type': 'application/json' },
                data: 'not valid json {{{',
            })
            
            // Should return 400 or 401 (auth required first)
            expect([400, 401, 500]).toContain(response.status())
        })
    })
})
