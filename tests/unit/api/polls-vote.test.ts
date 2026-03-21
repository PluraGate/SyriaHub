import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// ── Supabase mock ────────────────────────────────────────────────────────────
const mockGetUser = vi.fn()
const mockSingle = vi.fn()
const mockUpsert = vi.fn()

// Chain-builder: each method returns the builder so calls can be chained, and
// the terminal call (single / upsert) resolves the actual mock value.
function makeChain() {
    const chain: any = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: mockSingle,
        upsert: mockUpsert,
    }
    return chain
}

const mockFrom = vi.fn(() => makeChain())

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() =>
        Promise.resolve({
            auth: { getUser: mockGetUser },
            from: mockFrom,
        })
    ),
}))

// ── Rate-limit mock (always allow) ──────────────────────────────────────────
vi.mock('@/lib/rateLimit', () => ({
    withRateLimit: (_type: string) => (handler: (...args: unknown[]) => unknown) => handler,
}))

// ── Turnstile mock ───────────────────────────────────────────────────────────
const mockVerifyTurnstileToken = vi.fn()
vi.mock('@/lib/turnstile', () => ({
    verifyTurnstileToken: mockVerifyTurnstileToken,
}))

// ── apiUtils mock ────────────────────────────────────────────────────────────
const mockValidateOrigin = vi.fn()
vi.mock('@/lib/apiUtils', () => ({
    validateOrigin: mockValidateOrigin,
}))

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
    return new NextRequest('http://localhost:3000/api/polls/poll-1/vote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            origin: 'http://localhost:3000',
            ...headers,
        },
        body: JSON.stringify(body),
    })
}

const params = Promise.resolve({ id: 'poll-1' })

// Lazy import after mocks are set up
async function callPost(request: NextRequest) {
    const { POST } = await import('@/app/api/polls/[id]/vote/route')
    return POST(request, { params })
}

// ── Fixture data ─────────────────────────────────────────────────────────────
const basePoll = {
    id: 'poll-1',
    is_active: true,
    end_date: null,
    is_multiple_choice: false,
    options: [
        { id: 'opt-a', text: 'Option A' },
        { id: 'opt-b', text: 'Option B' },
    ],
}

const mockAuthUser = { id: 'user-123', email: 'test@example.com' }

// ── Tests ────────────────────────────────────────────────────────────────────
describe('POST /api/polls/[id]/vote', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Default: origin is valid, user is authenticated
        mockValidateOrigin.mockReturnValue(true)
        mockGetUser.mockResolvedValue({ data: { user: mockAuthUser }, error: null })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('returns 403 when validateOrigin returns false', async () => {
        mockValidateOrigin.mockReturnValue(false)

        const req = makeRequest({ option_ids: ['opt-a'] })
        const res = await callPost(req)

        expect(res.status).toBe(403)
        const body = await res.json()
        expect(body.error).toMatch(/origin/i)
    })

    it('returns 401 when user is not authenticated', async () => {
        mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') })

        const req = makeRequest({ option_ids: ['opt-a'] })
        const res = await callPost(req)

        expect(res.status).toBe(401)
        const body = await res.json()
        expect(body.error).toMatch(/unauthorized/i)
    })

    it('returns 400 when option_ids is missing', async () => {
        const req = makeRequest({})
        const res = await callPost(req)

        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.error).toBeTruthy()
    })

    it('returns 400 when option_ids is an empty array', async () => {
        const req = makeRequest({ option_ids: [] })
        const res = await callPost(req)

        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.error).toBeTruthy()
    })

    it('returns 404 when poll is not found', async () => {
        // First single() call returns poll not found
        mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })

        const req = makeRequest({ option_ids: ['opt-a'] })
        const res = await callPost(req)

        expect(res.status).toBe(404)
        const body = await res.json()
        expect(body.error).toMatch(/not found/i)
    })

    it('returns 400 when poll is not active', async () => {
        mockSingle.mockResolvedValueOnce({
            data: { ...basePoll, is_active: false },
            error: null,
        })

        const req = makeRequest({ option_ids: ['opt-a'] })
        const res = await callPost(req)

        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.error).toMatch(/active/i)
    })

    it('returns 400 when poll has ended (end_date in the past)', async () => {
        const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
        mockSingle.mockResolvedValueOnce({
            data: { ...basePoll, end_date: pastDate },
            error: null,
        })

        const req = makeRequest({ option_ids: ['opt-a'] })
        const res = await callPost(req)

        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.error).toMatch(/ended/i)
    })

    it('returns 400 when an invalid option_id is submitted', async () => {
        mockSingle.mockResolvedValueOnce({ data: basePoll, error: null })

        const req = makeRequest({ option_ids: ['opt-does-not-exist'] })
        const res = await callPost(req)

        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.error).toMatch(/invalid option/i)
    })

    it('returns 400 when multiple options selected on a single-choice poll', async () => {
        mockSingle.mockResolvedValueOnce({
            data: { ...basePoll, is_multiple_choice: false },
            error: null,
        })

        const req = makeRequest({ option_ids: ['opt-a', 'opt-b'] })
        const res = await callPost(req)

        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.error).toMatch(/one option/i)
    })

    it('returns 200 with updated poll on successful vote', async () => {
        const updatedPoll = { ...basePoll, total_votes: 1 }

        // First single() — fetch poll
        mockSingle.mockResolvedValueOnce({ data: basePoll, error: null })
        // upsert — record vote
        mockUpsert.mockResolvedValueOnce({ error: null })
        // Second single() — fetch updated poll
        mockSingle.mockResolvedValueOnce({ data: updatedPoll, error: null })

        const req = makeRequest({ option_ids: ['opt-a'] })
        const res = await callPost(req)

        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.success).toBe(true)
        expect(body.poll).toBeDefined()
    })

    it('accepts multiple options on a multiple-choice poll', async () => {
        const multiPoll = { ...basePoll, is_multiple_choice: true }
        const updatedPoll = { ...multiPoll, total_votes: 1 }

        mockSingle.mockResolvedValueOnce({ data: multiPoll, error: null })
        mockUpsert.mockResolvedValueOnce({ error: null })
        mockSingle.mockResolvedValueOnce({ data: updatedPoll, error: null })

        const req = makeRequest({ option_ids: ['opt-a', 'opt-b'] })
        const res = await callPost(req)

        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.success).toBe(true)
    })
})
