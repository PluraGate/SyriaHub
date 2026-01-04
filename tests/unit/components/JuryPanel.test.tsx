/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JuryPanel } from '@/components/JuryPanel'
import { useToast } from '@/components/ui/toast'

// Mock dependencies
vi.mock('@/components/ui/toast', () => ({
    useToast: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => ({})),
}))

// Mock Dialog (simple implementation if using Radix UI which might need polyfills or mocking)
// Radix UI Dialog renders into a portal, which might form issues in jsdom if not mocked or handled.
// However, standard testing-library often handles it. But let's mock the UI components to simplify if needed.
// Actually, let's try to test with real UI components for better integration test value, 
// assuming Radix works in JSDOM (it usually does).

describe('JuryPanel Component', () => {
    const mockShowToast = vi.fn()
    const mockFetch = vi.fn()

    // Mock user
    const userId = 'user-123'

    const mockCases = [
        {
            id: 'case-1',
            deadline: new Date(Date.now() + 86400000).toISOString(), // 24h from now
            total_votes: 1,
            required_votes: 3,
            appeal: {
                dispute_reason: 'This is not spam.',
                post: {
                    title: 'Help Syria',
                    content: 'This is valuable content about Syria relief efforts.'
                }
            }
        },
        {
            id: 'case-2',
            deadline: new Date(Date.now() + 3600000).toISOString(), // 1h from now
            total_votes: 2,
            required_votes: 3,
            appeal: {
                dispute_reason: 'I disagree with the flag.',
                post: {
                    title: 'Urgent News',
                    content: 'Urgent updates...'
                }
            }
        }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
        global.fetch = mockFetch

        // Robust mock setup
        if (vi.isMockFunction(useToast)) {
            useToast.mockReturnValue({ showToast: mockShowToast })
        }
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('shows loading state initially', async () => {
        // Mock a pending promise
        mockFetch.mockReturnValue(new Promise(() => { }))

        render(<JuryPanel userId={userId} />)

        // Should find spinner or just general structure. 
        // Loader2 is usually used.
        // We can query by role or class if easier, or assume aria-hidden.
        // The component has <Loader2 /> in a div.
        // Let's verify it doesn't show "No Active Jury Cases" immediately.
        expect(screen.queryByText('No Active Jury Cases')).not.toBeInTheDocument()
    })

    it('renders empty state when no cases', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ cases: [] }),
        })

        render(<JuryPanel userId={userId} />)

        await waitFor(() => {
            expect(screen.getByText('No Active Jury Cases')).toBeInTheDocument()
            expect(screen.getByText(/You don't have any jury assignments/)).toBeInTheDocument()
        })
    })

    it('renders case cards successfully', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ cases: mockCases }),
        })

        render(<JuryPanel userId={userId} />)

        await waitFor(() => {
            expect(screen.getByText('Jury Duty')).toBeInTheDocument()
        })

        expect(screen.getByText('Help Syria')).toBeInTheDocument()
        expect(screen.getByText('Urgent News')).toBeInTheDocument()
        expect(screen.getAllByText('Appeal reason:')).toHaveLength(2)
    })

    it('opens voting dialog on click', async () => {
        const user = userEvent.setup()
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ cases: mockCases }),
        })

        render(<JuryPanel userId={userId} />)

        await waitFor(() => {
            expect(screen.getAllByText('Cast Vote')[0]).toBeInTheDocument()
        })

        // Click first case vote button
        await user.click(screen.getAllByText('Cast Vote')[0])

        // Verify dialog content
        expect(await screen.findByText('Cast Your Vote')).toBeInTheDocument()
        const dialog = screen.getByRole('dialog')
        expect(within(dialog).getByText('This is not spam.')).toBeInTheDocument()
    })

    it('allows voting workflow', async () => {
        const user = userEvent.setup()
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ cases: [mockCases[0]] }),
        })

        render(<JuryPanel userId={userId} />)

        // Open Dialog
        await waitFor(() => screen.getByText('Cast Vote'))
        await user.click(screen.getByText('Cast Vote'))

        // Select 'Overturn'
        const overturnBtn = screen.getByText('Overturn').closest('button')
        expect(overturnBtn).toBeInTheDocument()
        await user.click(overturnBtn!)

        // Check validation (submit disabled initially)
        const submitBtn = screen.getByRole('button', { name: /submit vote/i })
        expect(submitBtn).toBeDisabled()

        // Type short reason (should still be disabled)
        const reasonInput = screen.getByPlaceholderText(/provide your reasoning/i)
        await user.type(reasonInput, 'Short')
        expect(submitBtn).toBeDisabled()

        // Type long reason
        await user.clear(reasonInput)
        await user.type(reasonInput, 'This is a valid reasoning that meets the minimum twenty characters requirement.')
        expect(submitBtn).toBeEnabled()

        // Submit
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Vote submitted' }),
        })

        await user.click(submitBtn)

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith('Vote submitted', 'success')
        })

        // Should close dialog and refresh cases
        expect(screen.queryByText('Cast Your Vote')).not.toBeInTheDocument()
        expect(mockFetch).toHaveBeenCalledTimes(3) // Initial load + Submit + Refresh
    })

    it('handles submission error', async () => {
        const user = userEvent.setup()
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ cases: [mockCases[0]] }),
        })

        render(<JuryPanel userId={userId} />)

        // Open Dialog
        await waitFor(() => screen.getByText('Cast Vote'))
        await user.click(screen.getByText('Cast Vote'))

        // Fill form
        await user.click(screen.getByText('Uphold Flag').closest('button')!)
        const reasonInput = screen.getByPlaceholderText(/provide your reasoning/i)
        await user.type(reasonInput, 'This content definitely violates the community guidelines as explained here.')

        // Mock error on submit
        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Database error' }),
        })

        const submitBtn = screen.getByRole('button', { name: /submit vote/i })
        await user.click(submitBtn)

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith('Database error', 'error')
        })

        // Dialog should remain open
        expect(screen.getByText('Cast Your Vote')).toBeInTheDocument()
    })
})
