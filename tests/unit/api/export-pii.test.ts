/**
 * Export PII regression guard
 *
 * These tests ensure that user email addresses are NEVER included in any
 * exported format. The Supabase query in the export route explicitly selects
 * only `users.name` (not `email`), but this suite acts as a safety net to
 * catch any future accidental inclusion.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Supabase mock ────────────────────────────────────────────────────────────
// Simulate a worst-case scenario where the DB accidentally returns an email
// field inside the author object (e.g., if the select query were widened).
const mockSingle = vi.fn()

function makeChain() {
    const chain: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: mockSingle,
    }
    return chain
}

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() =>
        Promise.resolve({
            from: vi.fn(() => makeChain()),
        })
    ),
}))

// ── Rate-limit mock (always allow) ──────────────────────────────────────────
vi.mock('@/lib/rateLimit', () => ({
    withRateLimit: (_type: string) => (handler: Function) => handler,
}))

// ── Fixture ──────────────────────────────────────────────────────────────────
const AUTHOR_EMAIL = 'test@example.com'
const AUTHOR_NAME = 'Test Author'

// Simulated post that accidentally includes email in the author join.
// In reality the route only selects `name`, but we set up the mock to return
// both fields to prove that even if the DB leaked email the export omits it.
const mockPost = {
    id: 'post-export-1',
    title: 'Research on Syria',
    content: 'Some research content here.',
    tags: ['syria', 'research'],
    created_at: '2026-01-15T10:00:00.000Z',
    updated_at: '2026-01-15T10:00:00.000Z',
    content_type: 'article',
    license: 'CC-BY-4.0',
    author: { name: AUTHOR_NAME, email: AUTHOR_EMAIL },
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeRequest(format: string): NextRequest {
    return new NextRequest(
        `http://localhost:3000/api/export?id=post-export-1&format=${format}`,
        { method: 'GET' }
    )
}

async function callGet(request: NextRequest) {
    const { GET } = await import('@/app/api/export/route')
    return GET(request)
}

async function getResponseText(res: Response): Promise<string> {
    // Response body may be JSON or plain text/binary depending on format
    const buffer = await res.arrayBuffer()
    return new TextDecoder().decode(buffer)
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe('Export API — PII regression guard', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Return the mock post (with email in author) for every test
        mockSingle.mockResolvedValue({ data: mockPost, error: null })
    })

    const formats = ['markdown', 'json', 'bibtex', 'ris'] as const

    for (const format of formats) {
        describe(`format: ${format}`, () => {
            it(`does NOT include the author email in ${format} output`, async () => {
                const req = makeRequest(format)
                const res = await callGet(req)

                expect(res.status).toBe(200)

                const body = await getResponseText(res)
                expect(body).not.toContain(AUTHOR_EMAIL)
            })

            it(`DOES include the author name in ${format} output`, async () => {
                const req = makeRequest(format)
                const res = await callGet(req)

                expect(res.status).toBe(200)

                const body = await getResponseText(res)
                expect(body).toContain(AUTHOR_NAME)
            })
        })
    }

    it('returns 400 when no post ID is provided', async () => {
        const req = new NextRequest('http://localhost:3000/api/export?format=markdown', {
            method: 'GET',
        })
        const res = await callGet(req)

        expect(res.status).toBe(400)
    })

    it('returns 404 when post is not found', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })

        const req = makeRequest('markdown')
        const res = await callGet(req)

        expect(res.status).toBe(404)
    })
})
