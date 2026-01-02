import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import BadgeDisplay from '@/components/BadgeDisplay'

describe('BadgeDisplay', () => {
    const mockBadges = [
        {
            id: '1',
            user_id: 'user-1',
            badge_id: 'badge-1',
            awarded_at: '2025-12-01',
            badge: {
                id: 'badge-1',
                name: 'Early Adopter',
                description: 'Joined during beta',
                icon_url: 'star',
                criteria: {},
                created_at: '2025-01-01',
            },
        },
        {
            id: '2',
            user_id: 'user-1',
            badge_id: 'badge-2',
            awarded_at: '2025-12-05',
            badge: {
                id: 'badge-2',
                name: 'First Post',
                description: 'Published first article',
                icon_url: 'check_circle',
                criteria: {},
                created_at: '2025-01-01',
            },
        },
    ]

    it('renders badges correctly', () => {
        render(<BadgeDisplay badges={mockBadges} />)

        // Check that badge tooltips contain the name and description
        expect(screen.getByText(/Early Adopter/)).toBeInTheDocument()
        expect(screen.getByText(/First Post/)).toBeInTheDocument()
    })

    it('renders empty state when no badges', () => {
        const { container } = render(<BadgeDisplay badges={[]} />)
        // Should render null (empty) when no badges
        expect(container.firstChild).toBeNull()
    })

    it('handles undefined badges gracefully', () => {
        const { container } = render(<BadgeDisplay badges={undefined as any} />)
        // Should render null when badges is undefined
        expect(container.firstChild).toBeNull()
    })

    it('renders different sizes', () => {
        const { rerender, container } = render(<BadgeDisplay badges={mockBadges} size="sm" />)
        expect(container.querySelector('.w-4')).toBeTruthy()

        rerender(<BadgeDisplay badges={mockBadges} size="lg" />)
        expect(container.querySelector('.w-8')).toBeTruthy()
    })
})
